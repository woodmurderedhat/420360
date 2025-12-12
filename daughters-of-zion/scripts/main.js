// Main JavaScript functionality

document.addEventListener('DOMContentLoaded', function() {
    // Fade in animations on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe all feature cards and content sections
    const animatedElements = document.querySelectorAll('.feature-card, .veil-card, .card, .timeline-item');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Add reading progress indicator for content pages
    if (document.querySelector('.content-section')) {
        createReadingProgress();
    }

    // Initialize search functionality if search box exists
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        initializeSearch();
    }
});

// Reading progress indicator
function createReadingProgress() {
    const progressBar = document.createElement('div');
    progressBar.id = 'reading-progress';
    progressBar.style.cssText = `
        position: fixed;
        top: 70px;
        left: 0;
        width: 0%;
        height: 3px;
        background: linear-gradient(90deg, #d4af37, #8b6f47);
        z-index: 999;
        transition: width 0.1s ease;
    `;
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', function() {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight - windowHeight;
        const scrolled = window.scrollY;
        const progress = (scrolled / documentHeight) * 100;
        progressBar.style.width = progress + '%';
    });
}

// Search functionality
function initializeSearch() {
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');

    searchInput.addEventListener('input', function(e) {
        const query = e.target.value.toLowerCase().trim();
        
        if (query.length < 2) {
            searchResults.innerHTML = '';
            searchResults.style.display = 'none';
            return;
        }

        // Search through content (this is a simple implementation)
        const searchableContent = document.querySelectorAll('.content-wrapper p, .content-wrapper h2, .content-wrapper h3, .feature-card');
        const results = [];

        searchableContent.forEach(element => {
            const text = element.textContent.toLowerCase();
            if (text.includes(query)) {
                results.push({
                    text: element.textContent.substring(0, 150) + '...',
                    element: element
                });
            }
        });

        displaySearchResults(results, query);
    });
}

function displaySearchResults(results, query) {
    const searchResults = document.getElementById('search-results');
    
    if (results.length === 0) {
        searchResults.innerHTML = '<p>No results found.</p>';
        searchResults.style.display = 'block';
        return;
    }

    const resultsHTML = results.slice(0, 5).map(result => {
        const highlighted = result.text.replace(
            new RegExp(query, 'gi'),
            match => `<mark>${match}</mark>`
        );
        return `<div class="search-result-item">${highlighted}</div>`;
    }).join('');

    searchResults.innerHTML = resultsHTML;
    searchResults.style.display = 'block';
}

// Utility function to load content dynamically (for library page)
async function loadMarkdownContent(filePath, targetElement) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error('Content not found');
        
        const text = await response.text();
        const htmlContent = convertMarkdownToHTML(text);
        
        if (targetElement) {
            targetElement.innerHTML = htmlContent;
        }
        return htmlContent;
    } catch (error) {
        console.error('Error loading content:', error);
        if (targetElement) {
            targetElement.innerHTML = '<p>Content could not be loaded.</p>';
        }
        return null;
    }
}

// Simple markdown to HTML converter
function convertMarkdownToHTML(markdown) {
    let html = markdown;
    
    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Paragraphs
    html = html.replace(/\n\n/g, '</p><p>');
    html = '<p>' + html + '</p>';
    
    return html;
}

// Export functions for use in other scripts
window.loadMarkdownContent = loadMarkdownContent;

