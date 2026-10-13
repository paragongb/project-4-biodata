// --- MOBILE MENU LOGIC ---
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    menuToggle.setAttribute('aria-expanded', String(navLinks.classList.contains('active')));
});

function closeMobileMenu() {
    menuToggle.setAttribute('aria-expanded', 'false');
    if (navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
    }
}

// --- THEME LOGIC ---
const themeToggle = document.querySelector('.theme-toggle');

function setDarkMode(isDark) {
    document.body.classList.toggle('dark-mode', isDark);
    themeToggle.setAttribute('aria-pressed', String(isDark));
    themeToggle.setAttribute('aria-label', isDark ? 'Disable dark mode' : 'Enable dark mode');
    themeToggle.setAttribute('title', isDark ? 'Toggle light mode' : 'Toggle dark mode');
}

function toggleDarkMode() {
    const isDark = !document.body.classList.contains('dark-mode');
    setDarkMode(isDark);
    localStorage.setItem('darkMode', String(isDark));
}

setDarkMode(localStorage.getItem('darkMode') === 'true');

// Do not leave broken-image markers when a third-party brand logo is unavailable.
document.querySelectorAll('.skill-icon, .contact-icon').forEach((icon) => {
    const removeBrokenIcon = () => icon.remove();

    if (icon.complete && icon.naturalWidth === 0) {
        removeBrokenIcon();
    } else {
        icon.addEventListener('error', removeBrokenIcon, { once: true });
    }
});

// --- COURSEWORK VISIBILITY ---
const coursework = document.getElementById('coursework');
const courseworkNavItem = document.getElementById('courseworkNavItem');
const courseworkToggle = document.getElementById('courseworkToggle');

function setCourseworkVisibility(isVisible, persist = false) {
    coursework.classList.toggle('coursework-hidden', !isVisible);
    courseworkNavItem.classList.toggle('coursework-nav-hidden', !isVisible);
    courseworkToggle.checked = isVisible;
    courseworkToggle.setAttribute('aria-checked', String(isVisible));
    coursework.setAttribute('aria-hidden', String(!isVisible));
    coursework.inert = !isVisible;
    courseworkNavItem.inert = !isVisible;

    if (persist) {
        localStorage.setItem('courseworkVisible', String(isVisible));
        if (!isVisible && document.body.dataset.view === 'coursework') scrollToSection(null, 'work');
    }
}

// Coursework is currently unpublished, regardless of a visitor's saved preference.
setCourseworkVisibility(false);
courseworkToggle.addEventListener('change', () => setCourseworkVisibility(courseworkToggle.checked, true));

// --- NAVIGATION LOGIC ---
function showProject(projectId) {
    if (!document.getElementById(projectId)) return;
    document.querySelectorAll('video').forEach(video => video.pause());
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(projectId).classList.add('active');
    document.body.dataset.view = 'project';
    document.querySelectorAll('.nav-links a').forEach(link => link.classList.toggle('is-active', link.hash === '#work'));
    closeMobileMenu();
    if (location.hash !== '#' + projectId) history.pushState(null, '', '#' + projectId);
    const heading = document.querySelector('#' + projectId + ' h2');
    heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
    animateView(document.getElementById(projectId));
}

function showMainPage(event) {
    if (event) event.preventDefault();
    document.querySelectorAll('video').forEach(video => video.pause());
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById('main-page').classList.add('active');
    document.body.dataset.view = 'home';
    if (location.hash !== '#main-page') history.pushState(null, '', '#main-page');
    document.querySelectorAll('.nav-links a').forEach(link => link.classList.remove('is-active'));
    window.scrollTo({ top: 0, behavior: 'instant' });
    
    closeMobileMenu(); 
}

