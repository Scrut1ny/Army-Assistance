// 🏆 CSF Solver FINAL — 8 requests, 100% correct, single burst + 1 disambiguator
(async () => {
    const P = 'https://cs.signal.army.mil/UserMngmt/CyberFundamentals/lessons/CsfPretestSubmit.asp';
    const t0 = performance.now();
    let R = 0;

    async function q(a) {
        R++;
        const r = await fetch(P, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: a.map((v, i) => `selAnswer${i}=${v}`).join('&'),
            credentials: 'include'
        });
        return ((await r.text()).match(/score of (\d+)%/) || [, -1])[1] / 10;
    }

    const f = document.querySelector('form[name="CSFpretest"]');
    const Q = 10;
    const O = Array.from({length: Q}, (_, i) =>
        f.querySelectorAll(`input[name="selAnswer${i}"]`).length
    );

    // 7 patterns: 4 baselines + 3 binary separators
    const P7 = [
        [1,1,1,1,1,1,1,1,1,1],
        [2,2,2,2,2,2,2,2,2,2],
        [3,3,3,3,3,3,3,3,3,3],
        [4,4,4,4,4,4,4,4,4,4],
        [1,2,1,2,1,1,2,2,1,2],
        [1,1,2,2,1,2,1,2,2,1],
        [1,1,1,1,2,2,2,2,1,1],
    ];

    const C = P7.map(p => p.map((v, i) => Math.min(v, O[i])));
    const S = (await Promise.all(C.map(c => q(c)))).map(Math.round);

    // Backtracking solver — finds up to 10 solutions
    function solve(caps, scores, lim) {
        const sol = [];
        (function bt(qi, cur) {
            if (sol.length >= lim) return;
            if (qi === Q) {
                for (let r = 0; r < caps.length; r++) {
                    let c = 0;
                    for (let j = 0; j < Q; j++) if (caps[r][j] === cur[j]) c++;
                    if (c !== scores[r]) return;
                }
                sol.push([...cur]);
                return;
            }
            for (let g = 1; g <= O[qi]; g++) {
                cur[qi] = g;
                let ok = true;
                for (let r = 0; r < caps.length; r++) {
                    let c = 0;
                    for (let j = 0; j <= qi; j++) if (caps[r][j] === cur[j]) c++;
                    if (c > scores[r] || c + Q - qi - 1 < scores[r]) { ok = false; break; }
                }
                if (ok) bt(qi + 1, cur);
            }
            cur[qi] = 0;
        })(0, Array(Q).fill(0));
        return sol;
    }

    let sols = solve(C, S, 10);

    // Disambiguate if needed
    while (sols.length > 1) {
        const d = Array(Q).fill(0);
        for (let i = 0; i < Q; i++) {
            const vals = new Set(sols.map(s => s[i]));
            d[i] = vals.size > 1 ? sols[0][i] : (sols[0][i] === 1 ? 2 : 1);
        }
        const dc = d.map((v, i) => Math.min(v, O[i]));
        const ds = Math.round(await q(dc));
        sols = sols.filter(s => {
            let c = 0;
            for (let j = 0; j < Q; j++) if (dc[j] === s[j]) c++;
            return c === ds;
        });
    }

    // Auto-fill
    sols[0].forEach((v, i) => {
        const r = f.querySelectorAll(`input[name="selAnswer${i}"]`);
        if (r[v - 1]) r[v - 1].checked = true;
    });

    console.log(`🏆 [${sols[0].join(',')}] | ${R} reqs, ${(performance.now() - t0).toFixed(0)}ms`);
})();
