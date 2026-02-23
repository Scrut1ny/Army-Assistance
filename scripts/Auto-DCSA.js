// ==UserScript==
// @name         DCSA Quiz Auto-Select
// @namespace    http://tampermonkey.net/
// @version      4.0
// @description  Auto-selects correct answers on DCSA quiz slides
// @author       Scrut1ny
// @match        https://securityawareness.dcsa.mil/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';
    var last = '', timer;

    function click(el) {
        if (el.checked) return;
        var r = el.getBoundingClientRect(), o = { bubbles: true, clientX: r.x + r.width / 2, clientY: r.y + r.height / 2 };
        ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'].forEach(function(e) { el.dispatchEvent(new MouseEvent(e, o)); });
    }

    function run() {
        var el = document.querySelector('input[type="radio"][data-represents],input[type="checkbox"][data-represents]');
        if (!el || typeof DS === 'undefined') return;
        var id = el.getAttribute('data-represents').split('.').slice(0, 4).join('.');
        if (id === last) return;
        var s = DS.slidesController.getSlide(id);
        if (!s || !s.attributes.interactions) return;
        last = id;
        s.attributes.interactions.models.forEach(function(m) {
            (m.attributes.answers || []).forEach(function(a) {
                if (a.status !== 'correct') return;
                var st = a.evaluate && a.evaluate.statements, ids = [];
                if (st) st.forEach(function(s) { if (s.choiceid) ids.push(s.choiceid.replace('choices.choice_', '')); });
                (ids.length ? ids : [a.id]).forEach(function(i) { var e = document.getElementById('acc-' + i); if (e) click(e); });
            });
        });
    }

    (function poll() {
        if (typeof DS === 'undefined' || !DS.slidesController) return setTimeout(poll, 1000);
        new MutationObserver(function() { clearTimeout(timer); timer = setTimeout(run, 400); })
        .observe(document.getElementById('slide-window') || document.body, { childList: true, subtree: true });
        run();
    })();
})();
