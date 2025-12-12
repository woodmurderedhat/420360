# Getting Started with the Daughters of Zion Website

Welcome! This guide will help you get the website up and running.

## Quick Start (Local Viewing)

The easiest way to view the website locally:

1. **Open the file directly:**
   - Navigate to the `book_2` folder
   - Double-click `index.html`
   - The website will open in your default browser

2. **Or use a local server (recommended for full functionality):**
   ```bash
   # Navigate to the book_2 folder
   cd "c:\Users\Stephanus\Documents\daughters of zion\book_2"
   
   # Start a simple server (Python 3)
   python -m http.server 8000
   
   # Then open http://localhost:8000 in your browser
   ```

## What You Have

This is a complete, self-contained static website with:

### ✅ No Dependencies
- Pure HTML, CSS, and JavaScript
- No npm, no build process, no frameworks
- Works immediately without installation

### ✅ No CORS Issues
- All resources are local and relative
- No external API calls
- No external libraries or fonts
- Perfect for GitHub Pages

### ✅ Fully Responsive
- Works on desktop, tablet, and mobile
- Adaptive navigation menu
- Optimized for all screen sizes

### ✅ Complete Documentation
- 8 main pages covering all aspects
- Links to all Library of Zion texts
- Rich content with quotes and imagery

## File Structure

```
book_2/
│
├── index.html              ← Start here (homepage)
├── 404.html               ← Custom error page
│
├── pages/                 ← All content pages
│   ├── about.html
│   ├── history.html
│   ├── seven-veils.html
│   ├── rituals.html
│   ├── hidden-names.html
│   ├── circle-mothers.html
│   └── library.html
│
├── styles/                ← All CSS
│   ├── main.css          ← Main styles and colors
│   ├── navigation.css    ← Menu and navigation
│   └── responsive.css    ← Mobile responsiveness
│
├── scripts/               ← All JavaScript
│   ├── navigation.js     ← Menu functionality
│   └── main.js          ← Animations and utilities
│
├── README.md             ← Project overview
├── DEPLOYMENT.md         ← How to deploy to GitHub Pages
├── GETTING_STARTED.md    ← This file
└── sitemap.xml          ← SEO sitemap
```

## Navigation

The website has 8 main sections:

1. **Home** - Landing page with overview
2. **About** - Project explanation and purpose
3. **History** - Timeline of the Order
4. **Seven Veils** - The sacred path of transformation
5. **Rituals** - Documented practices
6. **Hidden Names** - The doctrine of names
7. **Circle Mothers** - Wisdom keepers
8. **Library** - Complete text archive

## Customization

### Change Colors

Edit `styles/main.css` and modify the CSS variables:

```css
:root {
    --primary-color: #2c1810;      /* Dark brown */
    --secondary-color: #8b6f47;    /* Medium brown */
    --accent-color: #d4af37;       /* Gold */
    --text-color: #2c2c2c;         /* Dark gray */
    --light-bg: #f9f7f4;           /* Cream */
    --white: #ffffff;              /* White */
}
```

### Edit Content

All content is in the HTML files. Simply open any `.html` file in a text editor and modify the text between the tags.

### Add New Pages

1. Copy an existing page from `pages/` folder
2. Rename it
3. Edit the content
4. Add a link to it in the navigation menu of all pages

## Deploy to GitHub Pages

See `DEPLOYMENT.md` for detailed instructions. Quick version:

1. Push this repository to GitHub
2. Go to Settings → Pages
3. Select your branch and `/book_2` folder
4. Save and wait 1-2 minutes
5. Your site is live!

## Features

### Smooth Scrolling
Click any anchor link and the page smoothly scrolls to that section.

### Mobile Menu
On mobile devices, the navigation collapses into a hamburger menu.

### Reading Progress
On content pages, a progress bar shows how far you've scrolled.

### Fade-in Animations
Cards and sections fade in as you scroll down the page.

### Responsive Images
All layouts adapt to different screen sizes.

## Browser Support

Works on:
- ✅ Chrome (desktop and mobile)
- ✅ Firefox (desktop and mobile)
- ✅ Safari (desktop and mobile)
- ✅ Edge
- ✅ Opera

## No Internet Required

Once you have the files, the website works completely offline. Perfect for:
- Local documentation
- Offline reading
- Archival purposes
- Private study

## Next Steps

1. **View locally** - Open `index.html` to explore
2. **Customize** - Change colors, fonts, or content as desired
3. **Deploy** - Follow `DEPLOYMENT.md` to publish on GitHub Pages
4. **Share** - Send the link to others interested in the project

## Troubleshooting

**Problem:** Styles not loading
- **Solution:** Make sure you're viewing from the `book_2` folder, not a parent folder

**Problem:** Navigation not working
- **Solution:** Enable JavaScript in your browser

**Problem:** Links to library documents broken
- **Solution:** Ensure the `library-of-zion` folder is in the correct location relative to `book_2`

## Support

For questions or issues:
1. Check the README.md for project overview
2. Review DEPLOYMENT.md for GitHub Pages help
3. Inspect browser console for JavaScript errors
4. Verify all files are present and in correct folders

---

**Enjoy exploring the Daughters of Zion archive!**

May you find wisdom in these pages.

