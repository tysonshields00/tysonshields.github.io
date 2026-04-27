/**
 * main.js - Global Interactivity & Component Loading
 * Tyson W. Shields | 2026
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize the site components
    initSite();
});

async function initSite() {
    // 1. Load the shared UI components
    await loadComponent('navbar-placeholder', '/src/components/navbar.html');
    await loadComponent('footer-placeholder', '/src/components/footer.html');

    // 2. Run page-specific logic
    highlightActiveNav();
    setupMobileMenu();
}

/**
 * Fetches a component and injects it into a placeholder element
 * @param {string} elementId - The ID of the div to fill
 * @param {string} path - The path to the HTML component
 */
async function loadComponent(elementId, path) {
    const placeholder = document.getElementById(elementId);
    if (!placeholder) return;

    try {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`Failed to load ${path}`);
        const html = await response.text();
        placeholder.innerHTML = html;
    } catch (error) {
        console.error('Component Loading Error:', error);
    }
}

/**
 * Automatically adds the 'active' class to the nav link 
 * matching the current page URL.
 */
function highlightActiveNav() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-links a');

    navLinks.forEach(link => {
        // If the href matches the current path, highlight it
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
        
        // Edge case for root index.html
        if (currentPath === '/' && link.getAttribute('href').includes('index.html')) {
            link.classList.add('active');
        }
    });
}

/**
 * Handles the mobile menu toggle logic
 */
function setupMobileMenu() {
    // Using event delegation because the navbar is loaded dynamically
    document.addEventListener('click', (e) => {
        const menuToggle = e.target.closest('#mobile-menu');
        const navLinks = document.querySelector('.nav-links');

        if (menuToggle) {
            navLinks.classList.toggle('nav-active');
            menuToggle.classList.toggle('toggle-active');
        }
    });
}