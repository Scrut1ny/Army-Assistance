// ==UserScript==
// @name         CSF Pretest Auto Submit
// @namespace    https://github.com/Scrut1ny
// @version      1.0
// @description  Instantly submits the CSF Pretest with correct answers.
// @author       Scrut1ny
// @match        https://cs.signal.army.mil/usermngmt/CyberFundamentals/lessons/pretest.asp
// @run-at       document-end
// @grant        none
// ==/UserScript==

(() => {
    const answerKey = {
        'security plan is to provide an overview': 'TRUE',
        'Virtual Private Network used for': 'Allows employees to connect securely',
        'IAW AR 25-2': '6 months',
        'Spyware is also known as adware': 'True',
        'What is Website security': 'Both A&B',
        'What is Cloud Computing': 'It enables remote access',
        'indication is a sign that an incident may never': 'FALSE',
        'Encryptions is a way to send a message': 'code',
        'What are rootkits': 'A piece of software',
        'What does LAMP stands for': 'Linux, Apache, My SQL and PHP',
        'four objectives of planning for security': 'Identify , design, test and monitor',
        'denial-of-service (DoS) attack occurs when legitimate': 'users, Information systems, devices',
        'Incident Response Plans allows for': 'A timely and controlled response',
        'Indications of an incident fall into two categories': 'Indications and precursors',
        'your wireless data prevents anyone': 'Encrypting',
        'How often do all cybersecurity workforce personnel': 'Every year',
        'current DoD repository for sharing security authorization': 'Enterprise Mission Assurance Support Service (eMass)',
        'certifications would satisfy IAM level II and IAM level III': 'CISSP',
        'categories require a privileged access agreement': 'Both IA Technical & IA Management',
        'What is a fake Antivirus': 'Malicious software designed to steal',
        'Botnet is a term derived from the idea of bot networks': 'True',
        'two common denial-of-service attacks are': 'Smurf Attack and Syn Flood',
        'network infrastructure devices': 'All',
        'Interoperability is a weakness in Cloud Computing': 'TRUE',
        'three main cloud computing service models': 'Software as a Service, platform as a Service and Infrastructure as a Service',
        'War Driving is not a type of wireless piggybacking': 'FALSE',
        'What is a hash function': 'A fixed-length string',
        'website defacement and DoS possible cyberattacks': 'True',
        'SSID stands for': 'Service Set Identifier',
        'Security plans are not living documents': 'FALSE',
        'precursor is a sign that an incident may occur in the future': 'True',
        'Shoulder Surfing is a good thing': 'FALSE',
        'How can I protect myself against fake antiviruses': 'All',
        'Distributed Denial-of-Service attack': 'It occurs when multiple machines are operating',
        'Viruses, Worms and Trojan horses': 'True',
        'Cybersecurity is not a holistic program': 'FALSE',
    };

    const form = document.querySelector('form[name="CSFpretest"]');
    if (!form) return;

    const blocks = form.querySelectorAll('blockquote');

    blocks.forEach(bq => {
        const questionEl = bq.previousElementSibling;
        if (!questionEl) return;
        const questionText = questionEl.textContent.trim();

        const radios = bq.querySelectorAll('input[type="radio"]');

        for (const [keyword, answerSnippet] of Object.entries(answerKey)) {
            if (questionText.includes(keyword)) {
                for (const radio of radios) {
                    const radioText = radio.nextSibling.textContent.trim();
                    if (radioText.includes(answerSnippet) || answerSnippet.includes(radioText)) {
                        radio.checked = true;
                        break;
                    }
                }
                break;
            }
        }
    });

    form.submit();
})();
