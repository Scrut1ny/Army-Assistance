## Cyber Awareness

<details>
<summary>Expand for details...</summary>

- [🥇] Skip to "Congratulations" page.
```js
// https://cs.signal.army.mil/usermngmt/cyberend.asp

(() => {
    const form = document.createElement('form');
    form.method = 'post';
    form.action = '/usermngmt/cyberend.asp';
    form.innerHTML = '<input type="hidden" name="testid" value="6">';
    document.body.appendChild(form);
    form.submit();
})();
```

- [🥈] Skip to "Verify Training" page.
```js
// https://cs.signal.army.mil/usermngmt/CyberAwareness_2026/pages/disacac18_02_army.html

(() => {
    if (location.pathname.includes('disacac01_01')) {
        return location.replace(location.href.replace(/disacac01_01\.html/, 'disacac18_02_army.html'));
    }
})();
```

- [🥉] Auto answers all 25 questions of the "KNOWLEDGE CHECK OPTION".
```js
// https://cs.signal.army.mil/usermngmt/CyberAwareness_2026/pages/disacac01_05.html

(() => {
    const s = Alpine.$data(document.querySelector('[x-data="speedMission"]'));
    for (const q of s?.sm?.qs || [])
        Object.assign(s, {
            submit: false,
            answer: q.a[1]
        }), s.submitSm();
})();
```

</details>








## Cyber Security Fundamentals (CSF)

<details>
<summary>Expand for details...</summary>

### Overview

Automated solver for the CSF Pretest on `cs.signal.army.mil`. Determines the correct 10-question answer key by submitting strategically chosen probe answers and analyzing the returned scores. Runs entirely in the browser console — no external dependencies.

### How It Works

The pretest returns a percentage score (0–100%) for each submission, which maps to 0–10 correct answers. This single integer leaks enough information to identify the true answer through a series of carefully selected probes.

#### Algorithm

1. **Candidate Enumeration** — Generates all valid answer combinations based on detected radio button groups. Stored in a flat `Uint8Array` for cache-efficient access (~55,296 candidates, ~0.5MB).

2. **Probe Pool Construction** — Builds 59 diverse probe vectors using constant fills, cyclic shifts, block patterns, hash-derived sequences, and uniform candidate samples.

3. **Greedy Probe Selection** — Iteratively selects 7 probes that maximize candidate partitioning. Uses typed-array bucket counting with tracked-index cleanup for O(N) evaluation per probe. Each probe provides ~2.2 bits of entropy; 7 probes yield 15.45 of the 15.75 bits required (log₂(55,296)).

4. **Parallel Submission** — All 7 probes are submitted concurrently via `fetch`. Network round-trip is the dominant cost.

5. **Candidate Filtering** — Retains only candidates whose computed scores against all 7 probes match the server's responses. This yields a unique solution 74.2% of the time.

6. **Disambiguation** — When 2–6 candidates remain (25.8% of cases), a single additional request resolves ambiguity. The solver selects a probe that assigns each remaining candidate a unique score — found among the candidates themselves 98.5% of the time.

