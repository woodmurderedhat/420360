# The Daughters of Zion - Book 2: Modern Web Documentation

A modern, static website documenting the Veiled Daughters of Zion—a symbolic reconstruction of a secret female order rooted in scriptural echoes and apocryphal memory.

## Overview

This website serves as a comprehensive digital archive of the Daughters of Zion, presenting their history, teachings, rituals, and sacred texts in an accessible, modern format.

## Features

- **Fully Static**: Pure HTML, CSS, and JavaScript—no build process required
- **GitHub Pages Ready**: Designed to run seamlessly on GitHub Pages without CORS issues
- **Responsive Design**: Mobile-friendly layout that works on all devices
- **No External Dependencies**: All resources are self-contained
- **Accessible Navigation**: Clear structure with intuitive menu system
- **Rich Content**: Comprehensive documentation across multiple pages

## Structure

```
book_2/
├── index.html              # Homepage
├── pages/                  # Content pages
│   ├── about.html         # About the project
│   ├── history.html       # Historical timeline
│   ├── seven-veils.html   # The Seven Veils teaching
│   ├── rituals.html       # Sacred rituals
│   ├── hidden-names.html  # The Hidden Names doctrine
│   ├── circle-mothers.html # Circle Mothers wisdom
│   └── library.html       # Complete text archive
├── library/               # Converted library texts (HTML)
│   ├── veiled-daughters-of-zion.html
│   ├── book-1-the-veiled-testament.html
│   ├── book-of-hidden-names.html
│   ├── book-of-circle-mothers.html
│   ├── seven-veils.html
│   ├── ritual-handbook.html
│   ├── hidden-sisters.html
│   └── ... (15 total documents)
├── styles/                # CSS stylesheets
│   ├── main.css          # Main styles
│   ├── navigation.css    # Navigation styles
│   └── responsive.css    # Responsive design
├── scripts/              # JavaScript files
│   ├── navigation.js     # Navigation functionality
│   └── main.js          # Main JavaScript
├── convert_markdown.py   # Script to convert MD to HTML
└── README.md            # This file
```

## Pages

### Home (index.html)
The landing page with an overview and navigation to all sections.

### About (pages/about.html)
Explains the project, its purpose, and how to navigate the site.

### History (pages/history.html)
A timeline tracing the Order from biblical origins through medieval chronicles to modern reconstruction.

### Seven Veils (pages/seven-veils.html)
Detailed exploration of the sacred path of transformation through the seven veils: Dust, Ash, Water, Oil, Wine, Milk, and Light.

### Rituals (pages/rituals.html)
Documentation of reconstructed practices including purification, lamentation, birth rites, sacred dance, and more.

### Hidden Names (pages/hidden-names.html)
The doctrine of the three names every woman bears and the mystery of the Hidden Name.

### Circle Mothers (pages/circle-mothers.html)
Information about the ancestral wisdom keepers who guide the spiritual direction of the Order.

### Library (pages/library.html)
Complete archive with links to all sacred texts and documents.

## Deployment to GitHub Pages

### Option 1: Deploy from Repository Root

1. Push this `book_2` folder to your GitHub repository
2. Go to repository Settings → Pages
3. Select the branch (usually `main` or `master`)
4. Set the folder to `/book_2`
5. Save and wait for deployment

Your site will be available at: `https://[username].github.io/[repository-name]/`

### Option 2: Deploy from Dedicated Repository

1. Create a new repository named `daughters-of-zion` (or any name)
2. Copy the contents of `book_2` to the repository root
3. Go to Settings → Pages
4. Select the branch and set folder to `/ (root)`
5. Save and wait for deployment

Your site will be available at: `https://[username].github.io/daughters-of-zion/`

### Option 3: Custom Domain

1. Follow Option 1 or 2 above
2. In Settings → Pages, add your custom domain
3. Configure DNS settings with your domain provider
4. Enable HTTPS (recommended)

## Local Development

To view the site locally:

1. Simply open `index.html` in a web browser
2. Or use a local server:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   
   # Node.js (with http-server installed)
   npx http-server
   ```
3. Navigate to `http://localhost:8000`

## Technical Details

### No CORS Issues
- All resources are relative paths
- No external API calls
- No external font or library dependencies
- All content is self-contained

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Graceful degradation for older browsers

### Performance
- Minimal JavaScript for fast loading
- Optimized CSS with no bloat
- No external dependencies to slow down loading
- Progressive enhancement approach

## Customization

### Colors
Edit CSS variables in `styles/main.css`:
```css
:root {
    --primary-color: #2c1810;
    --secondary-color: #8b6f47;
    --accent-color: #d4af37;
    /* ... */
}
```

### Content
All content is in HTML files and can be edited directly. The structure is semantic and well-commented.

### Navigation
Modify the navigation in each HTML file's `<nav>` section. The navigation is consistent across all pages.

## License

This is a creative and spiritual project. The content represents a symbolic reconstruction based on scriptural echoes and historical research.

## Credits

Based on the Library of Zion texts and the Veiled Testament chronicle.

---

**Note**: This website is designed to be a living archive—a space where the wisdom of the Veiled Daughters can be explored, studied, and contemplated.

