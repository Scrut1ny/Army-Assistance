(async () => {
	const AUTO_SUBMIT = false;

	// Answer Bank
	const ANSWER_BANK = [{
			q: "security plans are not living documents",
			answer: "False"
		},
		{
			q: "viruses, worms and trojan horses are types of malicious code",
			answer: "True"
		},
		{
			q: "security plan is to provide an overview of the security requirements",
			answer: "True"
		},
		{
			q: "a precursor is a sign that an incident may occur",
			answer: "True"
		},
		{
			q: "shoulder surfing is a good thing",
			answer: "False"
		},
		{
			q: "iaw ar 25-2",
			match: "6 months"
		},
		{
			q: "virtual private network used for",
			match: "connect securely"
		},
		{
			q: "what is a hash function",
			match: "fixed-length string"
		},
		{
			q: "protect myself against fake antivirus",
			match: "all"
		},
		{
			q: "dod 8570.01-m",
			match: "i, ii, & iii"
		},
		{
			q: "four objectives of planning for security",
			match: "identify"
		},
		{
			q: "distributed denial-of-service",
			match: "multiple machines"
		},
		{
			q: "ssid stands for",
			match: "service set identifier"
		},
		{
			q: "what are rootkits",
			match: "piece of software"
		},
		{
			q: "incident response plan",
			match: "timely and controlled response"
		},
		{
			q: "network infrastructure devices",
			match: "all"
		},
		{
			q: "categories require a privileged access agreement",
			match: "ia technical"
		},
	];

	const log = (icon, ...a) => console.log(icon, ...a);
	const BASE = location.origin + '/moodle';

	// Session & Attempt Detection
	log('⚙️', 'Initializing...');
	const sesskey = document.querySelector('input[name="sesskey"]')?.value ||
		(document.body.innerHTML.match(/"sesskey":"([^"]+)"/) || [])[1];
	if (!sesskey) throw '❌ No sesskey found.';

	let attemptId = (location.href.match(/attempt=(\d+)/) || [])[1];
	let cmid = (location.href.match(/(?:cmid|id)=(\d+)/) || [])[1];
	if (!attemptId) {
		const html = cmid ? await fetch(`${BASE}/mod/quiz/view.php?id=${cmid}`, {
			credentials: 'include'
		}).then(r => r.text()) : document.body.innerHTML;
		const link = new DOMParser().parseFromString(html, 'text/html').querySelector('a[href*="attempt.php"]');
		if (link) {
			attemptId = (link.href.match(/attempt=(\d+)/) || [])[1];
			cmid = cmid || (link.href.match(/cmid=(\d+)/) || [])[1];
		}
	}
	if (!attemptId || !cmid) throw '❌ No active attempt found.';
	log('🔑', `Attempt: ${attemptId} | CMID: ${cmid}`);

	// Fetch All Pages
	const firstHtml = await fetch(`${BASE}/mod/quiz/attempt.php?attempt=${attemptId}&cmid=${cmid}&page=0`, {
		credentials: 'include'
	}).then(r => r.text());
	const totalPages = parseInt((new DOMParser().parseFromString(firstHtml, 'text/html').querySelector('title')?.textContent?.match(/of\s+(\d+)\)/) || [])[1]) || 0;
	if (!totalPages) throw '❌ Cannot detect page count.';
	log('📄', `${totalPages} questions detected`);

	const pageHtmls = [firstHtml];
	if (totalPages > 1) {
		const rest = await Promise.all(Array.from({
				length: totalPages - 1
			}, (_, i) =>
			fetch(`${BASE}/mod/quiz/attempt.php?attempt=${attemptId}&cmid=${cmid}&page=${i + 1}`, {
				credentials: 'include'
			}).then(r => r.text())
		));
		pageHtmls.push(...rest);
	}

	// Parse & Match
	const slots = [];
	let matched = 0,
		unmatched = 0;

	for (let i = 0; i < pageHtmls.length; i++) {
		const doc = new DOMParser().parseFromString(pageHtmls[i], 'text/html');
		const q = doc.querySelector('.que');
		if (!q) continue;
		const qtext = q.querySelector('.qtext')?.textContent?.trim() || '';
		const qtextLower = qtext.toLowerCase();
		const radios = [...q.querySelectorAll('input[type=radio]')].filter(r => r.value !== '-1');
		const options = radios.map(r => {
			let text = '';
			try {
				text = doc.querySelector(`label[for="${CSS.escape(r.id)}"]`)?.textContent?.trim();
			} catch (e) {}
			if (!text) try {
				text = doc.getElementById(r.id + '_label')?.textContent?.trim();
			} catch (e) {}
			if (!text) text = r.closest('div')?.querySelector('.flex-fill')?.textContent?.trim() || '';
			return {
				value: r.value,
				text,
				textLower: text.toLowerCase()
			};
		});
		const fieldName = radios[0]?.name;
		const slot = (fieldName?.match(/:(\d+)_/) || [])[1];
		const seqCheck = doc.querySelector('input[name$=":sequencecheck"]')?.value;

		let selectedValue = null;
		const entry = ANSWER_BANK.find(b => qtextLower.includes(b.q));
		if (entry) {
			if (entry.answer) {
				selectedValue = options.find(o => o.textLower === entry.answer.toLowerCase())?.value;
			} else if (entry.match) {
				const target = entry.match.toLowerCase();
				selectedValue = (
					options.find(o => o.textLower.replace(/^[a-d]\.\s*/, '') === target) ||
					options.find(o => o.textLower.replace(/^[a-d]\.\s*/, '').startsWith(target)) ||
					options.find(o => o.textLower.includes(target))
				)?.value;
			}
		}

		if (selectedValue != null) {
			matched++;
			log('✅', `Q${slot}: "${qtext.substring(0, 60)}..." → ${options.find(o => o.value === selectedValue)?.text}`);
		} else {
			unmatched++;
			log('❓', `Q${slot}: "${qtext.substring(0, 60)}..." → NO MATCH`);
			log('   ', 'Options:', options.map(o => `[${o.value}] ${o.text}`).join(' | '));
		}
		slots.push({
			slot,
			fieldName,
			selectedValue,
			seqCheck
		});
	}

	log('📊', `Matched: ${matched}/${matched + unmatched}`);

	// Save Answers
	const answeredSlots = slots.filter(s => s.selectedValue != null);
	if (!answeredSlots.length) throw '❌ No answers matched!';

	const params = new URLSearchParams();
	params.set('attempt', attemptId);
	params.set('sesskey', sesskey);
	params.set('slots', answeredSlots.map(s => s.slot).join(','));
	for (const s of answeredSlots) {
		params.set(s.fieldName, s.selectedValue);
		params.set(s.fieldName.replace('_answer', '_:sequencecheck'), s.seqCheck);
	}

	log('💾', 'Saving...');
	const res = await fetch(`${BASE}/mod/quiz/autosave.ajax.php`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: params.toString(),
		credentials: 'include'
	}).then(r => r.json());
	if (res.status !== 'OK') throw '❌ Save failed: ' + JSON.stringify(res);

	// Verify
	const sumHtml = await fetch(`${BASE}/mod/quiz/summary.php?attempt=${attemptId}&cmid=${cmid}`, {
		credentials: 'include'
	}).then(r => r.text());
	const sDoc = new DOMParser().parseFromString(sumHtml, 'text/html');
	log('📋', `Verified: ${sDoc.querySelectorAll('tr.answersaved').length} saved, ${sDoc.querySelectorAll('tr.notyetanswered').length} unanswered`);

	for (const s of answeredSlots) {
		const radio = document.querySelector(`input[name="${s.fieldName}"][value="${s.selectedValue}"]`);
		if (radio) radio.checked = true;
	}

	// Submit or Prompt
	if (AUTO_SUBMIT && unmatched === 0) {
		log('🚀', 'Submitting...');
		await fetch(`${BASE}/mod/quiz/processattempt.php`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: new URLSearchParams({
				attempt: attemptId,
				finishattempt: '1',
				timeup: '0',
				slots: '',
				cmid,
				sesskey
			}).toString(),
			credentials: 'include'
		});
		log('🏁', 'Submitted!');
		log('📄', `Review → ${BASE}/mod/quiz/review.php?attempt=${attemptId}&cmid=${cmid}`);
	} else {
		log('🏁', `Done! ${matched}/${matched + unmatched} answered.` + (unmatched ? ` ⚠️ ${unmatched} unmatched!` : ''));
		log('👉', `Submit → ${BASE}/mod/quiz/summary.php?attempt=${attemptId}&cmid=${cmid}`);
	}
})();
