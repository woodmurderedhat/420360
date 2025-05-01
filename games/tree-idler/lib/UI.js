// UI.js
// Web Components for panels, drag/drop, accessibility.
import { on, off, emit } from './EventBus.js';
import { makeDraggable, addCollapseButton } from './ui-helpers.js';
// Import component classes directly
import { ResourcePanel } from './ResourcePanel.js';
import { TreePanel } from './TreePanel.js';
import { ToastPanel } from './ToastPanel.js';
import { LeafLotteryPanel } from './LeafLotteryPanel.js';
import { SquirrelModal } from './SquirrelModal.js';
import { ColorBlindToggle } from './ColorBlindToggle.js';
import { MetaPanel } from './MetaPanel.js';
import { AchievementGarden } from './AchievementGarden.js';

export const name = 'UI';

// Store API methods
let getState = () => ({});
let updateState = () => {};
let EventBus = null;

// Keep references to the component instances
let resourcePanel = null;
let treePanel = null;
let toastPanel = null;
let leafLotteryPanel = null;
let squirrelModal = null;
let colorBlindToggle = null; // Reference to the toggle element
let metaPanel = null;
let achievementGarden = null;

// Local state derived from global state or component interactions
let squirrelTimeout = null;

// --- Helper Functions --- 

function applyColorBlindMode() {
  const colorBlindMode = getState().settings?.colorBlindMode || false;
  document.body.classList.toggle('color-blind', colorBlindMode);
  // Notify components that might need internal updates
  EventBus.emit('colorBlindModeChanged', { enabled: colorBlindMode });
}

function updateAllPanels() {
    const state = getState();
    if (resourcePanel) resourcePanel.update(state);
    if (treePanel) treePanel.update(state);
    if (metaPanel) metaPanel.update(state);
    if (achievementGarden) achievementGarden.setAchievements(state.achievements);
    if (leafLotteryPanel) leafLotteryPanel.update(state);
}

// --- Event Handlers --- 

// General state updates (e.g., after load, prestige)
function handleStateLoadedOrInitialized(state) {
    console.log("UI received stateLoaded/Initialized", state);
    if (!state) state = getState(); // Ensure we have state
    updateAllPanels();
    applyColorBlindMode(); // Apply initial colorblind setting
    applyLayout(state.layout || {}); // Apply saved layout
}

// Resource-specific updates
function handleResourcesUpdate(detail) {
    const state = getState();
    if (resourcePanel) resourcePanel.update(state);
    if (treePanel) treePanel.update(state); // Tree panel might need resource costs for next stage
    if (metaPanel) metaPanel.update(state); // Meta panel might need legacy points for upgrades
    if (leafLotteryPanel) leafLotteryPanel.handleResourceUpdate(state);
}

// Tree-specific updates
function handleTreeUpdate(detail) {
    const state = getState();
    if (treePanel) treePanel.update(state);
    if (metaPanel) metaPanel.update(state); // Meta panel shows prestige level, potentially affected by tree state indirectly
}

// Meta/Prestige updates
function handleMetaUpdate(detail) {
    if (metaPanel) metaPanel.update(getState());
}

// Achievement updates
function handleAchievementsUpdate(detail) {
    if (achievementGarden) achievementGarden.setAchievements(detail);
}

// Notifications
function handleUINotification(e) {
    if (toastPanel) toastPanel.showToast(e.detail.message, e.detail.type || 'info');
}

// Color Blind Toggle Interaction
function handleColorBlindToggle(e) {
    const enabled = e.detail.enabled;
    updateState({ settings: { ...getState().settings, colorBlindMode: enabled } });
    applyColorBlindMode();
}

// Keyboard hotkeys for upgrades (emit requests)
function handleHotkeys(e) {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
  switch (e.key.toLowerCase()) {
    case 'l': EventBus.emit('upgradeRequest', { type: 'leafEfficiency' }); break;
    case 'r': EventBus.emit('upgradeRequest', { type: 'rootEfficiency' }); break;
    case 'f': EventBus.emit('upgradeRequest', { type: 'fruitValue' }); break;
  }
}

// --- Quirks / Mini-Events --- 

function handleNatureGift(e) {
  if (toastPanel) toastPanel.showToast(`🌱 Nature's Gift: ${e.detail.type} (+${e.detail.amount} ${e.detail.bonus})`, 'success');
}

