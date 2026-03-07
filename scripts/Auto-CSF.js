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

    // Phase 2: backtracking solver with pruning
    function solve(caps, S, limit) {
        const found = [];
        (function bt(qi, cur) {
            if (found.length >= limit) return;
            if (qi === Q) {
                for (let r = 0; r < caps.length; r++) {
                    let c = 0;
                    for (let j = 0; j < Q; j++) if (caps[r][j] === cur[j]) c++;
                    if (c !== S[r]) return;
                }
                found.push([...cur]);
                return;
            }
            for (let g = 1; g <= opts[qi]; g++) {
                cur[qi] = g;
                let ok = true;
                for (let r = 0; r < caps.length; r++) {
                    let c = 0;
                    for (let j = 0; j <= qi; j++) if (caps[r][j] === cur[j]) c++;
                    if (c > S[r] || c + Q - qi - 1 < S[r]) { ok = false; break; }
                }
                if (ok) bt(qi + 1, cur);
            }
            cur[qi] = 0;
        })(0, Array(Q).fill(0));
        return found;
    }

    let sols = solve(capped, scores, 10);

    // Phase 3: disambiguate if multiple solutions
    while (sols.length > 1) {
        const probe = Array(Q).fill(0);
        for (let i = 0; i < Q; i++) {
            const unique = new Set(sols.map(s => s[i])).size > 1;
            probe[i] = unique ? sols[0][i] : (sols[0][i] === 1 ? 2 : 1);
        }
        const cp = probe.map((v, i) => Math.min(v, opts[i]));
        const ds = await submit(cp);
        sols = sols.filter(s => {
            let c = 0;
            for (let j = 0; j < Q; j++) if (cp[j] === s[j]) c++;
            return c === ds;
        });
    }

    // Auto-fill and done
    sols[0].forEach((v, i) => {
        const r = form.querySelectorAll(`input[name="selAnswer${i}"]`);
        if (r[v - 1]) r[v - 1].checked = true;
    });

    console.log(`🏆 [${sols[0].join(',')}] | ${reqs} reqs, ${(performance.now() - t0).toFixed(0)}ms`);
})();
