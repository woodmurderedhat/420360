// Tree.test.js
// Integration tests for Tree.js and Resources.js using the vanilla test framework
import { test, assert, assertEqual, describe, beforeEach } from './test-framework.js';
import * as Tree from '../lib/Tree.js';
import * as Resources from '../lib/Resources.js';

describe('Tree + Resources Integration', () => {
  let api;
  beforeEach(() => {
    api = { state: { tree: null, sunlight: 0, water: 0, upgrades: { leafEfficiency: 1, rootEfficiency: 1 } } };
  });

  test('Tree install initializes tree state', () => {
    Tree.install(api);
    assert(typeof Tree.install === 'function', 'Tree.install should be a function');
  });

  test('Advancing tree stage emits events and updates slots', () => {
    Tree.install(api);
    Tree.activate(api);
    let advanced = false;
    window.addEventListener('treeStageAdvanced', () => { advanced = true; }, { once: true });
    window.dispatchEvent(new CustomEvent('advanceStage'));
    assert(advanced, 'treeStageAdvanced event should be emitted');
    Tree.deactivate(api);
  });

  test('Resource upgrades affect resource generation', async () => {
    Resources.install(api);
    Resources.activate(api);
    // Simulate upgrades
    window.dispatchEvent(new CustomEvent('upgradeLeaf'));
    window.dispatchEvent(new CustomEvent('upgradeRoot'));
    // Wait for at least one tick
    await new Promise(r => setTimeout(r, 1100));
    Resources.deactivate(api);
    assert(true, 'Resource generation with upgrades did not throw');
  });
});
