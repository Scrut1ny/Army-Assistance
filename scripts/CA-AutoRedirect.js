// ==UserScript==
// @name         Cyber Awareness Auto Redirect & Verify
// @namespace    https://github.com/Scrut1ny
// @version      2.0
// @description  Automatically redirects to the "Verify Training" page and clicks the button.
// @author       Scrut1ny
// @match        *://cs.signal.army.mil/*/CyberAwareness_*/pages/disacac01_01.html
// @run-at       document-start
// @grant        none
// ==/UserScript==

(() => {
    if (location.pathname.includes('disacac01_01')) {
        return location.replace(location.href.replace(/disacac01_01\.html/, 'disacac18_02_army.html'));
    }
})();
