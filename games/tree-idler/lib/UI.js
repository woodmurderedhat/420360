// UI.js
// Web Components for panels, drag/drop, accessibility.
import { on, off, emit } from './EventBus.js';
import { makeDraggable, addCollapseButton } from './ui-helpers.js';
import { ResourcePanel } from './ResourcePanel.js';
import { TreePanel } from './TreePanel.js';
import { ToastPanel } from './ToastPanel.js';
import { LeafLotteryPanel } from './LeafLotteryPanel.js';
import { SquirrelModal } from './SquirrelModal.js';
import { ColorBlindToggle } from './ColorBlindToggle.js';
import { MetaPanel } from './MetaPanel.js';
import { AchievementGarden } from './AchievementGarden.js';

export const name = 'UI';

let resourcePanel = null;
let treePanel = null;
let toastPanel = null;
let leafLotteryPanel = null;
let leafLotteryCooldown = 0;
let squirrelModal = null;
let squirrelTimeout = null;
let colorBlindMode = false;
let metaPanel = null;
let achievementGarden = null;

function applyColorBlindMode() {
  document.body.classList.toggle('color-blind', colorBlindMode);
  // Update panels if needed
  if (resourcePanel) resourcePanel.setColorBlind(colorBlindMode);
  if (treePanel) treePanel.setColorBlind(colorBlindMode);
}

function updateAchievementGarden(e) {
  if (achievementGarden) achievementGarden.setAchievements(e.detail);
}

function updateMetaPanel(e) {
  if (metaPanel) metaPanel.setMeta(e.detail);
}

// Keyboard hotkeys for upgrades
function handleHotkeys(e) {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  if (e.key === 'l' || e.key === 'L') {
    window.dispatchEvent(new CustomEvent('upgradeLeaf'));
  } else if (e.key === 'r' || e.key === 'R') {
    window.dispatchEvent(new CustomEvent('upgradeRoot'));
  } else if (e.key === 'f' || e.key === 'F') {
    window.dispatchEvent(new CustomEvent('upgradeFruit'));
  }
}

function updatePanel(e) {
  if (resourcePanel) resourcePanel.setResources(e.detail);
}

function updateTreePanel(e) {
  // e.detail should include sunlight and water for progress bar
  const state = e.detail;
  // Try to get sunlight/water from global state if not present
  let sunlight = state.sunlight;
  let water = state.water;
  let weather = state.weather;
  if (window.__treeIdlerState) {
    sunlight = window.__treeIdlerState.sunlight;
    water = window.__treeIdlerState.water;
    if (window.__treeIdlerState.weather) weather = window.__treeIdlerState.weather;
  }
  if (treePanel) treePanel.setTree({ ...state, sunlight, water, weather });
}

function handleNatureGift(e) {
  if (toastPanel) toastPanel.showToast(`🌱 Nature's Gift: ${e.detail.type} (+${e.detail.amount} ${e.detail.bonus})`);
}
function handleSquirrelAmbush() {
  if (squirrelModal) squirrelModal.remove();
  squirrelModal = document.createElement('squirrel-modal');
  document.body.appendChild(squirrelModal);
  // If not tapped in 3 seconds, fruit is lost
  squirrelTimeout = setTimeout(() => {
    if (squirrelModal) squirrelModal.remove();
    squirrelModal = null;
    window.dispatchEvent(new CustomEvent('squirrelMissed'));
  }, 3000);
}
function handleSquirrelScared() {
  // Show bonus toast
  if (toastPanel) toastPanel.showToast('🎉 You scared off the squirrel! Bonus fruit!');
}
function handleSquirrelMissed() {
  if (toastPanel) toastPanel.showToast('😱 The squirrel got away with your fruit!');
}
function handleQuirkEvent(e) {
  if (toastPanel) toastPanel.showToast(`🍀 ${e.detail.type}: ${e.detail.reward} for ${e.detail.duration}s!`);
}
function handlePrestigeAwarded(e) {
  if (toastPanel) toastPanel.showToast(`🌳 Prestige! Level ${e.detail.prestigeLevel}, Legacy Points: ${e.detail.legacyPoints}`);
}
function handleLeafLotteryCooldown(e) {
  leafLotteryCooldown = Date.now() + e.detail.cooldownMs;
  if (leafLotteryPanel) leafLotteryPanel.updateCooldown();
}