function scrollToSection(event, sectionId) {
    if (event) event.preventDefault();
    if (sectionId === 'main-page') { showMainPage(); return; }
    if (sectionId === 'work-archive' || sectionId === 'interactive-work') { showArchive(sectionId === 'interactive-work'); return; }
    if (sectionId === 'coursework' && !courseworkToggle.checked) sectionId = 'work';
    document.querySelectorAll('video').forEach(video => video.pause());
    document.getElementById('main-page').classList.add('active');
    document.querySelectorAll('.page').forEach(page => {
        if (page.id !== 'main-page') page.classList.remove('active');
    });
    const section = document.getElementById(sectionId);
    if (!section) return;
    document.body.dataset.view = sectionId;
    section.classList.add('is-visible');
    if (location.hash !== '#' + sectionId) history.pushState(null, '', '#' + sectionId);
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.querySelectorAll('.nav-links a').forEach(link => link.classList.toggle('is-active', link.hash === '#' + sectionId));
    animateView(section);
    
    closeMobileMenu(); 
}


// --- MODAL LOGIC ---
const anthropicCertificateImages = [
    'certificates/anthropic/previews/anthropic-01-1.png',
    'certificates/anthropic/previews/anthropic-02-1.png',
    'certificates/anthropic/previews/anthropic-03-1.png',
    'certificates/anthropic/previews/anthropic-04-1.png',
    'certificates/anthropic/previews/anthropic-05-1.png',
    'certificates/anthropic/previews/anthropic-06-1.png',
    'certificates/anthropic/previews/anthropic-07-1.png',
    'certificates/anthropic/previews/anthropic-08-1.png',
    'certificates/anthropic/previews/anthropic-09-1.png',
    'certificates/anthropic/previews/anthropic-10-1.png'
];

const eLatihCertificateImages = [
    'certificates/elatih/previews/elatih-01.png',
    'certificates/elatih/previews/elatih-02.png',
    'certificates/elatih/previews/elatih-03.png',
    'certificates/elatih/previews/elatih-04.png'
];

const serviceDeskCertificateImages = [
    'certificates/servicedesk/Service%20Desk%20Simulator%20Certificate%201.png',
    'certificates/servicedesk/Service%20Desk%20Simulator%20Certificate%202.png',
    'certificates/servicedesk/Service%20Desk%20Simulator%20Certificate%203.png'
];

const certificate2016To2021Images = [
    'certificates/2016-2021/Certificate%201%20-%202016.jpg',
    'certificates/2016-2021/Certificate%202%20-%202017.jpg',
    'certificates/2016-2021/Certificate%203%20-%202017.jpg',
    'certificates/2016-2021/Certificate%204%20-%202018.jpg',
    'certificates/2016-2021/Certificate%205%20-%202019.jpg',
    'certificates/2016-2021/Certificate%206%20-%202019.jpg',
    'certificates/2016-2021/Certificate%207%20-%202019.jpg',
    'certificates/2016-2021/Certificate%208%20-%202019.jpg',
    'certificates/2016-2021/Certificate%209%20-%202021.jpg'
];

const studentExchangeCertificateImages = [
    'certificates/student_exchange_programme/previews/exchange-01-1.png'
];

const hackathonCertificateImages = [
    'certificates/hackathons/previews/hackathon-01-1.png'
];

const cybearsCertificateImages = [
    'certificates/cybears/previews/cybears-01-1.png'
];

const ciscoCertificateImages = [
    'certificates/cisco/previews/cisco-01.png',
    'certificates/cisco/previews/cisco-02.png',
    'certificates/cisco/previews/cisco-03.png',
    'certificates/cisco/previews/cisco-04.png'
];

function showCertificate(name, org, date, imageSources = 1) {
    document.getElementById('modalCertName').textContent = name;
    document.getElementById('modalCertOrg').textContent = org;
    document.getElementById('modalCertDate').textContent = date;

    const imageContainer = document.getElementById('modalImageContainer');
    imageContainer.innerHTML = ''; 

    if (Array.isArray(imageSources)) {
        imageSources.forEach((source, index) => {
            const image = document.createElement('img');
            image.className = 'certificate-preview';
            image.src = source;
            image.alt = `${name} ${index + 1}`;
            imageContainer.appendChild(image);
        });
    } else {
        for (let i = 1; i <= imageSources; i++) {
        const imgPlaceholder = document.createElement('div');
        imgPlaceholder.className = 'modal-image-placeholder';
        imgPlaceholder.textContent = `Certificate Image ${i}`;
        imageContainer.appendChild(imgPlaceholder);
        }
    }

    openModal('certificateModal');
}