function handleSquirrelAmbush() {
  if (squirrelModal && squirrelModal.parentNode) squirrelModal.remove(); // Remove existing if any
  squirrelModal = document.createElement('squirrel-modal');
  document.body.appendChild(squirrelModal);
  
  if (squirrelTimeout) clearTimeout(squirrelTimeout);

  squirrelTimeout = setTimeout(() => {
    if (squirrelModal && squirrelModal.parentNode) squirrelModal.remove();
    squirrelModal = null;
    EventBus.emit('squirrelMissed'); // Notify logic module
    squirrelTimeout = null;
  }, 3000);

  squirrelModal.addEventListener('scared', () => {
      if (squirrelTimeout) clearTimeout(squirrelTimeout);
      squirrelTimeout = null;
      if (squirrelModal && squirrelModal.parentNode) squirrelModal.remove();
      squirrelModal = null;
      EventBus.emit('squirrelScared'); // Notify logic module
  }, { once: true });
}

function handleSquirrelScared() {
  if (toastPanel) toastPanel.showToast('🎉 Scared the squirrel! Bonus fruit!', 'success');
}

function handleSquirrelMissed() {
  if (toastPanel) toastPanel.showToast('😱 Squirrel got away with a fruit!', 'warning');
}

function handleQuirkEvent(e) {
  if (toastPanel) toastPanel.showToast(`🍀 ${e.detail.type}: ${e.detail.reward} for ${e.detail.duration}s!`, 'info');
}

// --- Prestige & Lottery --- 

function handlePrestigeComplete(e) {
  if (toastPanel) toastPanel.showToast(`🌳 Prestige! Level ${e.detail.newPrestigeLevel}. Gained ${e.detail.earnedLegacyPoints} Legacy Point(s).`, 'success');
  handleMetaUpdate();
}

// --- Layout Persistence --- 

function applyLayout(layout) {
    const panels = {
        Resource: resourcePanel,
        Tree: treePanel,
        Meta: metaPanel,
        Achievements: achievementGarden,
        Lottery: leafLotteryPanel
    };
    for (const name in layout) {
        const panelElement = panels[name];
        const panelLayout = layout[name];
        if (panelElement && panelLayout) {
            if (panelLayout.left) panelElement.style.left = panelLayout.left;
            if (panelLayout.top) panelElement.style.top = panelLayout.top;
            panelElement.style.position = 'fixed';
            
            const content = panelElement.shadowRoot?.querySelector('.panel-content');
            const button = panelElement.shadowRoot?.querySelector('.collapse-button');
            if (panelLayout.collapsed) {
                if (content) content.style.display = 'none';
                if (button) button.textContent = '+';
                panelElement.setAttribute('collapsed', '');
            } else {
                if (content) content.style.display = '';
                if (button) button.textContent = '-';
                panelElement.removeAttribute('collapsed');
            }
        }
    }
}

// --- Plugin Lifecycle --- 

export function install(api) {
  getState = api.getState;
  updateState = api.updateState;
  EventBus = api.EventBus;

  const components = {
      'resource-panel': ResourcePanel,
      'tree-panel': TreePanel,
      'toast-panel': ToastPanel,
      'leaf-lottery-panel': LeafLotteryPanel,
      'squirrel-modal': SquirrelModal,
      'color-blind-toggle': ColorBlindToggle,
      'meta-panel': MetaPanel,
      'achievement-garden': AchievementGarden
  };
  for (const tagName in components) {
      if (!customElements.get(tagName)) {
          customElements.define(tagName, components[tagName]);
      }
  }
}

