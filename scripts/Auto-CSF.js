(async () => {
    const URL = 'https://cs.signal.army.mil/UserMngmt/CyberFundamentals/lessons/CsfPretestSubmit.asp';
    const form = document.querySelector('form[name="CSFpretest"]');
    const Q = 10;
    const t0 = performance.now();
    let reqs = 0;

    const radioGroups = Array.from({length: Q}, (_, i) =>
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

    // Phase 1: uniform baselines + Hadamard-orthogonal binary separators
    const separators = [];
    for (let bit = 0; bit < Math.ceil(Math.log2(Q)); bit++) {
        separators.push(Array.from({length: Q}, (_, i) => ((i >> bit) & 1) + 1));
    }

    const patterns = [
        [1,1,1,1,1,1,1,1,1,1], [2,2,2,2,2,2,2,2,2,2],
        [3,3,3,3,3,3,3,3,3,3], [4,4,4,4,4,4,4,4,4,4],
        ...separators,
    ];

    const capped = patterns.map(p => p.map((v, i) => Math.min(v, opts[i])));
    const scores = await Promise.all(capped.map(c => submit(c)));

    const perfectIdx = scores.indexOf(Q);
    if (perfectIdx !== -1) {
        capped[perfectIdx].forEach((v, i) => {
            if (radioGroups[i][v - 1]) radioGroups[i][v - 1].checked = true;
        });
        console.log(`🏆 [${capped[perfectIdx].join(',')}] | ${reqs} reqs, ${(performance.now() - t0).toFixed(0)}ms (perfect on pattern ${perfectIdx})`);
        return;
    }

    // Phase 2: backtracking solver with MCV ordering + tight per-pattern future bounds
    function solve(caps, S, limit) {
        const R = caps.length;
        const found = [];

        const matchTable = Array.from({length: Q}, (_, qi) => {
            const byG = {};
            for (let r = 0; r < R; r++) {
                const key = caps[r][qi];
                (byG[key] ??= []).push(r);
            }
            return byG;
        });

        // MCV heuristic: process most-constrained questions first
        const order = Array.from({length: Q}, (_, i) => i)
            .sort((a, b) => Object.keys(matchTable[a]).length - Object.keys(matchTable[b]).length);
        const orderedMatch = order.map(i => matchTable[i]);
        const orderedOpts = order.map(i => opts[i]);

        // Tight upper bound: exact max future matches per pattern from each depth
        const maxFuture = Array.from({length: R}, (_, r) => {
            const arr = new Uint8Array(Q + 1);
            for (let d = Q - 1; d >= 0; d--) {
                arr[d] = arr[d + 1] + (caps[r][order[d]] <= orderedOpts[d] ? 1 : 0);
            }
            return arr;
        });

        const cur = new Uint8Array(Q);
        const counts = new Uint8Array(R);

        (function bt(depth) {
            if (found.length >= limit) return;
            if (depth === Q) {
                for (let r = 0; r < R; r++) if (counts[r] !== S[r]) return;
                const result = new Array(Q);
                for (let d = 0; d < Q; d++) result[order[d]] = cur[d];
                found.push(result);
                return;
            }
            for (let g = 1; g <= orderedOpts[depth]; g++) {
                cur[depth] = g;
                const matched = orderedMatch[depth][g] || [];
                for (let m = 0; m < matched.length; m++) counts[matched[m]]++;

                let ok = true;
                for (let r = 0; r < R; r++) {
                    if (counts[r] > S[r] || counts[r] + maxFuture[r][depth + 1] < S[r]) {
                        ok = false;
                        break;
                    }
                }
                if (ok) bt(depth + 1);

                for (let m = 0; m < matched.length; m++) counts[matched[m]]--;
            }
            cur[depth] = 0;
        })(0);

        return found;
    }

    let sols = solve(capped, scores, 10);

    if (!sols.length) {
        console.error(`❌ No consistent solution found after ${reqs} reqs, ${(performance.now() - t0).toFixed(0)}ms — server may be non-deterministic.`);
        return;
    }

    // Phase 3: disambiguate with optimal probe selection
    function bestProbe(sols) {
        const majority = Array.from({length: Q}, (_, j) => {
            const freq = {};
            for (const s of sols) freq[s[j]] = (freq[s[j]] || 0) + 1;
            return +Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];
        });

        const candidates = [...sols, majority];
        let best = null, bestWorst = Infinity;
        for (const candidate of candidates) {
            const groups = {};
            for (const s of sols) {
                let c = 0;
                for (let j = 0; j < Q; j++) if (candidate[j] === s[j]) c++;
                groups[c] = (groups[c] || 0) + 1;
            }
            const worst = Math.max(...Object.values(groups));
            if (worst < bestWorst) { bestWorst = worst; best = candidate; }
        }
        return best.map((v, i) => Math.min(v, opts[i]));
    }

    while (sols.length > 1) {
        const cp = bestProbe(sols);
        const ds = await submit(cp);
        sols = sols.filter(s => {
            let c = 0;
            for (let j = 0; j < Q; j++) if (cp[j] === s[j]) c++;
            return c === ds;
        });
        if (!sols.length) {
            console.error(`❌ Disambiguation failed — no solutions remain after ${reqs} reqs, ${(performance.now() - t0).toFixed(0)}ms`);
            return;
        }
    }

    sols[0].forEach((v, i) => {
        if (radioGroups[i][v - 1]) radioGroups[i][v - 1].checked = true;
    });

    console.log(`🏆 [${sols[0].join(',')}] | ${reqs} reqs, ${(performance.now() - t0).toFixed(0)}ms`);
})();