function closeCertificateModal() {
    closeModal('certificateModal');
}

function showCoursework(title, description, zipLink) {
    document.getElementById('cwModalTitle').textContent = title;
    document.getElementById('cwModalDesc').textContent = description;
    
    document.getElementById('cwModalZip').href = zipLink;

    openModal('courseworkModal');
}

function closeCourseworkModal() {
    closeModal('courseworkModal');
}

// Selected-work carousel. The archive remains the single source for project copy.
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const heroMotionToggle = document.querySelector('.hero-motion-toggle');
heroMotionToggle.addEventListener('click', () => {
    const paused = document.querySelector('.hero').classList.toggle('hero-motion-paused');
    heroMotionToggle.setAttribute('aria-pressed', String(paused));
    heroMotionToggle.setAttribute('aria-label', paused ? 'Resume moving background text' : 'Pause moving background text');
    heroMotionToggle.textContent = paused ? 'Resume text ▷' : 'Pause text Ⅱ';
});
const projectVisuals = [
    { category: 'Full-stack development', poster: 'others/project-previews/project-1.jpg' },
    { category: 'Machine learning / Accessibility', symbol: 'Aa', title: 'A language. A connection.', detail: 'AMERICAN SIGN LANGUAGE' },
    { category: 'Game development', poster: 'others/project-previews/project-3.jpg' },
    { category: 'Frontend / Design', symbol: 'gb.', title: 'Curiosity, on display.', detail: 'PERSONAL PORTFOLIO' },
    { category: 'Java / Data structures', symbol: '{ }', title: 'Learn through play.', detail: '7 GAMES · 7 CONCEPTS' },
    { category: 'Computer vision / Machine learning', poster: 'others/project-previews/project-6.jpg' },
    { category: 'C++ / Real-time audio', poster: 'others/project-previews/project-7.jpg' },
    { category: 'IT support / Troubleshooting', symbol: '>_', title: 'Investigate. Resolve. Document.', detail: 'SUPPORT TICKET PRACTICE' }
];
const projectCards = [...document.querySelectorAll('.interactive-card:not(.locked-card)')];
const galleryStage = document.getElementById('galleryStage');
const galleryDots = document.getElementById('galleryDots');
let selectedProject = 0;
projectVisuals.forEach((visual, index) => {
    const slide = document.createElement('button');
    slide.className = 'gallery-slide';
    slide.type = 'button';
    slide.dataset.label = String(index + 1).padStart(2, '0') + ' / ' + visual.category.toUpperCase();
    slide.setAttribute('aria-label', projectCards[index].querySelector('h3').textContent);
    if (visual.poster) {
        const image = document.createElement('img');
        image.src = visual.poster;
        image.alt = '';
        image.loading = 'lazy';
        slide.append(image);
        document.querySelectorAll('#project' + (index + 1) + ' video').forEach(video => video.poster = visual.poster);
    } else {
        const art = document.createElement('div');
        art.className = 'gallery-art';
        for (const [tag, text, className] of [['span', visual.symbol, 'art-symbol'], ['strong', visual.title, ''], ['small', visual.detail, '']]) {
            const element = document.createElement(tag);
            element.textContent = text;
            element.className = className;
            art.append(element);
        }
        slide.append(art);
    }
    slide.addEventListener('click', () => index === selectedProject ? showProject('project' + (index + 1)) : selectProject(index));
    galleryStage.append(slide);
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', 'Show project ' + (index + 1) + ': ' + projectCards[index].querySelector('h3').textContent);
    dot.addEventListener('click', () => selectProject(index));
    galleryDots.append(dot);
});
function selectProject(index) {
    selectedProject = (index + projectCards.length) % projectCards.length;
    [...galleryStage.children].forEach((slide, i) => {
        let offset = (i - selectedProject + projectCards.length) % projectCards.length;
        if (offset > projectCards.length / 2) offset -= projectCards.length;
        slide.style.setProperty('--offset', offset);
        slide.style.setProperty('--scale', 1 - Math.min(Math.abs(offset), 3) * .15);
        slide.style.setProperty('--depth', 10 - Math.abs(offset));
        slide.style.setProperty('--opacity', Math.abs(offset) > 2 ? 0 : 1 - Math.abs(offset) * .17);
        slide.classList.toggle('is-current', offset === 0);
        slide.inert = Math.abs(offset) > 2;
        slide.setAttribute('aria-hidden', String(Math.abs(offset) > 2));
        slide.tabIndex = offset === 0 ? 0 : -1;
        galleryDots.children[i].setAttribute('aria-pressed', String(offset === 0));
    });
    document.getElementById('galleryTitle').textContent = projectCards[selectedProject].querySelector('h3').textContent;
    document.getElementById('galleryDescription').textContent = projectCards[selectedProject].querySelector('p').textContent;
    document.getElementById('galleryCategory').textContent = String(selectedProject + 1).padStart(2, '0') + ' / ' + projectVisuals[selectedProject].category;
}
document.getElementById('previousProject').addEventListener('click', () => selectProject(selectedProject - 1));
document.getElementById('nextProject').addEventListener('click', () => selectProject(selectedProject + 1));
document.getElementById('openGalleryProject').addEventListener('click', () => showProject('project' + (selectedProject + 1)));
document.querySelector('.project-gallery').addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        selectProject(selectedProject + (event.key === 'ArrowRight' ? 1 : -1));
    }
});
let touchStart;
galleryStage.addEventListener('touchstart', event => { touchStart = event.changedTouches[0]; }, { passive: true });
galleryStage.addEventListener('touchend', event => {
    if (!touchStart) return;
    const dx = event.changedTouches[0].clientX - touchStart.clientX;
    const dy = event.changedTouches[0].clientY - touchStart.clientY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) selectProject(selectedProject + (dx < 0 ? 1 : -1));
    touchStart = null;
}, { passive: true });
selectProject(0);

