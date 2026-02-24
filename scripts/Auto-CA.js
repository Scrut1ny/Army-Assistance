// ==UserScript==
// @name         SpeedMission Auto Answer
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Automatically answers all SpeedMission questions and submits the test
// @author       You
// @match        https://cs.signal.army.mil/UserMngmt/CyberAwareness_2026/pages/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    const waitForRoot = () => {
        const root = document.querySelector('[x-data="speedMission"]');
        if (!root?._x_dataStack?.length) return setTimeout(waitForRoot, 50);

        const state = root._x_dataStack[0], { sm } = state;

        const answerCurrent = () => {
            const q = sm.qs[sm.num - 1];
            if (!q?.a) return;

            state.answer = q.a[1];
            const isLast = sm.num === sm.qs.length;

            if (isLast) {
                const waitBtn = () => {
                    const btn = document.querySelector('button.btn-blue[type="submit"]:not([disabled])');
                    btn ? btn.click() : setTimeout(waitBtn, 20);
                };
                state.$nextTick(waitBtn);
            } else {
                state.$nextTick(() => { state.submitSm(); answerCurrent(); });
            }
        };

        answerCurrent();
    };

    waitForRoot();
})();
