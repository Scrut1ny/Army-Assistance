## Cyber Awareness

- [🥇] Skip to "Congratulations" page.
```js
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
(() => {
    if (location.pathname.includes('disacac01_01')) {
        return location.replace(location.href.replace(/disacac01_01\.html/, 'disacac18_02_army.html'));
    }
})();
```

- [🥉] Auto answers all 25 questions of the "KNOWLEDGE CHECK OPTION".
```
(() => {
    const s = Alpine.$data(document.querySelector('[x-data="speedMission"]'));
    for (const q of s?.sm?.qs || [])
        Object.assign(s, {
            submit: false,
            answer: q.a[1]
        }), s.submitSm();
})();
```
