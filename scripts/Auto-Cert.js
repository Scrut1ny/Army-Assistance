// ==UserScript==
// @name         DCSA Auto Certificate PDF Generator
// @namespace    http://tampermonkey.net/
// @version      3.1
// @description  Automatically generates DCSA certificate PDFs — fully dynamic across all courses
// @match        https://securityawareness.dcsa.mil/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    // ========================
    // CONFIGURATION
    // ========================
    const YOUR_NAME    = 'John Doe';   // <-- Your name here
    const ACTION       = 'download';   // 'download' or 'print'
    const AUTO_TRIGGER = false;        // true = auto-generate on page load
    // ========================

    const MONTHS = ['January','February','March','April','May','June',
    'July','August','September','October','November','December'];

    function getFormattedDate() {
        const d = new Date();
        return `${MONTHS[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}, ${d.getFullYear()}`;
    }

    async function getSavePDFSource() {
        if (typeof savePDF === 'function') return savePDF.toString();
        const base = location.pathname.replace(/\/[^/]*$/, '');
        try {
            const r = await fetch(`${base}/story_content/external_files/savePDF.js`);
            if (r.ok) return await r.text();
        } catch {}
        return null;
    }

    function extractCertImage(source) {
        if (!source) return null;
        const match = source.match(/(data:image\/jpeg;base64,[A-Za-z0-9+/=]+)/);
        return match?.[1] ?? null;
    }

    function buildDoc(title, certImage) {
        return {
            pageSize: 'A4',
            pageOrientation: 'landscape',
            pageMargins: [250, 250, 250, 50],
            watermark: { text: 'DCSA', color: 'white', opacity: 0.1, bold: true },
            background: certImage ? (page) => {
                if (page !== 2) {
                    return [{ image: 'certificate', alignment: 'center', width: 800 }];
                }
            } : undefined,
            content: [
                { text: 'This is to certify that', fontSize: 16, alignment: 'center', margin: [0, -80] },
                { text: YOUR_NAME,                 fontSize: 36, alignment: 'center', margin: [0, 90]  },
                { text: 'has completed',           fontSize: 16, alignment: 'center', margin: [0, -80] },
                { text: document.title,            fontSize: 24, alignment: 'center', margin: [0, 90]  },
                { text: getFormattedDate(),        fontSize: 16, alignment: 'center', margin: [0, -40] },
            ],
            images: certImage ? { certificate: certImage } : undefined,
        };
    }

    async function generateCertificate() {
        if (typeof pdfMake === 'undefined') {
            console.error('[AutoCert] pdfMake is not available.');
            return;
        }

        const source = await getSavePDFSource();
        const certImage = extractCertImage(source);

        if (!certImage) console.warn('[AutoCert] No certificate background found — generating without it.');

        const doc = buildDoc(document.title, certImage);
        pdfMake.createPdf(doc)[ACTION === 'print' ? 'print' : 'download'](`${document.title}.pdf`);
        console.log(`[AutoCert] Certificate generated for: ${YOUR_NAME} — "${document.title}"`);
    }

    function waitForPdfMake(callback, maxAttempts = 50) {
        let attempts = 0;
        const interval = setInterval(() => {
            if (typeof pdfMake !== 'undefined') {
                clearInterval(interval);
                callback();
            } else if (++attempts >= maxAttempts) {
                clearInterval(interval);
                console.error('[AutoCert] pdfMake failed to load.');
            }
        }, 500);
    }

    window.autoCert = generateCertificate;

    if (AUTO_TRIGGER) {
        waitForPdfMake(generateCertificate);
    } else {
        console.log('[AutoCert] Ready — type autoCert() in the console to generate.');
    }
})();