export function activate(api) {
  getState = api.getState;
  updateState = api.updateState;
  EventBus = api.EventBus;

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
    makeDraggable(leafLotteryPanel, 'Lottery');
    addCollapseButton(leafLotteryPanel, 'Lottery');
  }
  if (!metaPanel) {
    metaPanel = document.createElement('meta-panel');
    document.body.appendChild(metaPanel);
    makeDraggable(metaPanel, 'Meta');
    addCollapseButton(metaPanel, 'Meta');
  }
  if (!achievementGarden) {
    achievementGarden = document.createElement('achievement-garden');
    document.body.appendChild(achievementGarden);
    makeDraggable(achievementGarden, 'Achievements');
    addCollapseButton(achievementGarden, 'Achievements');
  }
  if (!colorBlindToggle) {
    colorBlindToggle = document.createElement('color-blind-toggle');
    document.body.appendChild(colorBlindToggle);
    colorBlindToggle.addEventListener('toggle', handleColorBlindToggle);
  }

  EventBus.on('stateLoaded', handleStateLoadedOrInitialized);
  EventBus.on('resourcesInitialized', handleStateLoadedOrInitialized);
  EventBus.on('treeInitialized', handleStateLoadedOrInitialized);
  EventBus.on('resourcesUpdated', handleResourcesUpdate);
  EventBus.on('treeStageAdvanced', handleTreeUpdate);
  EventBus.on('treeSeasonChanged', handleTreeUpdate);
  EventBus.on('prestigeComplete', handlePrestigeComplete);
  EventBus.on('legacyUpgradePurchased', handleMetaUpdate);
  EventBus.on('achievementsUpdated', handleAchievementsUpdate);
  EventBus.on('uiNotification', handleUINotification);
  EventBus.on('natureGift', handleNatureGift);
  EventBus.on('squirrelAmbush', handleSquirrelAmbush);
  EventBus.on('squirrelScared', handleSquirrelScared);
  EventBus.on('squirrelMissed', handleSquirrelMissed);
  EventBus.on('quirkEvent', handleQuirkEvent);
  EventBus.on('layoutRestored', applyLayout);

  window.addEventListener('keydown', handleHotkeys);

  handleStateLoadedOrInitialized();
}

export function deactivate(api) {
  EventBus.off('stateLoaded', handleStateLoadedOrInitialized);
  EventBus.off('resourcesInitialized', handleStateLoadedOrInitialized);
  EventBus.off('treeInitialized', handleStateLoadedOrInitialized);
  EventBus.off('resourcesUpdated', handleResourcesUpdate);
  EventBus.off('treeStageAdvanced', handleTreeUpdate);
  EventBus.off('treeSeasonChanged', handleTreeUpdate);
  EventBus.off('prestigeComplete', handlePrestigeComplete);
  EventBus.off('legacyUpgradePurchased', handleMetaUpdate);
  EventBus.off('achievementsUpdated', handleAchievementsUpdate);
  EventBus.off('uiNotification', handleUINotification);
  EventBus.off('natureGift', handleNatureGift);
  EventBus.off('squirrelAmbush', handleSquirrelAmbush);
  EventBus.off('squirrelScared', handleSquirrelScared);
  EventBus.off('squirrelMissed', handleSquirrelMissed);
  EventBus.off('quirkEvent', handleQuirkEvent);
  EventBus.off('layoutRestored', applyLayout);

  window.removeEventListener('keydown', handleHotkeys);
  if (colorBlindToggle) {
      colorBlindToggle.removeEventListener('toggle', handleColorBlindToggle);
  }

  [resourcePanel, treePanel, toastPanel, leafLotteryPanel, metaPanel, achievementGarden, colorBlindToggle, squirrelModal].forEach(el => {
      if (el && el.parentNode) {
          el.parentNode.removeChild(el);
      }
  });

  resourcePanel = treePanel = toastPanel = leafLotteryPanel = metaPanel = achievementGarden = colorBlindToggle = squirrelModal = null;
  getState = () => ({});
  updateState = () => {};
  EventBus = null;
  if (squirrelTimeout) clearTimeout(squirrelTimeout);
  squirrelTimeout = null;
}

if (!document.getElementById('cb-style')) {
  const style = document.createElement('style');
  style.id = 'cb-style';
  style.textContent = `
    body.color-blind [data-resource="sunlight"] {
        border: 1px solid yellow;
    }
    body.color-blind [data-resource="water"] {
        border: 1px solid blue;
    }
    body.color-blind .panel {
      background-color: #fff;
      color: #000;
      border: 2px solid #000;
    }
    body.color-blind button {
        border: 2px solid transparent;
    }
    body.color-blind button:focus, body.color-blind button:hover {
        border-color: blue; 
    }
    button:focus, [tabindex="0"]:focus {
      outline: 3px solid #00aaff !important;
      outline-offset: 2px;
    }
  `;
  document.head.appendChild(style);
}
