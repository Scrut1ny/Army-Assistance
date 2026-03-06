## Cyber Awareness

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





## DCSA - Security Awareness Hub

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
