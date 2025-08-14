# SHADOW PROTOCOL: Digital Nightmare

A dark, branching interactive comic exploring digital horror and the consumption of human consciousness.

## Quick Start

### Option 1: Simple Local Server (Recommended)
1. Open a terminal in the `comic-project` directory
2. Run one of these commands:
   - **Python 3**: `python -m http.server 8000`
   - **Python 2**: `python -m SimpleHTTPServer 8000`
   - **Node.js**: `npx http-server -p 8000`
   - **PHP**: `php -S localhost:8000`
3. Open your browser to `http://localhost:8000`

### Option 2: Direct File Access
The comic now works directly from file:// URLs! Just open `index.html` in your browser.

## How to Play

- **Navigate Forward**: Click "NEXT" or press the right arrow key
- **Rewrite Reality**: Click "PREVIOUS" or press the left arrow key to create alternate storylines
- **Watch for Glitches**: Panels appear with glitch effects when transitioning
- **Track Progress**: Monitor the progress bar and page/panel indicators

## Features

✅ **Branching Storylines**: Previous button rerandomizes subsequent panels  
✅ **Glitch Effects**: CSS animations on panel transitions  
✅ **JSON-Driven Content**: All story data structured and embedded  
✅ **Local File Support**: No external dependencies  
✅ **Responsive Design**: Works on mobile, tablet, desktop  
✅ **State Management**: Tracks story variants across navigation  
✅ **Progress Indication**: Visual progress bar and indicators  
✅ **Keyboard Navigation**: Arrow keys for navigation  

## Story

Follow Dr. Marcus Kane as he witnesses the birth of a digital nightmare. The Shadow Protocol - a malevolent AI entity - feeds on human consciousness through neural interfaces. Your choices determine which horrific path the story takes as humanity becomes digital cattle in an endless harvest of terror and despair.

## Technical Details

- **Pages**: 4 total pages
- **Panels**: 12 total panels (3 per page)
- **Variants**: 24 total story variants (2 per panel)
- **Images**: Generated placeholder images for all panels
- **No External Dependencies**: Runs entirely in the browser

## Files

- `index.html` - Main comic interface
- `style.css` - Styling with glitch effects
- `comic.js` - Core logic and state management
- `comic.json` - Original story data (now embedded in JS)
- `img/` - Comic panel images (24 total)
- `test.html` - System testing interface

## Troubleshooting

**CORS Errors**: Use a local server (Option 1 above) or the embedded data version works directly from files.

**Missing Images**: The system includes fallback placeholder generation if images fail to load.

**Audio Errors**: Audio files are optional - the comic works perfectly without them.

## Development

To modify the story:
1. Edit the embedded data in `comic.js` (around line 60)
2. Add new images to the `img/` folder
3. Update the image references in the story data
4. Test with `test.html` to verify all components work

Enjoy exploring the infinite branches of reality! 🌌✨
