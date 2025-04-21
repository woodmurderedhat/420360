// PluginManager.test.js
// Unit tests for PluginManager.js using the vanilla test framework
import { test, assert, assertEqual, describe, beforeEach } from './test-framework.js';
import * as PluginManager from '../lib/PluginManager.js';

describe('PluginManager', () => {
  let mockPlugin, mockApi;
  
  beforeEach(() => {
    // Reset the state by clearing all plugins
    const plugins = PluginManager.listPlugins();
    for (const name of plugins) {
      PluginManager.uninstallPlugin({ name });
    }
    
    // Create a mock plugin for testing
    mockPlugin = {
      name: 'MockPlugin',
      install: function(api) { this.installed = true; },
      activate: function(api) { this.activated = true; },
      deactivate: function(api) { this.deactivated = true; },
      installed: false,
      activated: false,
      deactivated: false
    };
    
    // Create a mock API object
    mockApi = { state: { test: 'data' } };
  });
  
  test('installPlugin registers a plugin', () => {
    PluginManager.installPlugin(mockPlugin, mockApi);
    const plugins = PluginManager.listPlugins();
    assert(plugins.includes('MockPlugin'), 'Plugin should be registered');
    assert(mockPlugin.installed, 'Plugin install method should be called');
  });
  
  test('activatePlugin activates a plugin', () => {
    PluginManager.installPlugin(mockPlugin, mockApi);
    PluginManager.activatePlugin(mockPlugin, mockApi);
    assert(mockPlugin.activated, 'Plugin activate method should be called');
  });
  
  test('deactivatePlugin deactivates a plugin', () => {
    PluginManager.installPlugin(mockPlugin, mockApi);
    PluginManager.activatePlugin(mockPlugin, mockApi);
    PluginManager.deactivatePlugin(mockPlugin, mockApi);
    assert(mockPlugin.deactivated, 'Plugin deactivate method should be called');
  });
  
  test('uninstallPlugin removes a plugin', () => {
    PluginManager.installPlugin(mockPlugin, mockApi);
    PluginManager.uninstallPlugin(mockPlugin);
    const plugins = PluginManager.listPlugins();
    assert(!plugins.includes('MockPlugin'), 'Plugin should be removed');
  });
  
  test('getPlugin retrieves a plugin by name', () => {
    PluginManager.installPlugin(mockPlugin, mockApi);
    const retrieved = PluginManager.getPlugin('MockPlugin');
    assert(retrieved === mockPlugin, 'Should retrieve the correct plugin');
  });
  
  test('listPlugins returns all plugin names', () => {
    PluginManager.installPlugin(mockPlugin, mockApi);
    const mockPlugin2 = { ...mockPlugin, name: 'MockPlugin2' };
    PluginManager.installPlugin(mockPlugin2, mockApi);
    
    const plugins = PluginManager.listPlugins();
    assert(plugins.includes('MockPlugin'), 'Should include first plugin');
    assert(plugins.includes('MockPlugin2'), 'Should include second plugin');
    assertEqual(plugins.length, 2, 'Should have exactly two plugins');
  });
  
  test('installPlugin throws error if plugin has no name', () => {
    const invalidPlugin = { install: () => {}, activate: () => {}, deactivate: () => {} };
    let errorThrown = false;
    
    try {
      PluginManager.installPlugin(invalidPlugin, mockApi);
    } catch (e) {
      errorThrown = true;
      assert(e.message.includes('name'), 'Error should mention missing name');
    }
    
    assert(errorThrown, 'Should throw error for plugin without name');
  });
});
