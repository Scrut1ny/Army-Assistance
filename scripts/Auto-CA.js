// ==UserScript==
// @name         Cyber Awareness 2026 - Auto Answer
// @namespace    http://tampermonkey.net/
// @version      3.1
// @description  Auto-selects correct answers and submits on the Cyber Awareness Challenge 2026 Speed Mission
// @author       Scrut1ny
// @match        https://cs.signal.army.mil/UserMngmt/CyberAwareness_2026/*
// @match        https://cs.signal.army.mil/usermngmt/CyberAwareness_2026/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    const SEL = '[x-data="speedMission"]';
    const DELAY_SUBMIT = 400;
    const DELAY_POLL = 800;
    let lastQ = -1, timer;

    function click(el) {
        if (!el) return;
        const r = el.getBoundingClientRect();
        const o = { bubbles: true, cancelable: true, clientX: r.x + r.width / 2, clientY: r.y + r.height / 2 };
        for (const e of ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'])
            el.dispatchEvent(new MouseEvent(e, o));
    }

    function getData(el) {
        for (; el; el = el.parentElement)
            if (el._x_dataStack)
                for (const s of el._x_dataStack)
                    if (s.sm?.qs) return s;
                    return null;
    }

    function run() {
        const root = document.querySelector(SEL);
        if (!root) return;

        const d = getData(root);
        const q = d?.sm?.qs?.[d.sm.num - 1];
        if (!q?.a || d.sm.num === lastQ) return;

        lastQ = d.sm.num;
        const ans = q.a[1];

        d.answer = ans;
        for (const r of root.querySelectorAll('input[type="radio"]')) {
            if (r.value === ans) { click(r); break; }
        }

        setTimeout(() => {
            const btn = root.querySelector('button[type="submit"]:not([disabled])');
            if (btn) click(btn);
        }, DELAY_SUBMIT);
    }

    (function poll() {
        const root = document.querySelector(SEL);
        if (!root?._x_dataStack) return setTimeout(poll, 500);

        new MutationObserver(() => { clearTimeout(timer); timer = setTimeout(run, 250); })
        .observe(root, { childList: true, subtree: true, attributes: true });

        setInterval(run, DELAY_POLL);
        run();
    })();
})();
