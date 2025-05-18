# Generative Art Studio

A powerful, browser-based generative art application that allows you to create, customize, animate, and save unique abstract artwork.

## Features

- **Multiple Art Styles**: Choose from 10 distinct art styles, each with unique visual characteristics
- **Customizable Parameters**: Adjust number of shapes, line width, canvas size, and more
- **Color Themes**: Select from various color themes or create custom color palettes
- **Animation**: Bring your artwork to life with animation and interactive features
- **Layer Harmonization**: Experience beautifully balanced compositions with smart layer blending
- **Visual Effects**: Add depth, glow, and distortion to enhance your creations
- **Responsive Controls**: Enjoy immediate visual feedback when adjusting parameters
- **Composition Guides**: Use built-in composition guides for more balanced artwork
- **Performance Optimization**: Create complex visuals with optimized rendering pipeline
- **Interactive Mode**: Interact with the artwork using mouse or touch
- **Gallery**: Save your favorite creations to a local gallery for later viewing
- **Export**: Download your artwork as PNG files
- **Shareable Links**: Generate links to share your exact artwork configuration
- **History/Undo**: Undo and redo changes with full history support
- **Fullscreen Mode**: View and create artwork in immersive fullscreen
- **Dark Mode**: Automatic dark mode support based on system preferences
- **Responsive Design**: Works on desktop and mobile devices
- **Performance Optimized**: Smooth rendering with canvas buffering and throttling
- **No External Dependencies**: Runs entirely in the browser with no external libraries

## Art Styles

1. **Default**: Basic random shapes and lines
2. **Geometric Grid**: Organized grid of geometric shapes
3. **Organic Noise**: Flowing, organic curves and patterns
4. **Fractal Lines**: Recursive, branching line patterns
5. **Particle Swarm**: Dynamic particle movement with trails
6. **Organic Splatters**: Colorful, overlapping circular splatters
7. **Glitch Mosaic**: Digital glitch-inspired visual effects
8. **Neon Waves**: Glowing, wave-like patterns on dark backgrounds
9. **Pixel Sort**: Sorted color bands with glitch effects
10. **Voronoi Cells**: Cell-like structures with organic boundaries

## Usage

1. Open `index.html` in any modern web browser
2. Use the style selector to choose an art style
3. Adjust parameters in the settings panel
4. Click "Regenerate" (or press R) to create new artwork
5. Enable animation for dynamic, evolving artwork
6. Save your favorites to the gallery
7. Export as PNG when you're happy with the result

## Keyboard Shortcuts

- **R**: Regenerate artwork
- **E**: Export as PNG
- **G**: Open gallery
- **F**: Toggle fullscreen mode
- **Space**: Toggle animation
- **Ctrl+Z**: Undo last change
- **Ctrl+Y** or **Ctrl+Shift+Z**: Redo last undone change
- **1-9**: Quick select art styles

## Technical Details

The application is built with modern JavaScript (ES6+) and uses a modular architecture:

- **main.js**: Entry point and UI handling
- **styles.js**: Art style definitions and implementations
- **styles-advanced.js**: Advanced art style implementations
- **styles-experimental.js**: Experimental art style implementations
- **styles-more.js**: Additional art style implementations
- **palette.js**: Color palette generation
- **animation.js**: Animation and interactive features
- **gallery.js**: Gallery functionality
- **history.js**: Undo/redo history management
- **utils.js**: Utility functions and helpers

The rendering is done using the HTML5 Canvas API with performance optimizations like:

- Double buffering for smoother rendering
- requestAnimationFrame with timing control for consistent animations
- Event throttling for mouse/touch interactions
- Asynchronous loading for gallery images
- Lazy loading for thumbnails
- Device pixel ratio awareness for high-DPI displays
- Alpha channel optimization for better performance

## Browser Compatibility

Works in all modern browsers that support ES6 modules and Canvas:

- Chrome (recommended)
- Firefox
- Safari
- Edge

## License

MIT License - Feel free to use, modify, and distribute this code.

## Credits

Created by woodmurderedhat - Inspired by generative art pioneers and the creative coding community.

---

Enjoy creating beautiful, unique artwork with Generative Art Studio!
