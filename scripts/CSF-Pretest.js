// ==UserScript==
// @name         CSF Pretest Auto Solver
// @namespace    https://github.com/Scrut1ny
// @version      4.0
// @description  Solves the CSF Pretest in ~500ms via parallel server probing. No answer key needed.
// @author       Scrut1ny
// @match        https://cs.signal.army.mil/usermngmt/CyberFundamentals/lessons/pretest.asp
// @match        https://cs.signal.army.mil/usermngmt/CyberFundamentals/lessons/exam.asp
// @run-at       document-end
// @grant        none
// ==/UserScript==

(() => {
    const SUBMIT_URL = 'https://cs.signal.army.mil/UserMngmt/CyberFundamentals/lessons/CsfPretestSubmit.asp';
    const Q_COUNT = 10;

    const form = document.querySelector('form[name="CSFpretest"]');
    if (!form) return;

    const optCounts = Array.from({ length: Q_COUNT }, (_, i) =>
        form.querySelectorAll(`input[name="selAnswer${i}"]`).length
    );

    function getScore(html) {
        if (html.includes('Congratulations')) return 100;
        const m = html.match(/score of (\d+)%/);
        return m ? parseInt(m[1]) : -1;
    }

    async function probe(answers) {
        const body = answers.map((v, i) => `selAnswer${i}=${v}`).join('&');
        const r = await fetch(SUBMIT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body,
            credentials: 'include'
        });
        return getScore(await r.text());
    }

    async function solve() {
        const t0 = performance.now();
        console.log('🔍 CSF Auto Solver v4.0');
        console.log(`📋 Options: [${optCounts.join(',')}]`);

        const all = [];

        // Baseline (all 1s)
        all.push(
            probe(Array(Q_COUNT).fill(1)).then(score => ({ type: 'base', score }))
        );

        // Probe values 2 through (max - 1) per question; last option solved by elimination
        for (let i = 0; i < Q_COUNT; i++) {
            const maxProbe = optCounts[i] === 2 ? 2 : optCounts[i] - 1;
            for (let v = 2; v <= maxProbe; v++) {
                const test = Array(Q_COUNT).fill(1);
                test[i] = v;
                all.push(
                    probe(test).then(score => ({ type: 'flip', q: i, v, score }))
                );
            }
        }

        // Single parallel burst
        const results = await Promise.all(all);
        const base1 = results.find(r => r.type === 'base').score;

        // Solve each question
        const answers = Array(Q_COUNT).fill(0);
        const found = new Set();

        results.filter(r => r.type === 'flip').forEach(r => {
            if (r.score - base1 > 0) {
                answers[r.q] = r.v;
                found.add(r.q);
            }
        });

        for (let i = 0; i < Q_COUNT; i++) {
            if (found.has(i)) continue;
            const flip2 = results.find(r => r.type === 'flip' && r.q === i && r.v === 2);
            if (flip2 && flip2.score - base1 < 0) {
                answers[i] = 1; // Flipping hurt → 1 was correct
            } else {
                answers[i] = optCounts[i]; // Elimination → last option
            }
        }

        const ms = (performance.now() - t0).toFixed(0);
        console.log(`⚡ Solved: [${answers.join(',')}] in ${ms}ms (${all.length} reqs)`);

        // Select radios and submit form
        answers.forEach((v, i) => {
            const radio = form.querySelector(`input[name="selAnswer${i}"][value="${v}"]`);
            if (radio) radio.checked = true;
        });
        form.submit();
    }

    // Auto-solve on page load
    solve();
})();
