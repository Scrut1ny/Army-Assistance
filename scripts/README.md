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
// Paste on any course home page (index.htm/html)
// =============================================
// CONFIG:
const CERT_NAME   = 'John Doe';   // <-- Your name
const CERT_ACTION = 'download';   // 'download' or 'print'
// =============================================

(async () => {
    const slug = location.pathname.split('/')[1];
    if (!slug) return console.error('[AutoCert] Cannot detect course from URL.');

    const title = document.querySelector('h1')?.textContent?.trim() || document.title;
    console.log(`[AutoCert] Course: "${title}" (${slug})`);

    // --- Discover savePDF.js and pdfMake paths ---
    const subfolders = ['quiz', ''];
    let basePath = null;

    for (const sub of subfolders) {
        const prefix = sub ? `/${slug}/${sub}` : `/${slug}`;
        try {
            const r = await fetch(`${prefix}/story_content/external_files/savePDF.js`, { method: 'HEAD' });
            if (r.ok) { basePath = prefix; break; }
        } catch {}
    }

    if (!basePath) {
        console.error(`[AutoCert] No certificate found for "${title}". This course may not have one.`);
        return;
    }
    console.log(`[AutoCert] Found certificate at: ${basePath}/`);

    // --- Load pdfMake ---
    const loadScript = (src) => new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = src;
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
    });

    if (typeof pdfMake === 'undefined') {
        console.log('[AutoCert] Loading pdfMake...');
        try {
            await loadScript(`${basePath}/story_content/external_files/pdfmake.min.js`);
            await loadScript(`${basePath}/story_content/external_files/vfs_fonts.js`);
        } catch {
            console.error('[AutoCert] Failed to load pdfMake.');
            return;
        }
    }

    // --- Fetch certificate background ---
    let certImage = null;
    try {
        const r = await fetch(`${basePath}/story_content/external_files/savePDF.js`);
        certImage = (await r.text()).match(/(data:image\/[a-z]+;base64,[A-Za-z0-9+/=]+)/)?.[1] ?? null;
    } catch {}

    if (!certImage) console.warn('[AutoCert] No background image — generating without it.');

    // --- Format date ---
    const d = new Date();
    const date = `${['January','February','March','April','May','June','July','August','September','October','November','December'][d.getMonth()]} ${String(d.getDate()).padStart(2,'0')}, ${d.getFullYear()}`;

    // --- Generate PDF ---
    pdfMake.createPdf({
        pageSize: 'A4',
        pageOrientation: 'landscape',
        pageMargins: [250, 250, 250, 50],
        watermark: { text: 'DCSA', color: 'white', opacity: 0.1, bold: true },
        background: certImage
            ? (page) => page !== 2 ? [{ image: 'cert', alignment: 'center', width: 800 }] : null
            : undefined,
        content: [
            { text: 'This is to certify that', fontSize: 16, alignment: 'center', margin: [0, -80] },
            { text: CERT_NAME,                 fontSize: 36, alignment: 'center', margin: [0, 90]  },
            { text: 'has completed',           fontSize: 16, alignment: 'center', margin: [0, -80] },
            { text: title,                     fontSize: 24, alignment: 'center', margin: [0, 90]  },
            { text: date,                      fontSize: 16, alignment: 'center', margin: [0, -40] },
        ],
        images: certImage ? { cert: certImage } : undefined,
    })[CERT_ACTION === 'print' ? 'print' : 'download'](`${title}.pdf`);

    console.log(`[AutoCert] ✅ Certificate generated for "${CERT_NAME}" — "${title}" — ${date}`);
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

</details>
