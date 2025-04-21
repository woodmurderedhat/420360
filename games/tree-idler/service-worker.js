// ServiceWorker.js
// Service worker registration and logic.

const CACHE_NAME = 'tree-idler-cache-v1';
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/module-loader.js',
  '/service-worker.js',
  '/lib/DataLoader.js',
  '/lib/PluginManager.js',
  '/lib/EventBus.js',
  '/lib/Resources.js',
  '/lib/Tree.js',
  '/lib/UI.js',
  '/lib/SaveLoad.js',
  '/lib/ServiceWorker.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response =>
      response || fetch(event.request)
    )
  );
});