const archiveToggle = document.getElementById('archiveToggle');
archiveToggle.addEventListener('click', () => showArchive());

// Keyboard access for existing cards, plus focus management for the galleries.
document.querySelectorAll('.certificate-card, .interactive-card:not(.locked-card)').forEach(card => {
    card.setAttribute('role', 'button');
    card.tabIndex = 0;
    card.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); card.click(); }
    });
});
let modalTrigger = null;
function openModal(id) {
    modalTrigger = document.activeElement;
    const modal = document.getElementById(id);
    modal.classList.add('active');
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', id === 'certificateModal' ? 'modalCertName' : 'cwModalTitle');
    document.body.classList.add('modal-open');
    document.querySelectorAll('.navbar, .container, .site-footer, .coursework-visibility-control').forEach(el => el.inert = true);
    modal.querySelector('.modal-box').scrollTop = 0;
    modal.querySelector('.modal-close').setAttribute('aria-label', 'Close dialog');
    modal.querySelector('.modal-close').focus();
}
function closeModal(id) {
    document.getElementById(id).classList.remove('active');
    document.body.classList.remove('modal-open');
    document.querySelectorAll('.navbar, .container, .site-footer, .coursework-visibility-control').forEach(el => el.inert = false);
    modalTrigger?.focus({ preventScroll: true });
}
document.addEventListener('keydown', event => {
    const modal = document.querySelector('.modal-overlay.active');
    if (event.key === 'Escape') {
        if (modal) closeModal(modal.id);
        else closeMobileMenu();
    }
    if (modal && event.key === 'Tab') {
        const focusable = [...modal.querySelectorAll('button, a[href], [tabindex="0"]')];
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
});
document.addEventListener('click', event => { if (!event.target.closest('.navbar')) closeMobileMenu(); });

// Keep missing recordings tidy until the next uploads arrive.
document.querySelectorAll('video').forEach(video => {
    const showUnavailable = () => {
        if (video.nextElementSibling?.classList.contains('video-unavailable')) return;
        const message = document.createElement('div');
        message.className = 'video-unavailable';
        message.innerHTML = '<span aria-hidden="true">▷</span>Recording coming soon';
        video.hidden = true;
        video.after(message);
    };
    video.addEventListener('error', showUnavailable);
    video.querySelectorAll('source').forEach(source => source.addEventListener('error', showUnavailable));
    if (video.error || video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) showUnavailable();
});

// Gentle reveals, with all content immediately visible for reduced-motion users.
if (!motionPreference.matches && 'IntersectionObserver' in window) {
    document.body.classList.add('js-motion');
    const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target); }
    }), { threshold: .05 });
    document.querySelectorAll('.section-heading, .skill-bar, .about-copy, .experience-box, .certificate-card, .footer-content').forEach(el => {
        el.classList.add('reveal');
        revealObserver.observe(el);
    });
}
function restoreRoute() {
    const id = location.hash.slice(1);
    if (/^project[1-8]$/.test(id)) showProject(id);
    else if (id === 'interactive-work' || id === 'work-archive') showArchive(id === 'interactive-work');
    else if (id && document.getElementById(id)) scrollToSection(null, id);
    else showMainPage();
}
window.addEventListener('popstate', restoreRoute);

