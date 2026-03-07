// 🏆 CSF Exam Solver — Run on exam.asp, click Submit once
(async () => {
    const PRETEST = 'https://cs.signal.army.mil/UserMngmt/CyberFundamentals/lessons/CsfPretestSubmit.asp';
    const t0 = performance.now();
    let reqCount = 0;

    async function submit(answers) {
        reqCount++;
        const body = answers.map((v, i) => `selAnswer${i}=${v}`).join('&');
        const r = await fetch(PRETEST, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body,
            credentials: 'include'
        });
        const html = await r.text();
        const m = html.match(/score of (\d+)%/);
        return m ? parseInt(m[1]) : -1;
    }

    const formEl = document.querySelector('form[name="CSFpretest"]');
    const Q = 10;
    const optCounts = Array.from({length: Q}, (_, i) =>
        formEl.querySelectorAll(`input[name="selAnswer${i}"]`).length
    );

    // Round 1: all-1s baseline, all-2s baseline, per-question probes
    const round1 = [];
    round1.push(submit(Array(Q).fill(1)).then(s => ({id: 'base1', s})));
    round1.push(submit(Array(Q).fill(2)).then(s => ({id: 'base2', s})));
    for (let i = 0; i < Q; i++) {
        const t = Array(Q).fill(1);
        if (optCounts[i] >= 4) {
            t[i] = 3;
            round1.push(submit(t).then(s => ({id: 'f3', q: i, s})));
        } else {
            t[i] = 2;
            round1.push(submit(t).then(s => ({id: 'f2', q: i, s})));
        }
    }

    const r1 = await Promise.all(round1);
    const base = r1.find(r => r.id === 'base1').s;
    const total2s = r1.find(r => r.id === 'base2').s / 10;

    const answers = Array(Q).fill(0);
    const unknowns = [];

    for (const r of r1) {
        if (r.id === 'base1' || r.id === 'base2') continue;
        const diff = r.s - base;
        if (r.id === 'f2') {
            answers[r.q] = diff > 0 ? 2 : diff < 0 ? 1 : optCounts[r.q];
        } else {
            if (diff > 0) answers[r.q] = 3;
            else if (diff < 0) answers[r.q] = 1;
            else unknowns.push(r.q);
        }
    }

    // Resolve {2,4} unknowns via counting trick
    const unk2s = total2s - answers.filter(a => a === 2).length;

    if (unk2s === 0) {
        unknowns.forEach(q => answers[q] = 4);
    } else if (unk2s === unknowns.length) {
        unknowns.forEach(q => answers[q] = 2);
    } else if (unknowns.length > 0) {
        const toProbe = unknowns.slice(0, -1);
        const r2 = await Promise.all(toProbe.map(q => {
            const t = Array(Q).fill(1); t[q] = 2;
            return submit(t).then(s => ({q, s}));
        }));
        let found2s = 0;
        r2.forEach(r => {
            const is2 = (r.s - base) > 0;
            answers[r.q] = is2 ? 2 : 4;
            if (is2) found2s++;
        });
        answers[unknowns[unknowns.length - 1]] = found2s < unk2s ? 2 : 4;
    }

    // Auto-fill exam
    answers.forEach((val, i) => {
        const radios = formEl.querySelectorAll(`input[name="selAnswer${i}"]`);
        if (radios[val - 1]) radios[val - 1].checked = true;
    });

    console.log(`🏆 SOLVED: [${answers.join(',')}] | ${reqCount} reqs, ${(performance.now() - t0).toFixed(0)}ms`);
    console.log('✅ Click Submit Exam!');
})();
