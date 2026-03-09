(async () => {
    const SUBMIT_URL = 'https://cs.signal.army.mil/UserMngmt/CyberFundamentals/lessons/CsfPretestSubmit.asp';
    const form = document.querySelector('form[name="CSFpretest"]');
    const Q = 10;
    const UNSET = 0xFFFFFFFF;
    const NUM_PROBES = 7;
    const t0 = performance.now();
    let reqs = 0;

    const radioGroups = Array.from({ length: Q }, (_, i) =>
        form.querySelectorAll(`input[name="selAnswer${i}"]`)
    );
    const opts = radioGroups.map(r => r.length);
    const N = opts.reduce((a, b) => a * b, 1);
    const maxO = Math.max(...opts);

    async function submit(ans) {
        reqs++;
        const r = await fetch(SUBMIT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: ans.map((v, i) => `selAnswer${i}=${v}`).join('&'),
            credentials: 'include'
        });
        const m = (await r.text()).match(/score of (\d+)%/);
        return m ? +m[1] / 10 : -1;
    }

    function finish(answer, note) {
        answer.forEach((v, i) => {
            if (radioGroups[i][v - 1]) radioGroups[i][v - 1].checked = true;
        });
        console.log(`🏆 [${answer}] | ${reqs} reqs, ${(performance.now() - t0).toFixed(0)}ms ${note || ''}`);
    }

    // ── Phase 0: Enumerate Candidates ───────────────────────────────────
    const flat = new Uint8Array(N * Q);
    let fi = 0;
    (function gen(d, ans) {
        if (d === Q) { flat.set(ans, fi * Q); fi++; return; }
        for (let g = 1; g <= opts[d]; g++) { ans[d] = g; gen(d + 1, ans); }
    })(0, new Uint8Array(Q));

    // ── Phase 1a: Build Probe Pool ──────────────────────────────────────
    const pool = [];
    for (let v = 1; v <= maxO; v++)
        pool.push(new Uint8Array(Array(Q).fill(v)));
    for (let m = 2; m <= maxO; m++)
        for (let o = 0; o < m; o++)
            pool.push(new Uint8Array(Array.from({ length: Q }, (_, i) => ((i + o) % m) + 1)));
    for (let b = 1; b <= 5; b++)
        pool.push(new Uint8Array(Array.from({ length: Q }, (_, i) => (Math.floor(i / b) % maxO) + 1)));
    for (let s = 0; s < 20; s++)
        pool.push(new Uint8Array(Array.from({ length: Q }, (_, j) => ((s * 7 + j * 13 + s * j * 3) % opts[j]) + 1)));
    const sampleStep = Math.max(1, Math.floor(N / 20));
    for (let i = 0; i < N; i += sampleStep)
        pool.push(flat.slice(i * Q, i * Q + Q));
    const P = pool.length;

    // ── Phase 1b: Precompute Score Vectors ──────────────────────────────
    const scoreVecs = new Array(P);
    for (let p = 0; p < P; p++) {
        const pr = pool[p];
        const p0=pr[0],p1=pr[1],p2=pr[2],p3=pr[3],p4=pr[4],
              p5=pr[5],p6=pr[6],p7=pr[7],p8=pr[8],p9=pr[9];
        const sv = new Uint8Array(N);
        for (let c = 0; c < N; c++) {
            const o = c * 10;
            sv[c] = (flat[o]===p0)+(flat[o+1]===p1)+(flat[o+2]===p2)+
                    (flat[o+3]===p3)+(flat[o+4]===p4)+(flat[o+5]===p5)+
                    (flat[o+6]===p6)+(flat[o+7]===p7)+(flat[o+8]===p8)+
                    (flat[o+9]===p9);
        }
        scoreVecs[p] = sv;
    }

    // ── Phase 1c: Select Optimal Probes ─────────────────────────────────
    const maxBucket = N * 11 + 11;
    const buckets = new Uint32Array(maxBucket);
    const tch = new Uint32Array(maxBucket);
    const remapArr = new Uint32Array(maxBucket);
    remapArr.fill(UNSET);
    const sigId = new Uint32Array(N);
    const probes = [];

    for (let step = 0; step < NUM_PROBES; step++) {
        let bestPI = -1, bestScore = -1;
        for (let pi = 0; pi < P; pi++) {
            const sv = scoreVecs[pi];
            let tLen = 0, distinct = 0, mx = 0;
            for (let c = 0; c < N; c++) {
                const k = sigId[c] * 11 + sv[c];
                if (buckets[k] === 0) { tch[tLen++] = k; distinct++; }
                buckets[k]++;
            }
            for (let t = 0; t < tLen; t++) {
                if (buckets[tch[t]] > mx) mx = buckets[tch[t]];
                buckets[tch[t]] = 0;
            }
            const s = distinct * 10000 - mx;
            if (s > bestScore) { bestScore = s; bestPI = pi; }
        }
        const sv = scoreVecs[bestPI];
        let newId = 0, rtLen = 0;
        for (let c = 0; c < N; c++) {
            const k = sigId[c] * 11 + sv[c];
            if (remapArr[k] === UNSET) { remapArr[k] = newId++; tch[rtLen++] = k; }
            sigId[c] = remapArr[k];
        }
        for (let t = 0; t < rtLen; t++) remapArr[tch[t]] = UNSET;
        probes.push(pool[bestPI]);
    }

    console.log(`⚙️ Compute: ${(performance.now() - t0).toFixed(0)}ms | pool=${P}, N=${N}`);

    // ── Phase 2: Submit Probes ──────────────────────────────────────────
    const capped = probes.map(p => Array.from(p, (v, i) => Math.min(v, opts[i])));
    const scores = await Promise.all(capped.map(c => submit(c)));

    const perfectIdx = scores.indexOf(Q);
    if (perfectIdx !== -1) return finish(capped[perfectIdx], '(probe hit)');

    // ── Phase 3: Filter Candidates ──────────────────────────────────────
    let sols = [];
    for (let c = 0; c < N; c++) {
        let match = true;
        const off = c * 10;
        for (let r = 0; r < NUM_PROBES; r++) {
            const pr = capped[r];
            const s = (flat[off]===pr[0])+(flat[off+1]===pr[1])+(flat[off+2]===pr[2])+
                      (flat[off+3]===pr[3])+(flat[off+4]===pr[4])+(flat[off+5]===pr[5])+
                      (flat[off+6]===pr[6])+(flat[off+7]===pr[7])+(flat[off+8]===pr[8])+
                      (flat[off+9]===pr[9]);
            if (s !== scores[r]) { match = false; break; }
        }
        if (match) sols.push(c);
    }

    if (!sols.length) return console.error('❌ No candidates — server may be non-deterministic');

    // ── Phase 4: Disambiguate ───────────────────────────────────────────
    while (sols.length > 1) {
        let bestP = -1;
        for (const p of sols) {
            const seen = new Set();
            let dup = false;
            for (const c of sols) {
                let s = 0;
                for (let i = 0; i < 10; i++) if (flat[c*Q+i] === flat[p*Q+i]) s++;
                if (seen.has(s)) { dup = true; break; }
                seen.add(s);
            }
            if (!dup) { bestP = p; break; }
        }
        if (bestP === -1) {
            for (let p = 0; p < N; p++) {
                const seen = new Set();
                let dup = false;
                for (const c of sols) {
                    let s = 0;
                    for (let i = 0; i < 10; i++) if (flat[c*Q+i] === flat[p*Q+i]) s++;
                    if (seen.has(s)) { dup = true; break; }
                    seen.add(s);
                }
                if (!dup) { bestP = p; break; }
            }
        }

        const dp = Array.from({ length: Q }, (_, i) => Math.min(flat[bestP * Q + i], opts[i]));
        const ds = await submit(dp);

        if (ds === Q) return finish(dp, '(disambig hit)');

        sols = sols.filter(c => {
            let s = 0, off = c * Q;
            for (let i = 0; i < 10; i++) if (flat[off + i] === dp[i]) s++;
            return s === ds;
        });

        if (!sols.length) return console.error('❌ Disambiguation failed');
    }

    // ── Phase 5: Populate Form ──────────────────────────────────────────
    const ansOff = sols[0] * Q;
    finish(Array.from({ length: Q }, (_, i) => flat[ansOff + i]));
})();
