// Function to load HTML components dynamically
async function loadComponent(elementId) {
    const container = document.getElementById(elementId);
    if (!container) return;

    const filePath = container.getAttribute('data-path');
    
    try {
        const response = await fetch(filePath);
        if (response.ok) {
            const html = await response.text();
            container.innerHTML = html;
        } else {
            console.error(`Failed to load ${filePath}`);
        }
    } catch (error) {
        console.error(`Error loading component: ${error}`);
    }
}

// Initialize components when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Determine the relative path back to the root based on current location
    const depth = window.location.pathname.split('/').length - 2;
    const prefix = depth > 0 ? '../'.repeat(depth) : '';

    // Adjust paths dynamically before loading
    const navContainer = document.getElementById('navbar-container');
    const footerContainer = document.getElementById('footer-container');
    
    if (navContainer) {
        navContainer.setAttribute('data-path', prefix + 'src/components/navbar.html');
        loadComponent('navbar-container');
    }
    
    if (footerContainer) {
        footerContainer.setAttribute('data-path', prefix + 'src/components/footer.html');
        loadComponent('footer-container');
    }
});