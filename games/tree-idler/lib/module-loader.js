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
    const { loadManifest } = await import('./DataLoader.js');
    await loadManifest(manifest); // Throws if invalid
    console.log('Manifest schema validated.');
  } catch (e) {
    console.error('Manifest loading/validation failed:', e);
    return;
  }

  // REMOVED Service worker registration - Assuming handled by ServiceWorker.js module

  // --- State Management Setup ---
  // Initialize state from manifest defaults first
  let gameState = JSON.parse(JSON.stringify(manifest.initialState)); // Deep copy

  // Create a proxy or getter for plugins to access live state
  const stateProxy = { 
    get: () => gameState, 
    update: (newState) => { 
      gameState = { ...gameState, ...newState };
      // Optionally debounce state updates if needed
      window.dispatchEvent(new CustomEvent('stateUpdated', { detail: gameState }));
    }
  };

  // Listen for direct state updates (e.g., from SaveLoad)
  window.addEventListener('loadState', e => {
    console.log('Received loadState event:', e.detail);
    // Merge loaded state carefully, potentially prioritizing loaded values
    gameState = { ...manifest.initialState, ...e.detail }; // Overwrite defaults with loaded state
    console.log('State after loadState:', gameState);

    // --- Apply Seed Vault Bonus --- 
    // REMOVED: This logic is handled in SaveLoad.js to avoid double application.
    /*
    if (gameState.legacyUpgrades?.seedVault) {
        const seedVaultBonus = 50; // Define the bonus amount
        gameState.sunlight = (gameState.sunlight || 0) + seedVaultBonus;
        gameState.water = (gameState.water || 0) + seedVaultBonus;
        console.log(`Applied Seed Vault bonus: +${seedVaultBonus} sunlight & water.`);
    }
    */
    // --- End Seed Vault Bonus ---

    // Notify all modules that state has been loaded/rehydrated
    window.dispatchEvent(new CustomEvent('stateLoaded', { detail: gameState }));
  });

  // --- Handle case where there's no saved state --- 
  // If SaveLoad didn't load state, we might need to apply Seed Vault here too,
  // but the current structure activates SaveLoad first, which handles loading.
  // If SaveLoad *fails* to load, gameState remains initialState.
  // We need a way to apply Seed Vault *after* initialState is set but *before* gameReady
  // if no 'loadState' event occurs. Let's refine this.

  // Refined approach: Apply Seed Vault *after* SaveLoad activation attempt, 
  // regardless of whether 'loadState' was emitted.

  // 3. Import EventBus and PluginManager
  const [EventBus, PluginManager] = await Promise.all([
    import('EventBus'),
    import('PluginManager')
  ]);

  // --- Plugin Loading & Activation ---
  // Define the API object passed to plugins
  const pluginApi = { 
    EventBus, 
    manifest, 
    getState: stateProxy.get, // Provide getter
    updateState: stateProxy.update // Provide updater
  };

  // Load SaveLoad plugin *first* if it exists, to load saved data before other plugins initialize
  const saveLoadModuleInfo = manifest.modules.find(m => m.name === 'SaveLoad');
  if (saveLoadModuleInfo) {
    try {
      // Resolve path relative to the HTML document's base URI
      const absolutePath = new URL(saveLoadModuleInfo.path, document.baseURI).href;
      const saveLoadPlugin = await import(absolutePath);
      if (saveLoadPlugin.install) PluginManager.installPlugin(saveLoadPlugin, pluginApi);
      // Activate SaveLoad early to trigger potential 'loadState' event
      if (saveLoadPlugin.activate) PluginManager.activatePlugin(saveLoadPlugin, pluginApi);
      console.log(`Loaded and activated SaveLoad plugin early.`);
    } catch (e) {
      console.error(`Failed to load SaveLoad plugin:`, e);
      // Decide if loading should halt or continue without saved state
      // return; 
    }
  }

  // --- Apply Seed Vault Bonus (Post-SaveLoad Attempt) ---
  // Check *after* SaveLoad has had a chance to load state
  // This ensures the bonus applies to both fresh starts and loaded games
  // if the upgrade was purchased.
  // REMOVED: Logic moved entirely to SaveLoad.js during prestige reset.
  /*
  if (gameState.legacyUpgrades?.seedVault) {
      const seedVaultBonus = 50; // Define the bonus amount
      // Check if bonus was already applied by loadState (e.g., if state was saved *after* applying bonus)
      // This simple check assumes the bonus is exactly 50. A more robust check might involve flags.
      let applyBonus = true;
      // A simple flag in the state could prevent double application if needed:
      // if (gameState.seedVaultBonusApplied) applyBonus = false;

      if (applyBonus) {
          gameState.sunlight = (gameState.sunlight || 0) + seedVaultBonus;
          gameState.water = (gameState.water || 0) + seedVaultBonus;
          // Optionally mark that the bonus has been applied for this session/load
          // gameState.seedVaultBonusApplied = true; 
          console.log(`Applied Seed Vault bonus (post-SaveLoad): +${seedVaultBonus} sunlight & water.`);
      }
  }
  */
  // --- End Seed Vault Bonus ---

  // Load, install, and activate remaining plugins from manifest in order
  for (const mod of manifest.modules) {
    // Skip SaveLoad as it was handled already
    if (mod.name === 'SaveLoad') continue; 
    // Skip core modules potentially loaded via import map if marked
    if (mod.core) continue; 

    try {
      // Resolve path relative to the HTML document's base URI
      const absolutePath = new URL(mod.path, document.baseURI).href;
      const plugin = await import(absolutePath);
      // Basic validation (can be expanded)
      if (!plugin.name) {
         console.warn(`Plugin from ${mod.path} is missing a 'name' export. Skipping.`);
         continue;
      }
      // Register and activate via PluginManager
      // Ensure install/activate functions exist before calling
      if (plugin.install) PluginManager.installPlugin(plugin, pluginApi);
      else console.warn(`Plugin ${plugin.name} missing install function`);
      
      if (plugin.activate) PluginManager.activatePlugin(plugin, pluginApi);
      else console.warn(`Plugin ${plugin.name} missing activate function`);

      console.log(`Loaded and activated plugin: ${plugin.name}`);
    } catch (e) {
      console.error(`Failed to load plugin ${mod.name} from ${mod.path}:`, e);
      // Optional: Decide whether to halt on error or continue
      // return; 
    }
  }

  // --- Game Start ---
  console.log('Game bootstrap complete. Final initial state:', gameState);
  // Emit an event signifying the game is ready
  EventBus.emit('gameReady', gameState);
  // Main game loop or initial actions can be triggered by 'gameReady' listeners
})();
