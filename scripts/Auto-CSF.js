(async () => {
    const URL = 'https://cs.signal.army.mil/UserMngmt/CyberFundamentals/lessons/CsfPretestSubmit.asp';
    const form = document.querySelector('form[name="CSFpretest"]');
    const Q = 10;
    const t0 = performance.now();
    let reqs = 0;

    const opts = Array.from({length: Q}, (_, i) =>
        form.querySelectorAll(`input[name="selAnswer${i}"]`).length
    );

    async function submit(ans) {
        reqs++;
        const r = await fetch(URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: ans.map((v, i) => `selAnswer${i}=${v}`).join('&'),
            credentials: 'include'
        });
        const m = (await r.text()).match(/score of (\d+)%/);
        return m ? parseInt(m[1]) / 10 : -1;
    }

    // Phase 1: 7 strategic patterns (4 baselines + 3 binary separators)
    const patterns = [
        [1,1,1,1,1,1,1,1,1,1], [2,2,2,2,2,2,2,2,2,2],
        [3,3,3,3,3,3,3,3,3,3], [4,4,4,4,4,4,4,4,4,4],
        [1,2,1,2,1,1,2,2,1,2], [1,1,2,2,1,2,1,2,2,1],
        [1,1,1,1,2,2,2,2,1,1],
    ];

    const capped = patterns.map(p => p.map((v, i) => Math.min(v, opts[i])));
    const scores = await Promise.all(capped.map(c => submit(c)));

    // Early exit: if any pattern scored 100%, it's already the answer
    const perfectIdx = scores.indexOf(Q);
    if (perfectIdx !== -1) {
        capped[perfectIdx].forEach((v, i) => {
            const r = form.querySelectorAll(`input[name="selAnswer${i}"]`);
            if (r[v - 1]) r[v - 1].checked = true;
        });
        console.log(`🏆 [${capped[perfectIdx].join(',')}] | ${reqs} reqs, ${(performance.now() - t0).toFixed(0)}ms (perfect on pattern ${perfectIdx})`);
        return;
    }

    // Phase 2: backtracking solver with incremental match counting
    function solve(caps, S, limit) {
        const R = caps.length;
        const found = [];
        (function bt(qi, cur, counts) {
            if (found.length >= limit) return;
            if (qi === Q) {
                for (let r = 0; r < R; r++) if (counts[r] !== S[r]) return;
                found.push([...cur]);
                return;
            }
            const remaining = Q - qi - 1;
            for (let g = 1; g <= opts[qi]; g++) {
                cur[qi] = g;
                let ok = true;
                for (let r = 0; r < R; r++) {
                    const nc = counts[r] + (caps[r][qi] === g ? 1 : 0);
                    if (nc > S[r] || nc + remaining < S[r]) { ok = false; break; }
                }
                if (ok) {
                    const newCounts = new Uint8Array(counts);
                    for (let r = 0; r < R; r++) {
                        if (caps[r][qi] === g) newCounts[r]++;
                    }
                    bt(qi + 1, cur, newCounts);
                }
            }
            cur[qi] = 0;
        })(0, new Uint8Array(Q), new Uint8Array(capped.length));
        return found;
    }

    let sols = solve(capped, scores, 10);

    if (!sols.length) {
        console.error(`❌ No consistent solution found after ${reqs} reqs, ${(performance.now() - t0).toFixed(0)}ms — server may be non-deterministic.`);
        return;
    }

    // Phase 3: disambiguate with optimal probe selection
    function bestProbe(sols) {
        let best = null, bestWorst = Infinity;
        for (const candidate of sols) {
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

    // Auto-fill and done
    sols[0].forEach((v, i) => {
        const r = form.querySelectorAll(`input[name="selAnswer${i}"]`);
        if (r[v - 1]) r[v - 1].checked = true;
    });

    console.log(`🏆 [${sols[0].join(',')}] | ${reqs} reqs, ${(performance.now() - t0).toFixed(0)}ms`);
})();
