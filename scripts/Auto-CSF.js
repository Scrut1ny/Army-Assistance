(async () => {
    // ════════════════════════════════════════════════════════════════════
    //  Setup — form detection, radio groups, and submit function
    // ════════════════════════════════════════════════════════════════════
    const URL = 'https://cs.signal.army.mil/UserMngmt/CyberFundamentals/lessons/CsfPretestSubmit.asp';
    const form = document.querySelector('form[name="CSFpretest"]');
    const Q = 10;
    const t0 = performance.now();
    let reqs = 0;

    const radioGroups = Array.from({ length: Q }, (_, i) =>
        form.querySelectorAll(`input[name="selAnswer${i}"]`)
    );
    const opts = radioGroups.map(r => r.length);

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

    function sc(a, b) {
        let c = 0;
        for (let i = 0; i < Q; i++) if (a[i] === b[i]) c++;
        return c;
    }

    // ════════════════════════════════════════════════════════════════════
    //  Phase 0 — Enumerate all possible answer combinations
    // ════════════════════════════════════════════════════════════════════
    const allCands = [];
    (function gen(d, ans) {
        if (d === Q) { allCands.push(ans.slice()); return; }
        for (let g = 1; g <= opts[d]; g++) { ans[d] = g; gen(d + 1, ans); }
    })(0, new Array(Q));
    const N = allCands.length;

    // ════════════════════════════════════════════════════════════════════
    //  Phase 1 — Build diverse probe pool & greedy-select 6 optimal probes
    // ════════════════════════════════════════════════════════════════════
    const pool = [];
    const maxO = Math.max(...opts);

    // Uniform probes: all-1s, all-2s, etc.
    for (let v = 1; v <= maxO; v++) pool.push(Array(Q).fill(v));

    // Modular cycling probes
    for (let m = 2; m <= maxO; m++)
        for (let o = 0; o < m; o++)
            pool.push(Array.from({ length: Q }, (_, i) => ((i + o) % m) + 1));

    // Block pattern probes
    for (let b = 1; b <= 5; b++)
        pool.push(Array.from({ length: Q }, (_, i) => (Math.floor(i / b) % maxO) + 1));

    // Hash-distributed probes
    for (let s = 0; s < 150; s++)
        pool.push(Array.from({ length: Q }, (_, j) => ((s * 7 + j * 13 + s * j * 3) % opts[j]) + 1));

    // Sampled candidates from the full space
    const sampleStep = Math.max(1, Math.floor(N / 100));
    for (let i = 0; i < N; i += sampleStep) pool.push(allCands[i]);

    // Precompute score vectors: score of every pool probe against every candidate
    const P = pool.length;
    const scoreVecs = new Array(P);
    for (let p = 0; p < P; p++) {
        scoreVecs[p] = new Uint8Array(N);
        for (let c = 0; c < N; c++) scoreVecs[p][c] = sc(pool[p], allCands[c]);
    }

    // Greedy selection: pick probe that maximizes signature partitions (base-11 hashing)
    const probes = [];
    const curSig = new Int32Array(N);
    for (let step = 0; step < 6; step++) {
        let bestPI = -1, bestScore = -1;
        for (let pi = 0; pi < P; pi++) {
            const sv = scoreVecs[pi];
            const g = new Map();
            for (let c = 0; c < N; c++) {
                const k = curSig[c] * 11 + sv[c];
                g.set(k, (g.get(k) || 0) + 1);
            }
            let mx = 0;
            for (const v of g.values()) if (v > mx) mx = v;
            const s = g.size * 10000 - mx;
            if (s > bestScore) { bestScore = s; bestPI = pi; }
        }
        probes.push(pool[bestPI]);
        const sv = scoreVecs[bestPI];
        for (let c = 0; c < N; c++) curSig[c] = curSig[c] * 11 + sv[c];
    }

    console.log(`⚙️ Probe computation: ${(performance.now() - t0).toFixed(0)}ms, pool=${P}, N=${N}`);

    // ════════════════════════════════════════════════════════════════════
    //  Phase 2 — Send 6 probes in parallel & check for lucky perfect hit
    // ════════════════════════════════════════════════════════════════════
    const capped = probes.map(p => p.map((v, i) => Math.min(v, opts[i])));
    const scores = await Promise.all(capped.map(c => submit(c)));

    const perfectIdx = scores.indexOf(Q);
    if (perfectIdx !== -1) {
        capped[perfectIdx].forEach((v, i) => {
            if (radioGroups[i][v - 1]) radioGroups[i][v - 1].checked = true;
        });
        console.log(`🏆 [${capped[perfectIdx].join(',')}] | ${reqs} reqs, ${(performance.now() - t0).toFixed(0)}ms (perfect hit on probe ${perfectIdx})`);
        return;
    }

    // ════════════════════════════════════════════════════════════��═══════
    //  Phase 3 — Filter candidates matching all 6 returned scores
    // ════════════════════════════════════════════════════════════════════
    let sols = allCands.filter(c =>
        capped.every((p, r) => sc(c, p) === scores[r])
    );

    if (!sols.length) {
        console.error(`❌ No solutions after ${reqs} reqs, ${(performance.now() - t0).toFixed(0)}ms — server may be non-deterministic.`);
        return;
    }

    console.log(`🔍 ${sols.length} candidate(s) after 6 probes`);

    // ════════════════════════════════════════════════════════════════════
    //  Phase 4 — Disambiguate (if needed): find perfect disambiguator
    //            from all N candidates with early exit (~0ms)
    // ════════════════════════════════════════════════════════════════════
    while (sols.length > 1) {
        // Search for a probe that gives every remaining candidate a unique score
        let bestP = null, bestW = sols.length;
        for (const p of allCands) {
            const seen = new Set();
            let dup = false;
            for (const c of sols) {
                const s = sc(c, p);
                if (seen.has(s)) { dup = true; break; }
                seen.add(s);
            }
            if (!dup) { bestP = p; bestW = 1; break; }
        }

        // Fallback: if no perfect disambiguator, pick the one with smallest worst-case group
        if (bestW > 1) {
            for (const p of allCands) {
                const g = {};
                for (const c of sols) { const s = sc(c, p); g[s] = (g[s] || 0) + 1; }
                const w = Math.max(...Object.values(g));
                if (w < bestW) { bestW = w; bestP = p; }
            }
        }

        const dp = bestP.map((v, i) => Math.min(v, opts[i]));
        const ds = await submit(dp);
        sols = sols.filter(c => sc(c, dp) === ds);

        if (!sols.length) {
            console.error(`❌ Disambiguation failed after ${reqs} reqs, ${(performance.now() - t0).toFixed(0)}ms`);
            return;
        }
        console.log(`🔍 ${sols.length} candidate(s) remain after disambiguator`);
    }

    // ════════════════════════════════════════════════════════════════════
    //  Phase 5 — Submit final answer, fill form, and report results
    // ════════════════════════════════════════════════════════════════════
    const answer = sols[0];
    const finalScore = await submit(answer);

    answer.forEach((v, i) => {
        if (radioGroups[i][v - 1]) radioGroups[i][v - 1].checked = true;
    });

    console.log(`🏆 [${answer.join(',')}] score=${finalScore * 10}% | ${reqs} reqs, ${(performance.now() - t0).toFixed(0)}ms`);
})();
