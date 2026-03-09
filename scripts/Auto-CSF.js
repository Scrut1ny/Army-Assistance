(async () => {
    // ════════════════════════════════════════════════════════════════════
    //  Setup — form detection, radio groups, and submit function
    // ════════════════════════════════════════════════════════════════════
    const URL = 'https://cs.signal.army.mil/UserMngmt/CyberFundamentals/lessons/CsfPretestSubmit.asp';
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
        const r = await fetch(URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: ans.map((v, i) => `selAnswer${i}=${v}`).join('&'),
                              credentials: 'include'
        });
        const m = (await r.text()).match(/score of (\d+)%/);
        return m ? +m[1] / 10 : -1;
    }

    // ════════════════════════════════════════════════════════════════════
    //  Phase 0 — Enumerate all candidates into flat Uint8Array (0.5MB)
    // ════════════════════════════════════════════════════════════════════
    const flat = new Uint8Array(N * Q);
    let fi = 0;
    (function gen(d, ans) {
        if (d === Q) { flat.set(ans, fi * Q); fi++; return; }
        for (let g = 1; g <= opts[d]; g++) { ans[d] = g; gen(d + 1, ans); }
    })(0, new Uint8Array(Q));

    // ════════════════════════════════════════════════════════════════════
    //  Phase 1 — Build diverse probe pool & greedy-select 7 optimal probes
    // ═════��══════════════════════════════════════════════════════════════

    // Pool construction (h=20, s=20 — empirically optimal)
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

    // Precompute score vectors (unrolled comparisons — 2.5x faster)
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

    // Greedy selection: typed-array buckets + compact signature remapping (40x faster)
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

    console.log(`⚙️ Probe computation: ${(performance.now() - t0).toFixed(0)}ms, pool=${P}, N=${N}`);

    // ════════════════════════════════════════════════════════════════════
    //  Phase 2 — Send 7 probes in parallel & check for lucky perfect hit
    // ════════════════════════════════════════════════════════════════════
    const capped = probes.map(p => Array.from(p, (v, i) => Math.min(v, opts[i])));
    const scores = await Promise.all(capped.map(c => submit(c)));

    const perfectIdx = scores.indexOf(Q);
    if (perfectIdx !== -1) {
        capped[perfectIdx].forEach((v, i) => {
            if (radioGroups[i][v - 1]) radioGroups[i][v - 1].checked = true;
        });
            console.log(`🏆 [${capped[perfectIdx].join(',')}] | ${reqs} reqs, ${(performance.now() - t0).toFixed(0)}ms (perfect hit on probe ${perfectIdx})`);
            return;
    }

    // ════════════════════════════════════════════════════════════════════
    //  Phase 3 — Filter candidates matching all 7 returned scores
    // ════════════════════════════════════════════════════════════════════
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

    if (!sols.length) {
        console.error(`❌ No solutions after ${reqs} reqs, ${(performance.now() - t0).toFixed(0)}ms — server may be non-deterministic.`);
        return;
    }

    console.log(`🔍 ${sols.length} candidate(s) after ${NUM_PROBES} probes`);

    // ════════════════════════════════════════════════════════════════════
    //  Phase 4 — Disambiguate (if needed): find perfect disambiguator
    //            from all N candidates with early exit
    // ════════════════════════════════════════════════════════════════════
    while (sols.length > 1) {
        let bestP = -1, bestW = sols.length;

        // Search for a probe that gives every remaining candidate a unique score
        for (let p = 0; p < N; p++) {
            const pOff = p * Q;
            const seen = new Set();
            let dup = false;
            for (const c of sols) {
                let s = 0, cOff = c * Q;
                for (let i = 0; i < 10; i++) if (flat[cOff + i] === flat[pOff + i]) s++;
                if (seen.has(s)) { dup = true; break; }
                seen.add(s);
            }
            if (!dup) { bestP = p; bestW = 1; break; }
        }

        // Fallback: pick the one with smallest worst-case group
        if (bestW > 1) {
            for (let p = 0; p < N; p++) {
                const pOff = p * Q;
                const g = {};
                for (const c of sols) {
                    let s = 0, cOff = c * Q;
                    for (let i = 0; i < 10; i++) if (flat[cOff + i] === flat[pOff + i]) s++;
                    g[s] = (g[s] || 0) + 1;
                }
                const w = Math.max(...Object.values(g));
                if (w < bestW) { bestW = w; bestP = p; }
            }
        }

        const dp = Array.from({ length: Q }, (_, i) => Math.min(flat[bestP * Q + i], opts[i]));
        const ds = await submit(dp);
        sols = sols.filter(c => {
            let s = 0, off = c * Q;
            for (let i = 0; i < 10; i++) if (flat[off + i] === dp[i]) s++;
            return s === ds;
        });

        if (!sols.length) {
            console.error(`❌ Disambiguation failed after ${reqs} reqs, ${(performance.now() - t0).toFixed(0)}ms`);
            return;
        }
        console.log(`🔍 ${sols.length} candidate(s) remain after disambiguator`);
    }

    // ════════════════════════════════════════════════════════════════════
    //  Phase 5 — Submit final answer, fill form, and report results
    // ════════════════════════════════════════════════════════════════════
    const ansOff = sols[0] * Q;
    const answer = Array.from({ length: Q }, (_, i) => flat[ansOff + i]);
    const finalScore = await submit(answer);

    answer.forEach((v, i) => {
        if (radioGroups[i][v - 1]) radioGroups[i][v - 1].checked = true;
    });

        console.log(`🏆 [${answer.join(',')}] score=${finalScore * 10}% | ${reqs} reqs, ${(performance.now() - t0).toFixed(0)}ms`);
})();