function applyLayout(layout) {
  if (layout.Resource && resourcePanel) {
    if (layout.Resource.left) resourcePanel.style.left = layout.Resource.left;
    if (layout.Resource.top) resourcePanel.style.top = layout.Resource.top;
    resourcePanel.style.position = 'fixed';
    if (layout.Resource.collapsed) {
      const content = resourcePanel.shadowRoot.querySelector('.panel');
      if (content) content.style.display = 'none';
      const btn = resourcePanel.shadowRoot.querySelector('button[aria-label^="Collapse"]');
      if (btn) btn.textContent = '+';
    }
  }
  if (layout.Tree && treePanel) {
    if (layout.Tree.left) treePanel.style.left = layout.Tree.left;
    if (layout.Tree.top) treePanel.style.top = layout.Tree.top;
    treePanel.style.position = 'fixed';
    if (layout.Tree.collapsed) {
      const content = treePanel.shadowRoot.querySelector('.panel');
      if (content) content.style.display = 'none';
      const btn = treePanel.shadowRoot.querySelector('button[aria-label^="Collapse"]');
      if (btn) btn.textContent = '+';
    }
  }
}

export function install() {
  if (!customElements.get('resource-panel')) {
    customElements.define('resource-panel', ResourcePanel);
  }
  if (!customElements.get('tree-panel')) {
    customElements.define('tree-panel', TreePanel);
  }
  if (!customElements.get('toast-panel')) {
    customElements.define('toast-panel', ToastPanel);
  }
  if (!customElements.get('leaf-lottery-panel')) {
    customElements.define('leaf-lottery-panel', LeafLotteryPanel);
  }
  if (!customElements.get('squirrel-modal')) {
    customElements.define('squirrel-modal', SquirrelModal);
  }
  if (!customElements.get('color-blind-toggle')) {
    customElements.define('color-blind-toggle', ColorBlindToggle);
  }
  if (!customElements.get('meta-panel')) {
    customElements.define('meta-panel', MetaPanel);
  }
  if (!customElements.get('achievement-garden')) {
    customElements.define('achievement-garden', AchievementGarden);
  }
}

export function activate() {
  if (!resourcePanel) {
    resourcePanel = document.createElement('resource-panel');
    document.body.appendChild(resourcePanel);
    makeDraggable(resourcePanel, 'Resource');
    addCollapseButton(resourcePanel, 'Resource');
  }
  if (!treePanel) {
    treePanel = document.createElement('tree-panel');
    document.body.appendChild(treePanel);
    makeDraggable(treePanel, 'Tree');
    addCollapseButton(treePanel, 'Tree');
  }
  if (!toastPanel) {
    toastPanel = document.createElement('toast-panel');
    document.body.appendChild(toastPanel);
  }
  if (!leafLotteryPanel) {
    leafLotteryPanel = document.createElement('leaf-lottery-panel');
    document.body.appendChild(leafLotteryPanel);
  }
  if (!metaPanel) {
    metaPanel = document.createElement('meta-panel');
    document.body.appendChild(metaPanel);
  }
  if (!achievementGarden) {
    achievementGarden = document.createElement('achievement-garden');
    document.body.appendChild(achievementGarden);
  }
  if (!document.querySelector('color-blind-toggle')) {
    document.body.appendChild(document.createElement('color-blind-toggle'));
  }
  on('resourcesUpdated', updatePanel);
  on('treeInitialized', updateTreePanel);
  on('treeStageAdvanced', updateTreePanel);
  on('natureGift', handleNatureGift);
  on('squirrelAmbush', handleSquirrelAmbush);
  on('squirrelScared', handleSquirrelScared);
  on('squirrelMissed', handleSquirrelMissed);
  on('quirkEvent', handleQuirkEvent);
  on('prestigeAwarded', handlePrestigeAwarded);
  on('leafLotteryCooldown', handleLeafLotteryCooldown);
  on('metaUpdated', updateMetaPanel);
  on('achievementsUpdated', updateAchievementGarden);
  on('layoutRestored', e => applyLayout(e.detail));
  window.addEventListener('keydown', handleHotkeys);
}