// Reference-style section transitions and type-on headings.
const headingTimers = new WeakMap();
function animateView(section) {
    section.getAnimations().forEach(animation => animation.cancel());
    if (!motionPreference.matches) section.animate(
        [{ opacity: 0, transform: 'translateY(12px)', filter: 'blur(3px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }],
        { duration: 460, easing: 'cubic-bezier(.2,.7,.2,1)' }
    );
    section.querySelectorAll('[data-type-heading]').forEach(heading => {
        clearTimeout(headingTimers.get(heading));
        const text = heading.dataset.fullTitle || heading.textContent;
        heading.dataset.fullTitle = text;
        heading.setAttribute('aria-label', text);
        if (motionPreference.matches) { heading.textContent = text; return; }
        heading.replaceChildren();
        const measure = document.createElement('span');
        measure.className = 'type-measure';
        measure.textContent = text;
        measure.setAttribute('aria-hidden', 'true');
        const typed = document.createElement('span');
        typed.className = 'type-text typing';
        typed.setAttribute('aria-hidden', 'true');
        heading.append(measure, typed);
        let position = 0;
        function tick() {
            typed.textContent = text.slice(0, ++position);
            if (position < text.length) headingTimers.set(heading, setTimeout(tick, 25));
            else headingTimers.set(heading, setTimeout(() => typed.classList.remove('typing'), 600));
        }
        tick();
    });
}

// Compact, original brand marks drawn from the existing skills.
const iconGrid = document.getElementById('capabilityIcons');
const skillIconSources = [...document.querySelectorAll('.skill-tag img')];
skillIconSources.slice(0,20).forEach(original => {
    const tile = document.createElement('span');
    const label = original.parentElement.textContent.trim();
    tile.className = 'capability-icon-tile';
    tile.title = label;
    tile.setAttribute('aria-label', label);
    const icon = original.cloneNode();
    icon.loading = 'lazy';
    icon.addEventListener('error', () => tile.remove(), {once:true});
    tile.append(icon);
    iconGrid.append(tile);
});

// Separate archive view, retaining the original eight project pages.
const archivePage = document.createElement('section');
archivePage.id = 'work-archive';
archivePage.className = 'page archive-page';
archivePage.innerHTML = '<div class="archive-tabs"><button type="button" data-archive="technical">Technical</button><button type="button" data-archive="interactive">Interactive</button><button type="button" class="archive-back">← Work gallery</button></div><p class="eyebrow">Archive</p><h2 class="expertise-title" data-type-heading>Technical Projects</h2><p class="section-intro">A complete collection of my systems, experiments, and interactive work.</p><div id="interactiveGrid" class="interactive-grid" hidden></div><div class="archive-cta"><h3>Let’s build<br>something useful.</h3><a class="outline-button" href="#contact" onclick="scrollToSection(event, &quot;contact&quot;)">Hire Me →</a></div>';
document.querySelector('.container').append(archivePage);
const archiveList = document.getElementById('projectArchive');
archivePage.insertBefore(archiveList, document.getElementById('interactiveGrid'));
const interactiveIDs = [3,5,7];
projectCards.forEach((card,index) => {
    const technologyText = document.querySelector('#project' + (index+1) + ' .technology-list')?.textContent.replace('Technologies:', '').trim();
    const tech = document.createElement('p');
    tech.className = 'archive-technologies';
    tech.textContent = technologyText || 'Ticket triage · Troubleshooting · Documentation';
    card.querySelector('.card-content').append(tech);
    if (interactiveIDs.includes(index+1)) {
        const tile = document.createElement('button');
        tile.className = 'interactive-project-tile';
        tile.type = 'button';
        tile.append(galleryStage.children[index].firstElementChild.cloneNode(true));
        const caption = document.createElement('span');
        caption.className = 'interactive-project-caption';
        const title = document.createElement('strong');
        title.textContent = card.querySelector('h3').textContent;
        const description = document.createElement('small');
        description.textContent = card.querySelector('p').textContent;
        caption.append(title,description);
        tile.append(caption);
        tile.addEventListener('click',()=>showProject('project'+(index+1)));
        document.getElementById('interactiveGrid').append(tile);
    }
});
function showArchive(interactive=false) {
    document.querySelectorAll('.nav-links a').forEach(link=>link.classList.toggle('is-active',link.hash==='#work'));
    document.querySelectorAll('video').forEach(video=>video.pause());
    document.querySelectorAll('.page').forEach(page=>page.classList.toggle('active',page===archivePage));
    document.body.dataset.view='archive';
    archiveList.hidden=interactive;
    document.getElementById('interactiveGrid').hidden=!interactive;
    archivePage.querySelector('[data-type-heading]').dataset.fullTitle=interactive?'Beyond Code':'Technical Projects';
    archivePage.querySelectorAll('[data-archive]').forEach(button=>button.setAttribute('aria-pressed',String((button.dataset.archive==='interactive')===interactive)));
    const hash=interactive?'#interactive-work':'#work-archive';
    if(location.hash!==hash)history.pushState(null,'',hash);
    closeMobileMenu();
    window.scrollTo({top:0,behavior:'instant'});
    animateView(archivePage);
}
archivePage.querySelectorAll('[data-archive]').forEach(button=>button.addEventListener('click',()=>showArchive(button.dataset.archive==='interactive')));
archivePage.querySelector('.archive-back').addEventListener('click',()=>scrollToSection(null,'work'));

// Certificate collage and alternating training stories use the real gallery assets.
const collections = [
 {title:'Anthropic Certificates',org:'Anthropic',images:anthropicCertificateImages,description:'A collection of completed Anthropic learning courses, documenting my continued exploration of artificial intelligence.'},
 {title:'e-LATIH Learning',org:'Human Resource Development Corporation',images:eLatihCertificateImages,description:'Courses covering prompt engineering, cybersecurity, advanced JavaScript, and machine-learning fundamentals.'},
 {title:'IT Support Training',org:'Service Desk Simulator',images:serviceDeskCertificateImages,description:'Practical service-desk training milestones supporting a structured approach to ticket investigation and troubleshooting.'},
 {title:'School Milestones',org:'SAINSKU – KMSw',images:certificate2016To2021Images,description:'Certificates collected throughout my studies from 2016 to 2021.'},
 {title:'Student Exchange Programme',org:'Universitas Brawijaya, Indonesia',images:studentExchangeCertificateImages,description:'An international exchange experience completed from September to November 2024, extending my learning beyond my home university.'},
 {title:'Hackathon Participation',org:'Deriv',images:hackathonCertificateImages,description:'Recognition from the Deriv AI Hackathon Challenge, part of my journey exploring practical technology and collaborative problem-solving.'},
 {title:'CYBEARS Cybersecurity Training',org:'APAC Cybersecurity Fund',images:cybearsCertificateImages,description:'Cybersecurity training focused on small and medium enterprises and entrepreneurs.'},
 {title:'IT Support Foundations',org:'Cisco Networking Academy',images:ciscoCertificateImages,description:'Training in hardware and upgrades, IT customer support, operating systems, and security and connectivity support.'}
];
[4,5,3,0,6,7].forEach((collectionIndex,index)=>{
 const collection=collections[collectionIndex];
 const tile=document.createElement('button');
 tile.type='button';
 tile.setAttribute('aria-label','View '+collection.title);
 tile.style.setProperty('--collage-index',index);
 const image=document.createElement('img');
 image.src=collection.images[0];image.alt=collection.title;image.loading='lazy';
 tile.append(image);
 tile.addEventListener('click',()=>showCertificate(collection.title,collection.org,'',collection.images));
 document.getElementById('certificateCollage').append(tile);
});
const stacks=[];
[4,5,7,6,0,1,2].forEach(index=>{
 const collection=collections[index];
 const story=document.createElement('article');
 story.className='training-story';
 const copy=document.createElement('div');
 copy.className='training-copy';
 const title=document.createElement('h3');title.textContent=collection.title;
 const org=document.createElement('h4');org.textContent=collection.org;
 const description=document.createElement('p');description.textContent=collection.description;
 const open=document.createElement('button');open.type='button';open.className='text-link';open.textContent='VIEW CERTIFICATE'+(collection.images.length>1?'S':'')+' ↗';
 open.addEventListener('click',()=>showCertificate(collection.title,collection.org,'',collection.images));
 copy.append(title,org,description,open);
 const stack=document.createElement('button');stack.type='button';stack.className='training-stack';stack.setAttribute('aria-label','View '+collection.title);
 collection.images.slice(0,3).forEach((src,i)=>{const image=document.createElement('img');image.src=src;image.alt=i===0?collection.title:'';image.loading='lazy';image.style.setProperty('--stack-index',i);stack.append(image)});
 stack.addEventListener('click',()=>showCertificate(collection.title,collection.org,'',collection.images));
 story.append(copy,stack);
 document.getElementById('trainingStories').append(story);
 stacks.push(stack);
});
function cycleStack(stack) {
 if(stack.children.length<2||stack.matches(':hover,:focus')||motionPreference.matches)return;
 stack.classList.add('is-shuffling');
 setTimeout(()=>{
  stack.append(stack.firstElementChild);
  [...stack.children].forEach((image,index)=>image.style.setProperty('--stack-index',index));
  stack.classList.remove('is-shuffling');
 },500);
}
setInterval(()=>{if(document.body.dataset.view==='experience'&&!document.hidden)stacks.forEach(cycleStack)},4500);

const traits=['Problem Solver','Curious','Builder','Lifelong Learner'];
let traitIndex=0,traitAnimating=false;
const traitStack=document.querySelector('.trait-stack');
function nextTrait(){
 if(traitAnimating)return;
 traitAnimating=true;
 traitStack.classList.add('is-shuffling');
 setTimeout(()=>{
  document.getElementById('traitLabel').textContent=traits[++traitIndex%traits.length];
  traitStack.classList.remove('is-shuffling');traitAnimating=false;
 },motionPreference.matches?0:350);
}
traitStack.addEventListener('click',nextTrait);
setInterval(()=>{if(document.body.dataset.view==='about'&&!document.hidden&&!motionPreference.matches&&!traitStack.matches(':hover,:focus'))nextTrait()},3800);

// Detailed contact cards and an honest, editable email-draft composer.
const contacts=[
 {label:'GITHUB',value:'github.com/paragongb'},
 {label:'WHATSAPP',value:'+60 11-5181 1980'},
 {label:'EMAIL',value:'jeradbobi03@gmail.com'}
];
document.querySelectorAll('.footer-links > a').forEach((link,index)=>{
 const image=link.querySelector('img');
 const arrow=link.querySelector('span');
 const info=document.createElement('span');info.className='contact-info';
 const label=document.createElement('small');label.textContent=contacts[index].label;
 const value=document.createElement('strong');value.textContent=contacts[index].value;
 info.append(label,value);
 link.replaceChildren(...(image?[image]:[]),info,arrow);
 link.dataset.number=String(index+1).padStart(2,'0');
});
const emailCard=document.querySelectorAll('.footer-links>a')[2];
document.querySelector('.footer-links').prepend(emailCard);
document.querySelectorAll('.footer-links > a').forEach((link,index)=>link.dataset.number=String(index+1).padStart(2,'0'));
const composeButton=document.createElement('button');
composeButton.type='button';composeButton.className='message-open';composeButton.textContent='SEND ME A MESSAGE →';
composeButton.addEventListener('click',()=>openComposer());
document.querySelector('.footer-links').append(composeButton);
const composer=document.getElementById('messageComposer');
const form=document.getElementById('contactForm');
let composerTrigger=null;
function openComposer(subject='Portfolio enquiry'){
 composerTrigger=document.activeElement;
 composer.hidden=false;
 form.inert=false;
 composer.classList.remove('is-minimized');
 document.getElementById('composerMinimize').setAttribute('aria-expanded','true');
 form.dataset.subject=subject;
 if(subject==='Resume request')form.elements.message.value='Hello Gerard, I visited your portfolio and would like to request your resume.';
 form.dispatchEvent(new Event('input'));
 form.elements.name.focus();
}
document.getElementById('composerClose').addEventListener('click',()=>{composer.hidden=true;composerTrigger?.focus()});
document.getElementById('composerMinimize').addEventListener('click',()=>{
 const minimized=composer.classList.toggle('is-minimized');
 document.getElementById('composerMinimize').setAttribute('aria-expanded',String(!minimized));
 form.inert=minimized;
});
function draftDetails(){
 return {subject:form.dataset.subject||'Portfolio enquiry',body:'Hello Gerard,\n\n'+form.elements.message.value+'\n\nFrom: '+form.elements.name.value+'\nEmail: '+form.elements.email.value};
}
form.addEventListener('input',()=>{const draft=draftDetails();document.getElementById('mailAppFallback').href='mailto:jeradbobi03@gmail.com?'+new URLSearchParams(draft)});
form.addEventListener('submit',event=>{
 event.preventDefault();
 const draft=draftDetails();
 window.open('https://mail.google.com/mail/?'+new URLSearchParams({view:'cm',fs:'1',to:'jeradbobi03@gmail.com',su:draft.subject,body:draft.body}),'_blank','noopener,noreferrer');
});
document.addEventListener('keydown',event=>{
 if(event.key==='Escape'&&!composer.hidden&&!document.querySelector('.modal-overlay.active')){composer.hidden=true;composerTrigger?.focus()}
});
// A short wheel/swipe on the opening screen advances into the work view.
window.addEventListener('wheel',event=>{if(document.body.dataset.view==='home'&&event.deltaY>35&&!document.querySelector('.modal-overlay.active'))scrollToSection(null,'work')},{passive:true});
let heroTouchY;
document.querySelector('.hero').addEventListener('touchstart',event=>heroTouchY=event.touches[0].clientY,{passive:true});
document.querySelector('.hero').addEventListener('touchend',event=>{if(heroTouchY-event.changedTouches[0].clientY>70)scrollToSection(null,'work')},{passive:true});
if(location.hash)restoreRoute();