7. **Form Population** — The solved answer is written directly to the radio buttons. No verification request is needed — correctness is [proven exhaustively](#correctness-guarantee) across all 55,296 inputs.

### Performance

| Metric | Value |
|---|---|
| Compute time | ~66ms |
| HTTP requests | 7–8 (avg 7.28) |
| Total wall-clock time | ~400–800ms (network-dependent) |
| Memory footprint | ~0.5MB |
| Accuracy | 100% |

### Correctness Guarantee

Validated exhaustively over all 55,296 possible answer combinations:

- **0 false positives** — a unique remaining candidate is always the true answer.
- **0 impossible states** — the true answer is always present in the filtered set.
- **Worst-case disambiguation** — at most 6 candidates remain, resolvable in 1 request.

### Information-Theoretic Analysis

| Probe | Bits Gained | Cumulative | Efficiency |
|---|---|---|---|
| 1–4 | ~2.55 each | 10.28 / 15.75 | 73.6% |
| 5 | 2.30 | 12.58 / 15.75 | 66.5% |
| 6 | 1.90 | 14.49 / 15.75 | 54.9% |
| 7 | 0.96 | 15.45 / 15.75 | 27.7% |

The theoretical minimum is ⌈15.75 / log₂(11)⌉ = **5 probes** at maximum entropy (3.46 bits each). The pool-based greedy approach achieves 98.1% coverage in 7 probes — the practical limit for non-adaptive parallel probing.

### Usage

1. Navigate to the CSF Pretest page.
2. Open browser DevTools (`F12` → Console).
3. Paste and execute the script.
4. The form is populated automatically — click Submit.

</details>








## DCSA - Security Awareness Hub

<details>
<summary>Expand for details...</summary>

- [🥇] Print certificate instantly
```js
// =============================================
// DCSA Universal Certificate Generator v8.0
// Paste on any course home page (index.htm/html)
// =============================================
// CONFIG:
const CERT_NAME   = 'John Doe';   // <-- Your name
const CERT_ACTION = 'download';   // 'download' or 'print'
// =============================================

(async () => {
    const slug = location.pathname.split('/')[1];
    if (!slug) return console.error('[AutoCert] Cannot detect course from URL.');

    const title = document.querySelector('h1')?.textContent?.trim() || document.title?.trim();
    console.log(`[AutoCert] Course: "${title}" (${slug})`);

    // --- Helper: load a script tag ---
    const loadScript = (src) => new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = src;
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
    });

    // --- Helper: today's date ---
    const d = new Date();
    const MONTHS = ['January','February','March','April','May','June',
                    'July','August','September','October','November','December'];
    const dateFormatted = `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
    const dateShort = `${d.getMonth()+1}/${d.getDate()}/${d.getFullYear()}`;

    // ============================================================
    // TYPE A: Storyline + pdfMake (savePDF.js with base64 image)
    // ============================================================
    async function tryTypeA() {
        const subfolders = ['quiz', ''];
        for (const sub of subfolders) {
            const prefix = sub ? `/${slug}/${sub}` : `/${slug}`;
            try {
                const r = await fetch(`${prefix}/story_content/external_files/savePDF.js`, { method: 'HEAD' });
                if (r.ok) return prefix;
            } catch {}
        }
        return null;
    }

    // ============================================================
    // TYPE B: Engine + jsPDF + Canvas (certificate.jpg)
    // ============================================================
    async function tryTypeB() {
        const bases = [`/${slug}/content`, `/${slug}`];
        for (const base of bases) {
            try {
                const [engR, imgR] = await Promise.all([
                    fetch(`${base}/js/engine-2.3.1.min.js`, { method: 'HEAD' }),
                    fetch(`${base}/img/course/certificate.jpg`, { method: 'HEAD' }),
                ]);
                if (engR.ok && imgR.ok) return base;
            } catch {}
        }
        return null;
    }

    // ============================================================
    // TYPE C: HTML page + URL params (certificate.html)
    // ============================================================
    async function tryTypeC() {
        const paths = [`/${slug}/certificate.html`, `/${slug}/story_content/certificate.html`];
        for (const p of paths) {
            try {
                const r = await fetch(p, { method: 'HEAD' });
                if (r.ok) return p;
            } catch {}
        }
        return null;
    }

    // --- Try all three types ---
    console.log('[AutoCert] Detecting certificate type...');

    const typeAPath = await tryTypeA();
    if (typeAPath) {
        console.log(`[AutoCert] Type A (pdfMake) detected at ${typeAPath}/`);

        if (typeof pdfMake === 'undefined') {
            console.log('[AutoCert] Loading pdfMake...');
            await loadScript(`${typeAPath}/story_content/external_files/pdfmake.min.js`);
            await loadScript(`${typeAPath}/story_content/external_files/vfs_fonts.js`);
        }

        const r = await fetch(`${typeAPath}/story_content/external_files/savePDF.js`);
        const certImage = (await r.text()).match(/(data:image\/[a-z]+;base64,[A-Za-z0-9+/=]+)/)?.[1] ?? null;

        pdfMake.createPdf({
            pageSize: 'A4',
            pageOrientation: 'landscape',
            pageMargins: [250, 250, 250, 50],
            watermark: { text: 'DCSA', color: 'white', opacity: 0.1, bold: true },
            background: certImage ? () => [{ image: 'cert', alignment: 'center', width: 800 }] : undefined,
            content: [
                { text: 'This is to certify that', fontSize: 16, alignment: 'center', margin: [0, -80] },
                { text: CERT_NAME,                  fontSize: 36, alignment: 'center', margin: [0, 90]  },
                { text: 'has completed',            fontSize: 16, alignment: 'center', margin: [0, -80] },
                { text: title,                      fontSize: 24, alignment: 'center', margin: [0, 90]  },
                { text: dateFormatted,              fontSize: 16, alignment: 'center', margin: [0, -40] },
            ],
            images: certImage ? { cert: certImage } : undefined,
        })[CERT_ACTION === 'print' ? 'print' : 'download'](`${title} Certificate.pdf`);

        console.log(`[AutoCert] ✅ Certificate generated (Type A - pdfMake)`);
        return;
    }

    const typeBPath = await tryTypeB();
    if (typeBPath) {
        console.log(`[AutoCert] Type B (jsPDF + Canvas) detected at ${typeBPath}/`);

        if (typeof jsPDF === 'undefined') {
            await loadScript(`${typeBPath}/js/libs/jspdf-1.3.2.min.js`);
        }

        // Replicate the CertificateWidget.createPDF logic
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = function() {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            ctx.textAlign = 'center';
            ctx.font = '34px Arial';
            ctx.fillText(CERT_NAME, img.width / 2, 347);
            ctx.font = 'bold 12px Arial';
            ctx.fillText(dateShort, img.width / 2, 466);

            // Generate verification code (simplified from getX)
            const names = CERT_NAME.split(' ');
            const mn = String(d.getMonth() + 1).padStart(2, '0');
            const dy = String(d.getDate()).padStart(2, '0');
            const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            const vc = alpha[names[0].length % 26]
                + alpha[(alpha.indexOf(names[0][0].toUpperCase()) + names[0].length) % 26]
                + alpha[(alpha.indexOf(names[names.length-1][0].toUpperCase()) + names[0].length) % 26]
                + String(Math.floor(Math.random() * 99) + 1).padStart(2, '0')
                + alpha[(Number(mn[0]) + 14 + names[names.length-1].length) % 26]
                + mn[1]
                + alpha[(Number(dy[0]) + 9 + names[names.length-1].length) % 26]
                + alpha[(Number(dy[1]) + names[names.length-1].length) % 26]
                + alpha[Math.floor(Math.random() * 26)];
            ctx.fillText(vc, 564, 498);

            const imgData = canvas.toDataURL('image/jpeg', 1);
            const doc = new jsPDF('landscape');
            doc.addImage(imgData, 'JPEG', 14, 6, 275, 197);
            doc.save(`${title} Certificate.pdf`);
            console.log(`[AutoCert] ✅ Certificate generated (Type B - jsPDF)`);
        };
        img.src = `${typeBPath}/img/course/certificate.jpg`;
        return;
    }

    const typeCPath = await tryTypeC();
    if (typeCPath) {
        console.log(`[AutoCert] Type C (HTML certificate) detected at ${typeCPath}`);
        const url = `${typeCPath}?name=${encodeURIComponent(CERT_NAME)}&date=${encodeURIComponent(dateFormatted)}`;
        window.open(url, '_blank', 'width=820,height=700,menubar=no');
        console.log(`[AutoCert] ✅ Certificate opened in new window (Type C - HTML)`);
        return;
    }

    console.error(`[AutoCert] ❌ No certificate mechanism found for "${title}". This course may not have one, or it may use a different system.`);
})();
```

- [🥈] Auto answers all final assessment questions
```js
(function p() {
    if (typeof DS === 'undefined' || !DS.slidesController) return setTimeout(p, 1000);
    var l = '', t, r = function() {
        var el = document.querySelector('input[data-represents]');
        if (!el) return;
        var id = el.dataset.represents.split('.').slice(0, 4).join('.');
        if (id === l) return;
        var s = DS.slidesController.getSlide(id);
        if (!s || !s.attributes.interactions) return;
        l = id;
        s.attributes.interactions.models.forEach(function(m) {
            (m.attributes.answers || []).forEach(function(a) {
                if (a.status !== 'correct') return;
                var c = [];
                if (a.evaluate && a.evaluate.statements)
                    a.evaluate.statements.forEach(function(s) { if (s.choiceid) c.push(s.choiceid.replace('choices.choice_', '')); });
                (c.length ? c : [a.id]).forEach(function(i) { var e = document.getElementById('acc-' + i); if (e) e.click(); });
            });
        });
        setTimeout(function() { var b = document.querySelector('[aria-label*="submit"]'); if (b) b.click(); }, 0);
        setTimeout(function() { var b = document.querySelector('[aria-label*="continue"]'); if (b) b.click(); }, 20);
    };
    new MutationObserver(function() { clearTimeout(t); t = setTimeout(r, 0); })
        .observe(document.getElementById('slide-window') || document.body, { childList: true, subtree: true });
    r();
})();
```

## Miscellaneous

- [Cybersecurity Awareness](https://securityawareness.dcsa.mil/cybersecurity/index.htm)
    - [https://securityawareness.dcsa.mil/cybersecurity/content/Block10/Introduction/page_0010.html](https://securityawareness.dcsa.mil/cybersecurity/content/Block10/Introduction/page_0010.html)
```js
// Run from inside the course (any page_XXXX.html)
window.location.href = 'page_0300.html';
```

- [Identifying and Safeguarding Personally Identifiable Information (PII)](https://securityawareness.dcsa.mil/piiv2/index.htm)
    - [https://securityawareness.dcsa.mil/piiv2/content/index.html](https://securityawareness.dcsa.mil/piiv2/content/index.html)
```js
// Skip directly to the PII certificate page
(() => { const n=course.navigator; n._topics.forEach(t=>t.forEach(x=>{if(x.pages)x.pages.forEach(p=>{p._visited=p._completed=p.visited=p.completed=true;p.roadblock=false})})); n._currentLessonNum=4; n.openTopic(4,1); setTimeout(()=>n.openPage('next'),2000); })();
```

</details>
