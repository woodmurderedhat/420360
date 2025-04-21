// module-loader.js
// Dynamically loads modules from the manifest and wires them into the PluginManager.

(async function bootstrap() {
  // 1. Parse manifest from index.html
  const manifestScript = document.getElementById('game-manifest');
  if (!manifestScript) {
    console.error('Manifest not found!');
    return;
  }
  let manifest;
  try {
    manifest = JSON.parse(manifestScript.textContent);
  } catch (e) {
    console.error('Invalid manifest JSON:', e);
    return;
  }

  // 2. Enforce manifest schema validation (AJV required)
  try {
    const { loadManifest } = await import('./lib/DataLoader.js');
    await loadManifest(manifest); // Throws if invalid
    console.log('Manifest schema validated.');
  } catch (e) {
    console.error('Manifest validation failed:', e);
    return;
  }

  // 3. Register service worker (if supported)
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('./service-worker.js');
      console.log('Service worker registered.');
    } catch (e) {
      console.warn('Service worker registration failed:', e);
    }
  }

  let gameState = { ...manifest.initialState };

  // Listen for stateUpdated and loadState events
  window.addEventListener('stateUpdated', e => {
    Object.assign(gameState, e.detail);
  });
  window.addEventListener('loadState', e => {
    Object.assign(gameState, e.detail);
    // Optionally notify plugins/UI of state load
    window.dispatchEvent(new CustomEvent('stateLoaded', { detail: gameState }));
  });

  // 4. Import EventBus and PluginManager
  const [EventBus, PluginManager] = await Promise.all([
    import('EventBus'),
    import('PluginManager')
  ]);

  // 5. Dynamically import, register, and activate plugins from manifest in order
  for (const mod of manifest.modules) {
    try {
      const plugin = await import(mod.path);
      // Enforce plugin lifecycle contract
      if (!plugin.name || typeof plugin.install !== 'function' || typeof plugin.activate !== 'function' || typeof plugin.deactivate !== 'function') {
        throw new Error(`Plugin ${mod.name} missing required lifecycle methods (name/install/activate/deactivate)`);
      }
      // Register and activate via PluginManager
      PluginManager.installPlugin(plugin, { EventBus, manifest, state: gameState });
      PluginManager.activatePlugin(plugin, { EventBus, manifest, state: gameState });
      console.log(`Loaded and activated plugin: ${mod.name}`);
    } catch (e) {
      console.error(`Failed to load plugin ${mod.name}:`, e);
      return;
    }
  }

  // 6. Start main game loop (placeholder)
  // setInterval(() => { /* main game tick */ }, 1000/30);
  console.log('Game bootstrap complete.');
})();
