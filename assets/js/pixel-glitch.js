/**
 * Pixel Glitch bootstrap loader.
 *
 * This file intentionally stays lightweight and delegates the full engine
 * to modular ES modules in assets/js/homepage/glitch/.
 */

document.addEventListener('DOMContentLoaded', () => {
  const imageUrl = 'assets/images/420360arcadebanner.png';

  import('./homepage/glitch/bridge.js')
    .then(({ setupDeferredBoot }) => {
      setupDeferredBoot({
        canvasId: 'glitch-bg',
        imageUrl,
        preset: 'cinematic'
      });
    })
    .catch((error) => {
      console.error('Failed to load glitch framework modules:', error);
    });
});