export function deactivate() {
  off('resourcesUpdated', updatePanel);
  off('treeInitialized', updateTreePanel);
  off('treeStageAdvanced', updateTreePanel);
  off('natureGift', handleNatureGift);
  off('squirrelAmbush', handleSquirrelAmbush);
  off('squirrelScared', handleSquirrelScared);
  off('squirrelMissed', handleSquirrelMissed);
  off('quirkEvent', handleQuirkEvent);
  off('prestigeAwarded', handlePrestigeAwarded);
  off('leafLotteryCooldown', handleLeafLotteryCooldown);
  off('metaUpdated', updateMetaPanel);
  off('achievementsUpdated', updateAchievementGarden);
  off('layoutRestored', e => applyLayout(e.detail));
  if (resourcePanel && resourcePanel.parentNode) {
    resourcePanel.parentNode.removeChild(resourcePanel);
    resourcePanel = null;
  }
  if (treePanel && treePanel.parentNode) {
    treePanel.parentNode.removeChild(treePanel);
    treePanel = null;
  }
  if (toastPanel && toastPanel.parentNode) {
    toastPanel.parentNode.removeChild(toastPanel);
    toastPanel = null;
  }
  if (leafLotteryPanel && leafLotteryPanel.parentNode) {
    leafLotteryPanel.parentNode.removeChild(leafLotteryPanel);
    leafLotteryPanel = null;
  }
  if (metaPanel && metaPanel.parentNode) {
    metaPanel.parentNode.removeChild(metaPanel);
    metaPanel = null;
  }
  if (achievementGarden && achievementGarden.parentNode) {
    achievementGarden.parentNode.removeChild(achievementGarden);
    achievementGarden = null;
  }
  if (squirrelModal && squirrelModal.parentNode) {
    squirrelModal.parentNode.removeChild(squirrelModal);
    squirrelModal = null;
  }
  window.removeEventListener('keydown', handleHotkeys);
}

// Add color-blind styles globally
if (!document.getElementById('cb-style')) {
  const style = document.createElement('style');
  style.id = 'cb-style';
  style.textContent = `
    body.color-blind .panel, .cb.panel {
      background: #f5f5f5 !important;
      color: #222 !important;
      border: 2px dashed #0077cc !important;
    }
    body.color-blind .leaf, .cb .leaf {
      color: #0077cc !important;
      filter: drop-shadow(0 0 2px #fff) drop-shadow(0 0 4px #0077cc);
    }
    body.color-blind .root, .cb .root {
      color: #cc7700 !important;
      filter: drop-shadow(0 0 2px #fff) drop-shadow(0 0 4px #cc7700);
    }
    body.color-blind .growth-ring, .cb .growth-ring {
      border-color: #0077cc !important;
    }
    body.color-blind .toast, .cb .toast {
      background: #222 !important;
      color: #fff !important;
      border: 2px solid #0077cc !important;
    }
    body.color-blind .garden-container, .cb .garden-container {
      border: 2px dashed #0077cc !important;
    }
    body.color-blind .soil-layer, .cb .soil-layer {
      background: #555 !important;
    }
    body.color-blind .grass-layer, .cb .grass-layer {
      background: #0077cc !important;
    }
    body.color-blind .sky-layer, .cb .sky-layer {
      background: #f5f5f5 !important;
    }
    body.color-blind .plant svg path, .cb .plant svg path {
      stroke: #000 !important;
    }
    body.color-blind .plant svg ellipse, body.color-blind .plant svg circle, body.color-blind .plant svg polygon,
    .cb .plant svg ellipse, .cb .plant svg circle, .cb .plant svg polygon {
      stroke: #000 !important;
      stroke-width: 1px !important;
    }
    body.color-blind .plant-tooltip, .cb .plant-tooltip {
      background: #000 !important;
      color: #fff !important;
      border: 1px solid #0077cc !important;
    }
    button:focus, [tabindex="0"]:focus {
      outline: 3px solid #00aaff !important;
      outline-offset: 2px;
    }
  `;
  document.head.appendChild(style);
}
