// ==UserScript==
// @name         CSF Pretest Auto Solver
// @namespace    https://github.com/Scrut1ny
// @version      3.0
// @description  Dynamically solves the CSF Pretest via parallel server probing. No answer key needed.
// @author       Scrut1ny
// @match        https://cs.signal.army.mil/usermngmt/CyberFundamentals/lessons/pretest.asp
// @run-at       document-end
// @grant        none
// ==/UserScript==

(() => {
    const SUBMIT_URL = 'https://cs.signal.army.mil/UserMngmt/CyberFundamentals/lessons/CsfPretestSubmit.asp';
    const Q_COUNT = 10;

    const form = document.querySelector('form[name="CSFpretest"]');
    if (!form) return;

    // Get option counts per question
    const optCounts = Array.from({ length: Q_COUNT }, (_, i) =>
        form.querySelectorAll(`input[name="selAnswer${i}"]`).length
    );
    const maxOpts = Math.max(...optCounts);

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
        console.log('🔍 CSF Auto Solver v3.0');
        console.log(`📋 Options per question: [${optCounts.join(',')}]`);

        // ── ROUND 1: Baselines + flip-to-2 probes (all parallel) ──
        const round1 = [];

        // Baselines: all-1s, all-2s, ..., all-maxOpts
        for (let v = 1; v <= maxOpts; v++) {
            round1.push(
                probe(Array(Q_COUNT).fill(v))
                    .then(score => ({ type: 'base', value: v, score }))
            );
        }

        // Flip each question to 2 (from all-1s baseline)
        for (let i = 0; i < Q_COUNT; i++) {
            const test = Array(Q_COUNT).fill(1);
            test[i] = 2;
            round1.push(
                probe(test)
                    .then(score => ({ type: 'flip', question: i, score }))
            );
        }

        const r1 = await Promise.all(round1);
        const r1ms = (performance.now() - t0).toFixed(0);

        // Parse baselines
        const baseDist = {};
        let base1 = 0;
        r1.filter(r => r.type === 'base').forEach(r => {
            baseDist[r.value] = r.score / 10;
            if (r.value === 1) base1 = r.score;
            console.log(`  All ${r.value}s → ${r.score}% (${r.score / 10} correct)`);
        });

        // Quick exit: if all-1s is 100%
        if (base1 === 100) {
            console.log(`🎉 All answers are 1! Solved in ${r1ms}ms`);
            selectAndSubmit(Array(Q_COUNT).fill(1));
            return;
        }

        // Parse flip results
        const answers = Array(Q_COUNT).fill(0); // 0 = unknown
        const needPhase2 = [];

        r1.filter(r => r.type === 'flip').forEach(r => {
            const diff = r.score - base1;
            if (diff < 0) {
                answers[r.question] = 1; // flipping hurt → 1 was correct
            } else if (diff > 0) {
                answers[r.question] = 2; // flipping helped → 2 is correct
            } else {
                // diff === 0 → both 1 and 2 are wrong → answer is 3 or 4
                needPhase2.push(r.question);
            }
        });

        console.log(`⚡ Round 1 (${r1ms}ms): [${answers.join(',')}] | Unknown: Q[${needPhase2.join(',')}]`);

        // ── ROUND 2: Resolve unknowns (answer is 3 or 4) ──
        if (needPhase2.length > 0) {
            const round2 = needPhase2.map(i => {
                const test = Array(Q_COUNT).fill(1);
                // Set already-known answers
                answers.forEach((a, j) => { if (a > 0) test[j] = a; });
                test[i] = 3;
                return probe(test).then(score => ({ question: i, value: 3, score }));
            });

            const r2 = await Promise.all(round2);
            const r2ms = (performance.now() - t0).toFixed(0);

            // Calculate expected score with known answers + 1 for unknown
            const knownCorrect = answers.filter(a => a > 0).length;
            const expectedBase = knownCorrect * 10;

            r2.forEach(r => {
                // Compare: if trying 3 gives more than expected, 3 is correct
                // Otherwise must be 4
                const test = [...answers];
                test[r.question] = 3;
                const otherKnown = test.filter(a => a > 0).length - 1;

                if (r.score > expectedBase) {
                    answers[r.question] = 3;
                    console.log(`  ✅ Q${r.question} = 3`);
                } else {
                    answers[r.question] = optCounts[r.question]; // last option (4 or 3)
                    console.log(`  ✅ Q${r.question} = ${answers[r.question]} (elimination)`);
                }
            });

            console.log(`⚡ Round 2 (${r2ms}ms): [${answers.join(',')}]`);
        }

        // ── ROUND 3: Submit via form ──
        const totalMs = (performance.now() - t0).toFixed(0);
        const totalReqs = round1.length + needPhase2.length;
        console.log(`\n🏁 Solution: [${answers.join(',')}]`);
        console.log(`📊 ${totalReqs} probes in ${totalMs}ms (${needPhase2.length > 0 ? 3 : 2} round trips)`);
        console.log(`🚀 Submitting form...`);

        selectAndSubmit(answers);
    }

    function selectAndSubmit(answers) {
        answers.forEach((v, i) => {
            const radio = form.querySelector(`input[name="selAnswer${i}"][value="${v}"]`);
            if (radio) radio.checked = true;
        });
        form.submit();
    }

    // Add solve button to page
    const btn = document.createElement('button');
    btn.textContent = '🚀 Auto Solve';
    btn.style.cssText = 'position:fixed;top:10px;right:10px;z-index:99999;padding:12px 24px;font-size:18px;font-weight:bold;background:#00c853;color:#fff;border:none;border-radius:8px;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.3);';
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        btn.disabled = true;
        btn.textContent = '⏳ Solving...';
        solve();
    });
    document.body.appendChild(btn);
})();
