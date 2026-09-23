// --- MOBILE MENU LOGIC ---
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

function closeMobileMenu() {
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

    if (persist) {
        localStorage.setItem('courseworkVisible', String(isVisible));
    }
}

setCourseworkVisibility(localStorage.getItem('courseworkVisible') !== 'false');
courseworkToggle.addEventListener('change', () => setCourseworkVisibility(courseworkToggle.checked, true));

// --- NAVIGATION LOGIC ---
function showProject(projectId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(projectId).classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showMainPage(event) {
    if (event) event.preventDefault();
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById('main-page').classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    closeMobileMenu(); 
}

function scrollToSection(event, sectionId) {
    if (event) event.preventDefault();
    document.getElementById('main-page').classList.add('active');
    document.querySelectorAll('.page').forEach(page => {
        if (page.id !== 'main-page') page.classList.remove('active');
    });
    document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth', block: 'start' });
    
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

const serviceDeskCertificateImages = [
    'certificates/servicedesk/Service%20Desk%20Simulator%20Certificate%201.png',
    'certificates/servicedesk/Service%20Desk%20Simulator%20Certificate%202.png'
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

    document.getElementById('certificateModal').classList.add('active');
}

function closeCertificateModal() {
    document.getElementById('certificateModal').classList.remove('active');
}

function showCoursework(title, description, zipLink) {
    document.getElementById('cwModalTitle').textContent = title;
    document.getElementById('cwModalDesc').textContent = description;
    
    document.getElementById('cwModalZip').href = zipLink;

    document.getElementById('courseworkModal').classList.add('active');
}

function closeCourseworkModal() {
    document.getElementById('courseworkModal').classList.remove('active');
}
