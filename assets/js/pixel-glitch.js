/**
 * Pixel Glitch bootstrap loader.
 *
 * This file intentionally stays lightweight and delegates the full engine
 * to modular ES modules in assets/js/homepage/glitch/.
 */

document.addEventListener('DOMContentLoaded', () => {
  const imageUrl = 'assets/images/420360arcadebanner.png';

  const firebaseConfig = {
    apiKey: 'AIzaSyBhOspsUxX9f_ylCQrNDPfS40yeNykgvj8',
    authDomain: 'project-6657144175400685165.firebaseapp.com',
    databaseURL: 'https://project-6657144175400685165-default-rtdb.firebaseio.com',
    projectId: 'project-6657144175400685165',
    storageBucket: 'project-6657144175400685165.firebasestorage.app',
    messagingSenderId: '604138773261',
    appId: '1:604138773261:web:162f7ab4984c7a27d5ae44'
  };

  import('./homepage/glitch/bridge.js')
    .then(({ setupDeferredBoot }) => {
      setupDeferredBoot({
        canvasId: 'glitch-bg',
        imageUrl,
        preset: 'cinematic',
        pixelBoardSource: { firebaseConfig, timeoutMs: 5000 }
      });
    })
    .catch((error) => {
      console.error('Failed to load glitch framework modules:', error);
    });
});
