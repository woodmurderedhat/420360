// PluginManager.js
// Manages plugin lifecycle: install, activate, deactivate, uninstall, query.

const plugins = new Map();

export function installPlugin(plugin, api) {
  if (!plugin.name) throw new Error('Plugin must export a name');
  plugins.set(plugin.name, { plugin, state: 'installed' });
  if (plugin.install) plugin.install(api);
}

export function activatePlugin(plugin, api) {
  if (!plugin.name) throw new Error('Plugin must export a name');
  const entry = plugins.get(plugin.name);
  if (entry && plugin.activate) {
    plugin.activate(api);
    entry.state = 'active';
  }
}

export function deactivatePlugin(plugin, api) {
  if (!plugin.name) throw new Error('Plugin must export a name');
  const entry = plugins.get(plugin.name);
  if (entry && plugin.deactivate) {
    plugin.deactivate(api);
    entry.state = 'inactive';
  }
}

export function uninstallPlugin(plugin) {
  if (!plugin.name) throw new Error('Plugin must export a name');
  plugins.delete(plugin.name);
}

export function getPlugin(name) {
  return plugins.get(name)?.plugin;
}

export function listPlugins() {
  return Array.from(plugins.keys());
}
