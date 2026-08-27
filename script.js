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
    }

    function scrollToSection(event, sectionId) {
        if (event) event.preventDefault();
        document.getElementById('main-page').classList.add('active');
        document.querySelectorAll('.page').forEach(page => {
            if (page.id !== 'main-page') page.classList.remove('active');
        });
        document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function showCertificate(name, org, date) {
        document.getElementById('modalCertName').textContent = name;
        document.getElementById('modalCertOrg').textContent = org;
        document.getElementById('modalCertDate').textContent = date;
        document.getElementById('certificateModal').classList.add('active');
    }

    function closeCertificateModal() {
        document.getElementById('certificateModal').classList.remove('active');
    }
