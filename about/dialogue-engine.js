// Reused DialogueEngine (simplified copy)
class DialogueEngine {
  constructor(pack, { onRender } = {}) {
    this.originalPack = pack;
    this.pack = JSON.parse(JSON.stringify(pack));
    this.state = { flags: {}, history: [] };
    this.currentNodeId = pack.startsWith;
    this.onRender = onRender || (()=>{});
  }
  reset(){ this.pack = JSON.parse(JSON.stringify(this.originalPack)); this.state={flags:{},history:[]}; this.currentNodeId=this.pack.startsWith; this.render(); }
  loadPack(pack){ this.originalPack=pack; this.reset(); }
  get node(){ return this.pack.nodes[this.currentNodeId]; }
  applySets(node){ if(node.set){ for(const[k,v] of Object.entries(node.set)) this.state.flags[k]=v; } }
  resolveTo(to){ if(typeof to==='string') return to; if(to && typeof to==='object' && 'if' in to){ return this.state.flags[to.if]? to.then: to.else; } return null; }
  choose(index){ const n=this.node; if(!n||n.end) return; const c=n.choices?.[index]; if(!c) return; const target=this.resolveTo(c.to); if(!target) return; this.state.history.push({from:this.currentNodeId,choice:index,to:target}); this.currentNodeId=target; this.render(); }
  render(){ const n=this.node; if(!n) return; this.applySets(n); const payload={ id:this.currentNodeId, speaker:n.speaker||'Archivist', text:n.text||'', end:!!n.end, choices:n.end?[]:(n.choices||[]).map(c=>({ text:c.text, to:this.resolveTo(c.to), ending: !!this.pack.nodes[this.resolveTo(c.to)]?.end }))}; this.onRender(payload,this.state); }
}
window.DialogueEngine=DialogueEngine;
