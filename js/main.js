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

    // === VISUAL ORGASM ANIMATIONS ===

    // 1. Coin sparkle and spin on hover/click
    const coins = document.querySelectorAll('.coin');
    coins.forEach(coin => {
        coin.addEventListener('mouseenter', () => coin.classList.add('sparkle'));
        coin.addEventListener('mouseleave', () => coin.classList.remove('sparkle'));
        coin.addEventListener('mousedown', () => coin.classList.add('sparkle'));
        coin.addEventListener('mouseup', () => coin.classList.remove('sparkle'));
    });

    // 2. Play button burst effect
    const playBtns = document.querySelectorAll('.animated-btn');
    playBtns.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            btn.classList.add('burst');
            setTimeout(() => btn.classList.remove('burst'), 500);
        });
        btn.addEventListener('mousedown', () => {
            btn.classList.add('burst');
            setTimeout(() => btn.classList.remove('burst'), 500);
        });
    });

    // 3. Site title rainbow shimmer on hover
    const siteTitle = document.querySelector('.site-title');
    if (siteTitle) {
        siteTitle.addEventListener('mouseenter', () => siteTitle.classList.add('rainbow'));
        siteTitle.addEventListener('mouseleave', () => siteTitle.classList.remove('rainbow'));
    }

    // 4. Pixel particle overlay
    function createPixelParticles() {
        let overlay = document.querySelector('.pixel-particles');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'pixel-particles';
            document.body.appendChild(overlay);
        }
        overlay.innerHTML = '';
        const count = window.innerWidth > 900 ? 36 : 16;
        for (let i = 0; i < count; i++) {
            const p = document.createElement('div');
            p.className = 'pixel-particle';
            // Make particles much bigger (random size between 32px and 64px)
            const size = 128 + Math.random() * 128;
            p.style.width = size + 'px';
            p.style.height = size + 'px';
            p.style.left = Math.random() * 100 + 'vw';
            p.style.top = (100 + Math.random() * 20) + 'vh';
            p.style.animationDelay = (Math.random() * 12) + 's';
            // Use a solid dark pastel color
            const hue = Math.floor(Math.random() * 360);
            p.style.background = `hsl(${hue}, 70%, 20%)`;
            overlay.appendChild(p);
        }
    }
    window.addEventListener('resize', createPixelParticles);
    createPixelParticles();
});
