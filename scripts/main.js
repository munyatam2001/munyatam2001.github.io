// Mobile nav toggle
const navToggleButton = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
if (navToggleButton && navLinks) {
	navToggleButton.addEventListener('click', () => {
		navLinks.classList.toggle('show');
	});
}

// Year in footer
const yearEl = document.getElementById('year');
if (yearEl) {
	yearEl.textContent = new Date().getFullYear();
}

// Will be populated from structured JSON; fallback placeholders
let resumeData = {
	name: 'Your Name',
	summary: 'Short professional summary will appear here.',
	projects: [],
	experience: [],
	education: [],
	skills: []
};

function createProjectCard(project) {
	const card = document.createElement('article');
	card.className = 'card';
	card.innerHTML = `
		${project.image ? `<div class="card-thumb"><img src="${project.image}" alt="${project.title}"></div>` : ''}
		<h3>${project.title}</h3>
		<p class="muted">${project.description}</p>
		<div class="tags">${(project.tech || []).map(t => `<li>${t}</li>`).join('')}</div>
		<p><a href="${project.url}" target="_blank" rel="noopener">View</a></p>
	`;
	return card;
}

function createTimelineItem(item) {
	const el = document.createElement('article');
	el.className = 'timeline-item';
	el.innerHTML = `
		<div class="heading">
			<h3>${item.role || item.degree || ''}</h3>
			<span class="muted">${item.period || ''}</span>
		</div>
		<p class="muted">${item.company || item.school || ''}</p>
		${item.summary ? `<p>${item.summary}</p>` : ''}
		${item.bullets ? `<ul>${item.bullets.map(b => `<li>${b}</li>`).join('')}</ul>` : ''}
	`;
	return el;
}

function mount() {
	const projectsGrid = document.getElementById('projects-grid');
	const experienceList = document.getElementById('experience-list');
	const educationList = document.getElementById('education-list');
	const skillsList = document.getElementById('skills-list');
	const nameLogo = document.getElementById('name-logo');
	const nameHero = document.getElementById('name-hero');
	const nameFooter = document.getElementById('name-footer');
	const aboutSummary = document.getElementById('about-summary');
	const contactEmail = document.getElementById('contact-email');
	const contactLinkedIn = document.getElementById('contact-linkedin');

	if (projectsGrid) resumeData.projects.forEach(p => projectsGrid.appendChild(createProjectCard(p)));
	if (experienceList) resumeData.experience.forEach(e => experienceList.appendChild(createTimelineItem(e)));
	if (educationList) resumeData.education.forEach(e => educationList.appendChild(createTimelineItem(e)));
	if (skillsList) resumeData.skills.forEach(s => {
		const li = document.createElement('li');
		li.textContent = s;
		skillsList.appendChild(li);
	});

	if (nameLogo && resumeData.name) nameLogo.textContent = resumeData.name;
	if (nameHero && resumeData.name) nameHero.textContent = resumeData.name;
	if (nameFooter && resumeData.name) nameFooter.textContent = resumeData.name;
	if (aboutSummary && resumeData.summary) aboutSummary.textContent = resumeData.summary;
	if (resumeData.contact) {
		const emailMatch = String(resumeData.contact).match(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/);
		if (emailMatch && contactEmail) {
			contactEmail.textContent = emailMatch[0];
			contactEmail.href = `mailto:${emailMatch[0]}`;
		}
		const linkedinMatch = String(resumeData.contact).match(/linkedin\S*/i);
		if (linkedinMatch && contactLinkedIn) {
			const base = linkedinMatch[0].startsWith('http') ? linkedinMatch[0] : `https://www.${linkedinMatch[0]}.com`;
			contactLinkedIn.textContent = base.replace(/^https?:\/\//, '');
			contactLinkedIn.href = base;
		}
	}
}

async function bootstrap() {
	try {
		const res = await fetch('/assets/resume/structured.json', { cache: 'no-store' });
		if (res.ok) {
			const data = await res.json();
			resumeData = {
				...resumeData,
				...data,
				projects: (data.projects || data.projects_raw || []).slice(0, 6).map((p, i) => {
					const base = typeof p === 'string' ? ({ title: `Project ${i+1}`, description: p, url: '#', tech: [] }) : p;
					if (i === 0 && !base.image) base.image = '/assets/PXL_20231006_173340941.jpg';
					return base;
				}),
				experience: (data.experience || data.experience_raw || []).slice(0, 6).map((e) => typeof e === 'string' ? ({ role: e, period: '', company: '', summary: e }) : e),
				education: (data.education || data.education_raw || []).slice(0, 4).map((e) => typeof e === 'string' ? ({ degree: e, period: '', school: '' }) : e),
				skills: Array.isArray(data.skills) ? data.skills.slice(0, 60) : resumeData.skills,
			};
		}
	} catch (e) {
		// Ignore fetch errors for file: protocol
	} finally {
		mount();
	}
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', bootstrap);
} else {
	bootstrap();
}

