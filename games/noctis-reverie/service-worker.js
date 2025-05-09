const CACHE_NAME = 'noctis-reverie-v1';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './manifest.json',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/vectors/circle.svg',
  './assets/vectors/square.svg',
  './assets/vectors/triangle.svg',
  './assets/vectors/star.svg',
  './assets/vectors/hexagon.svg',
  './modules/main.js',
  './modules/EventBus.js',
  './modules/AssetManager.js',
  './modules/GraphicsContext.js',
  './modules/CanvasRenderer.js',
  './modules/WebGLRenderer.js',
  './modules/AudioManager.js',
  './modules/ControlsPanel.js',
  './modules/CreditsModal.js',
  './data/shapes.json'
  // Additional assets will be added dynamically
];

// Install event - cache all static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(ASSETS);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName !== CACHE_NAME;
        }).map(cacheName => {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        
        // Clone the request
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then(response => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clone the response
          const responseToCache = response.clone();
          
          // Add to cache
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
            
          return response;
        });
      })
  );
});
