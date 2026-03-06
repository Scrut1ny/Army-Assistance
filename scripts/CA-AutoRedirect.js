// ==UserScript==
// @name         Cyber Awareness Auto Redirect
// @namespace    https://github.com/Scrut1ny
// @version      1.0
// @description  Automatically redirects to the "Verify Training" page.
// @author       Scrut1ny
// @match        https://cs.signal.army.mil/UserMngmt/CyberAwareness_*/pages/disacac01_01.html
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    window.location.replace('https://cs.signal.army.mil/usermngmt/CyberAwareness_2026/pages/disacac18_02_army.html');
})();
