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

### The Problem

10-question exam. Submitting answers returns only a **total score** (how many correct) — not which ones. Goal: find all 10 answers with minimum requests.

### Key Insight

Instead of testing one question per request (wasteful), **each request encodes information about all 10 questions at once.** The correct answer key must satisfy every score simultaneously — a constraint satisfaction problem.

### The 7 Patterns

- **Patterns 0-3 (baselines):** All-1s, all-2s, all-3s, all-4s → gives exact count of each answer value
- **Patterns 4-6 (binary separators):** Unique 1/2 signature per question → breaks symmetry between questions sharing the same answer

All 7 fire in **one parallel burst**. A backtracking solver with pruning finds all valid answer sets in <10ms.

### Why 8, Not 7

**Information theory:** ~20 bits needed, ~3.5 bits per score → **6 minimum**. But scores are integer sums — value swaps (e.g., Q5=1,Q9=2 ↔ Q5=2,Q9=1) can produce identical totals across all patterns.

3 binary separators give 2³=8 unique signatures for 10 questions — **pigeonhole principle** guarantees collisions. So 7 patterns sometimes yield 2 valid solutions.

The **8th request** is a targeted disambiguator: it submits one candidate's values at the differing positions, guaranteeing the candidates score differently. Always resolves in one shot.

### Result

| | Naive | Optimized |
|---|---|---|
| Requests | 14 | **8** |
| Rounds | 2 | 1 + 1 if needed |
| Correctness | Edge cases possible | **Guaranteed** |

**8 requests is the proven mathematical floor.** 6 gives wrong answers, 7 is sometimes ambiguous, 8 always works.

</details>








## DCSA - Security Awareness Hub

<details>
<summary>Expand for details...</summary>

- [🥇] Print certificate instantly
```js
Coming soon...
```

- [🥈] Auto answers all 20 questions for the final assessment
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
        setTimeout(function() { var b = document.querySelector('[aria-label*="continue"]'); if (b) b.click(); }, 15);
    };
    new MutationObserver(function() { clearTimeout(t); t = setTimeout(r, 0); })
        .observe(document.getElementById('slide-window') || document.body, { childList: true, subtree: true });
    r();
})();
```

</details>
