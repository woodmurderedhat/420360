// UI.test.js
// Basic tests for UI.js Web Components using the vanilla test framework
import { test, assert, describe, assertAria, assertTabIndex } from './test-framework.js';
import * as UI from '../lib/UI.js';

describe('UI Web Components', () => {
  test('resource-panel custom element can be created', () => {
    UI.install();
    const el = document.createElement('resource-panel');
    document.body.appendChild(el);
    assert(el.shadowRoot, 'resource-panel should have shadowRoot');
    document.body.removeChild(el);
  });

  test('tree-panel custom element can be created', () => {
    UI.install();
    const el = document.createElement('tree-panel');
    document.body.appendChild(el);
    assert(el.shadowRoot, 'tree-panel should have shadowRoot');
    document.body.removeChild(el);
  });

  test('color-blind-toggle toggles color-blind mode', () => {
    UI.install();
    const el = document.createElement('color-blind-toggle');
    document.body.appendChild(el);
    const btn = el.shadowRoot.getElementById('toggle');
    btn.click();
    assert(document.body.classList.contains('color-blind'), 'Color-blind mode should be enabled');
    btn.click();
    assert(!document.body.classList.contains('color-blind'), 'Color-blind mode should be disabled');
    document.body.removeChild(el);
  });

  test('resource-panel has ARIA label and tab index on header', () => {
    UI.install();
    const el = document.createElement('resource-panel');
    document.body.appendChild(el);
    const header = el.shadowRoot.querySelector('div[aria-label^="Drag"]');
    assertAria(header, 'aria-label', 'Drag Resource panel', 'Header should have correct ARIA label');
    assertTabIndex(header, 0, 'Header should have tabindex="0"');
    document.body.removeChild(el);
  });

  test('color-blind-toggle button has ARIA label and tab index', () => {
    UI.install();
    const el = document.createElement('color-blind-toggle');
    document.body.appendChild(el);
    const btn = el.shadowRoot.getElementById('toggle');
    assertAria(btn, 'aria-label', 'Toggle color-blind mode', 'Button should have correct ARIA label');
    assertTabIndex(btn, 0, 'Button should have tabindex="0"');
    document.body.removeChild(el);
  });
});
