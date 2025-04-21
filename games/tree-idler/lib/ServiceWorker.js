// ServiceWorker.js
// Service worker registration and lifecycle management.

import { emit } from './EventBus.js';

export const name = 'ServiceWorker';

let registration = null;
let updateCheckInterval = null;

/**
 * Register the service worker and set up update checking.
 */
async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker API not supported in this browser');
    return null;
  }

  try {
    registration = await navigator.serviceWorker.register('../service-worker.js');
    console.log('Service worker registered successfully:', registration.scope);
    emit('serviceWorkerRegistered', { scope: registration.scope });
    return registration;
  } catch (error) {
    console.error('Service worker registration failed:', error);
    emit('serviceWorkerError', { error: error.message });
    return null;
  }
}

/**
 * Check for service worker updates.
 */
async function checkForUpdates() {
  if (!registration) return;

  try {
    await registration.update();
    console.log('Service worker update check completed');
  } catch (error) {
    console.warn('Service worker update check failed:', error);
  }
}

/**
 * Handle service worker state changes.
 */
function handleStateChange(event) {
  if (!event || !event.target) return;

  const serviceWorker = event.target;
  console.log(`Service worker state changed to: ${serviceWorker.state}`);

  if (serviceWorker.state === 'installed') {
    if (navigator.serviceWorker.controller) {
      // New content is available, notify user
      emit('serviceWorkerUpdated', { ready: true });
      console.log('New service worker installed, refresh to use updated assets');
    } else {
      // First-time install
      console.log('Service worker installed for the first time');
      emit('serviceWorkerInstalled', { firstTime: true });
    }
  } else if (serviceWorker.state === 'redundant') {
    console.warn('Service worker became redundant');
    emit('serviceWorkerRedundant', null);
  }
}

/**
 * Install the service worker module.
 */
export function install() {
  // Nothing to initialize in game state
}

/**
 * Activate the service worker module.
 */
export function activate() {
  // Register service worker
  registerServiceWorker().then(reg => {
    if (reg) {
      // Set up event listeners for the service worker
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        newWorker.addEventListener('statechange', handleStateChange);
      });

      // Check for updates periodically (every 30 minutes)
      updateCheckInterval = setInterval(checkForUpdates, 30 * 60 * 1000);
    }
  });

  // Listen for network status changes
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
}

/**
 * Deactivate the service worker module.
 */
export function deactivate() {
  if (updateCheckInterval) {
    clearInterval(updateCheckInterval);
    updateCheckInterval = null;
  }

  window.removeEventListener('online', handleOnline);
  window.removeEventListener('offline', handleOffline);
}

/**
 * Handle online event.
 */
function handleOnline() {
  emit('networkStatusChanged', { online: true });
  console.log('Network connection restored');
  // Trigger an update check when we come back online
  checkForUpdates();
}

/**
 * Handle offline event.
 */
function handleOffline() {
  emit('networkStatusChanged', { online: false });
  console.log('Network connection lost, using cached assets');
}
