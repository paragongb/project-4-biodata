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
function showCertificate(name, org, date, imageCount = 1) {
    document.getElementById('modalCertName').textContent = name;
    document.getElementById('modalCertOrg').textContent = org;
    document.getElementById('modalCertDate').textContent = date;

    const imageContainer = document.getElementById('modalImageContainer');
    imageContainer.innerHTML = ''; 

    for (let i = 1; i <= imageCount; i++) {
        const imgPlaceholder = document.createElement('div');
        imgPlaceholder.className = 'modal-image-placeholder';
        imgPlaceholder.textContent = `Certificate Image ${i}`;
        imageContainer.appendChild(imgPlaceholder);
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
