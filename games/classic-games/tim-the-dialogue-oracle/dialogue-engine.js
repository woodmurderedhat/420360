// Dialogue Engine - modular branching system with flags & conditional routing.
// No external dependencies. Designed for local static hosting.

class DialogueEngine {
  constructor(pack, { onRender } = {}) {
    this.originalPack = pack; // keep reference
    this.pack = this._clone(pack);
    this.state = { flags: {}, history: [] };
    this.currentNodeId = pack.startsWith;
    this.onRender = onRender || (() => {});
  }

  _clone(obj) { return JSON.parse(JSON.stringify(obj)); }

  reset() {
    // Play reset sound
    if (typeof GameSounds !== 'undefined' && GameSounds.isEnabled()) {
      GameSounds.sounds.GAME_START();
    }
    
    this.pack = this._clone(this.originalPack);
    this.state = { flags: {}, history: [] };
    this.currentNodeId = this.pack.startsWith;
    this.render();
  }

  loadPack(pack) {
    // Play pack loading sound
    if (typeof GameSounds !== 'undefined' && GameSounds.isEnabled()) {
      GameSounds.sounds.POWER_UP();
    }
    
    this.originalPack = pack;
    this.reset();
  }

  get node() { return this.pack.nodes[this.currentNodeId]; }

  applySets(node) {
    if (node.set) {
      for (const [k,v] of Object.entries(node.set)) {
        this.state.flags[k] = v;
      }
    }
  }

  resolveTo(to) {
    if (typeof to === 'string') return to;
    if (to && typeof to === 'object' && 'if' in to) {
      return this.state.flags[to.if] ? to.then : to.else;
    }
    return null;
  }

  choose(index) {
    const node = this.node;
    if (!node || node.end) return;
    const choice = node.choices?.[index];
    if (!choice) return;
    
    // Play choice selection sound
    if (typeof GameSounds !== 'undefined' && GameSounds.isEnabled()) {
      GameSounds.sounds.MENU_SELECT();
    }
    
    const target = this.resolveTo(choice.to);
    if (!target) return;
    this.state.history.push({ from: this.currentNodeId, choice: index, to: target });
    this.currentNodeId = target;
    this.render();
  }

  render() {
    const node = this.node;
    if (!node) {
      console.warn('Node missing', this.currentNodeId);
      return;
    }
    this.applySets(node);
    const payload = {
      id: this.currentNodeId,
      speaker: node.speaker || 'Tim',
      text: node.text || '',
      end: !!node.end,
      choices: node.end ? [] : (node.choices || []).map(c => ({
        text: c.text,
        to: this.resolveTo(c.to),
        ending: !!this.pack.nodes[this.resolveTo(c.to)]?.end
      }))
    };
    this.onRender(payload, this.state);
  }
}

window.DialogueEngine = DialogueEngine;
