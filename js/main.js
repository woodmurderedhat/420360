/**
 * Main JavaScript for 420360.xyz
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('420360.xyz - Gaming site initialized');
    
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Create placeholder images if needed
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', function() {
            // If image fails to load and doesn't already have a fallback
            if (!this.src.includes('placeholder.jpg')) {
                console.log('Image failed to load:', this.src);
                this.src = 'assets/images/placeholder.jpg';
            }
        });
    });
});
