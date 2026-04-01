## ATIS LEARNING

<details>
<summary>Cyber Awareness Challenge</summary>

- [ATIS Course Link](https://learn.atis.army.mil/moodle/my/courses.php/program/3244)

---

- [🥇] Instant Completion (NEW - learn.atis.army.mil)
```js
(() => {
    window.parent.completed();
    window.top.location.reload();
})();
```

- [🥈] Auto answers all 25 questions of the "KNOWLEDGE CHECK OPTION". (NEW - learn.atis.army.mil)
```js
(() => {
	const {
		Alpine,
		document: doc
	} = document.querySelector('iframe').contentWindow;
	const s = Alpine.$data(doc.querySelector('[x-data="speedMission"]'));
	for (const q of s?.sm?.qs || [])
		Object.assign(s, {
			submit: false,
			answer: q.a[1]
		}), s.submitSm();
})();
```

---

- [🥇] Skip to "Congratulations" page. (OLD - cs.signal.army.mil)
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

- [🥈] Skip to "Verify Training" page. (OLD - cs.signal.army.mil)
```js
// https://cs.signal.army.mil/usermngmt/CyberAwareness_2026/pages/disacac18_02_army.html

(() => {
    if (location.pathname.includes('disacac01_01')) {
        return location.replace(location.href.replace(/disacac01_01\.html/, 'disacac18_02_army.html'));
    }
})();
```

- [🥉] Auto answers all 25 questions of the "KNOWLEDGE CHECK OPTION". (OLD - cs.signal.army.mil)
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

---

</details>
















<details>
<summary>SHARP for Annual Refresher Pretest</summary>

- [ATIS Course Link](https://learn.atis.army.mil/moodle/admin/tool/supercert/quicklaunch.php?id=540)

---

- [🥇] Instant Completion
```js
void function() {
    var v = document.querySelector('#app').__vue__.$children[0].$children[0];
    v.questions.forEach(function(q, i) {
        var correctIndex = q.options.findIndex(function(o) { return o.correct === true; });
        v.currentQuestion = i;
        v.select(correctIndex);
        v.next();
    });
    v.finish();
}()
```

---

</details>


</details>

<details>
<summary>Information Security Program Training</summary>

- [ATIS Course Link](https://learn.atis.army.mil/moodle/my/courses.php/program/2704)

---

- [🥇] Instant Completion
```js
// ==UserScript==
// @name         DCSA Auto Answer
// @namespace    https://github.com/Scrut1ny
// @version      1.0
// @description  Auto-answers DCSA pretest from within the iframe
// @match        https://securityawareness.dcsa.mil/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function p() {
    if (typeof DS === 'undefined') return setTimeout(p, 1e3);
    var l = '',
        r = function() {
            var el = document.querySelector('input[data-represents]');
            if (!el) return;
            var id = el.dataset.represents.split('.').slice(0, 4).join('.');
            if (id === l) return;
            var s = DS.slidesController.getSlide(id);
            if (!s || !s.attributes.interactions) return;
            l = id;
            s.attributes.interactions.models[0].attributes.answers.forEach(function(a) {
                if (a.status !== 'correct') return;
                var ids = [];
                a.evaluate.statements.forEach(function(s) {
                    if (s.choiceid) ids.push(s.choiceid.replace('choices.choice_', ''));
                });
                (ids.length ? ids : [a.id]).forEach(function(i) {
                    var e = document.getElementById('acc-' + i);
                    if (e) e.click();
                });
            });
            setTimeout(function() {
                document.querySelectorAll('button.acc-button').forEach(function(b) {
                    if (/submit/i.test(b.textContent)) b.click();
                });
            }, 50);
            setTimeout(function() {
                var b = document.querySelector('[aria-label*="ontinue"]');
                if (b) b.click();
            }, 100);
        };
    var t;
    new MutationObserver(function() {
        clearTimeout(t);
        t = setTimeout(r, 0);
    }).observe(document.getElementById('slide-window') || document.body, {
        childList: true,
        subtree: true
    });
    r();
})();
```

---

</details>




















## DCSA - Security Awareness Hub

<details>
<summary>Expand for details...</summary>

---

- [🥇] Print certificate instantly

<details>
<summary>Expand to view...</summary>

```js
// =============================================
// DCSA Universal Certificate Generator v10.0
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
    const dateFormatted = `${MONTHS[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}, ${d.getFullYear()}`;
    const dateShort = `${d.getMonth()+1}/${d.getDate()}/${d.getFullYear()}`;

    // ============================================================
    // TYPE A: Storyline + pdfMake (savePDF.js with base64 image)
    //   - Per-course: story_content/external_files/
    //   - Centralized framework: /framework/v2.0/
    // ============================================================
    async function tryTypeA() {
        // Per-course paths (older courses)
        const subfolders = ['quiz', 'content/quiz', ''];
        for (const sub of subfolders) {
            const prefix = sub ? `/${slug}/${sub}` : `/${slug}`;
            try {
                const r = await fetch(`${prefix}/story_content/external_files/savePDF.js`, { method: 'HEAD' });
                if (r.ok) return { pdfBase: prefix + '/story_content/external_files', certBase: prefix + '/story_content/external_files' };
            } catch {}
        }
        // Centralized framework path (newer courses)
        const fwPaths = ['/framework/v2.0', '/framework/external_v1.0'];
        for (const fw of fwPaths) {
            try {
                const r = await fetch(`${fw}/savePDF.js`, { method: 'HEAD' });
                if (r.ok) return { pdfBase: fw, certBase: fw };
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

    const typeA = await tryTypeA();
    if (typeA) {
        console.log(`[AutoCert] Type A (pdfMake) detected at ${typeA.pdfBase}/`);

        if (typeof pdfMake === 'undefined') {
            console.log('[AutoCert] Loading pdfMake...');
            await loadScript(`${typeA.pdfBase}/pdfmake.min.js`);
            await loadScript(`${typeA.pdfBase}/vfs_fonts.js`);
        }

        const r = await fetch(`${typeA.certBase}/savePDF.js`);
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
        })[CERT_ACTION === 'print' ? 'print' : 'download'](`${title}.pdf`);

        console.log(`[AutoCert] ✅ Certificate generated (Type A - pdfMake)`);
        return;
    }

    const typeBPath = await tryTypeB();
    if (typeBPath) {
        console.log(`[AutoCert] Type B (jsPDF + Canvas) detected at ${typeBPath}/`);

        if (typeof jsPDF === 'undefined') {
            await loadScript(`${typeBPath}/js/libs/jspdf-1.3.2.min.js`);
        }

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

---

</details>






- [🥈] Auto answers all final assessment questions

<details>
<summary>Expand to view...</summary>

---

```js
(function p() {
    if (typeof DS === 'undefined') return setTimeout(p, 1e3);
    var l = '',
        r = function() {
            var el = document.querySelector('input[data-represents]');
            if (!el) return;
            var id = el.dataset.represents.split('.').slice(0, 4).join('.');
            if (id === l) return;
            var s = DS.slidesController.getSlide(id);
            if (!s || !s.attributes.interactions) return;
            l = id;
            s.attributes.interactions.models[0].attributes.answers.forEach(function(a) {
                if (a.status !== 'correct') return;
                var ids = [];
                a.evaluate.statements.forEach(function(s) {
                    if (s.choiceid) ids.push(s.choiceid.replace('choices.choice_', ''));
                });
                (ids.length ? ids : [a.id]).forEach(function(i) {
                    var e = document.getElementById('acc-' + i);
                    if (e) e.click();
                });
            });
            setTimeout(function() {
                document.querySelectorAll('button.acc-button').forEach(function(b) {
                    if (/submit/i.test(b.textContent)) b.click();
                });
            }, 50);
            setTimeout(function() {
                var b = document.querySelector('[aria-label*="ontinue"]');
                if (b) b.click();
            }, 100);
        };
    var t;
    new MutationObserver(function() {
        clearTimeout(t);
        t = setTimeout(r, 0);
    }).observe(document.getElementById('slide-window') || document.body, {
        childList: true,
        subtree: true
    });
    r();
})();
```

---

</details>







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
(() => {
    const n = course.navigator;
    n._topics.forEach(t => t.forEach(x => {
        if (x.pages) x.pages.forEach(p => {
            p._visited = p._completed = p.visited = p.completed = true;
            p.roadblock = false
        })
    }));
    n._currentLessonNum = 4;
    n.openTopic(4, 1);
    setTimeout(() => n.openPage('next'), 2000);
})();
```

</details>
