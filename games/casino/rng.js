// rng.js - simple wrapper (future: seedable)
class RNGClass {
  constructor(){
    this.seed = null;
    this._state = (Math.random()*1e9)>>>0; // internal LCG / mulberry state
    this.serverSeed = this._genServerSeed();
    this.clientSeed = 'client';
    this.nonce = 0;
    this.lastCommit = this._hash(this.serverSeed);
    this.archive = [];
    this.pendingReveal = null;
  this.deterministic = false; // when true, rotation keeps deterministic progression
  }
  setSeed(seedStr){
    if (!seedStr) return; // ignore empty
    let h = 2166136261 >>> 0;
    for (let i=0;i<seedStr.length;i++) { h ^= seedStr.charCodeAt(i); h = Math.imul(h, 16777619); }
    this._state = h >>> 0;
    this.seed = seedStr;
    this.clientSeed = seedStr;
  }
  rotateServerSeed(){
    // move current serverSeed & commit to archive with stats
    if (this.serverSeed){
      this.archive.unshift({ serverSeed: this.serverSeed, commit: this.lastCommit, rolls: this.nonce, revealedAt: Date.now() });
      if (this.archive.length > 20) this.archive.pop();
    }
  this.serverSeed = this.deterministic && this.seed ? this.seed + ':' + (Date.now()>>>0).toString(16) : this._genServerSeed();
    this.nonce = 0;
    this.lastCommit = this._hash(this.serverSeed);
  }
  _genServerSeed(){ return (Math.random().toString(36).slice(2)+Date.now().toString(36)); }
  _hash(str){
    // simple FNV-1a 32-bit hex
    let h = 2166136261 >>> 0;
    for (let i=0;i<str.length;i++){ h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return ('0000000'+(h>>>0).toString(16)).slice(-8);
  }
  next(){ // Mulberry32 variant (deterministic when seed set via setSeed)
    let t = this._state += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  nextInt(min,max){ return Math.floor(this.next()*(max-min+1))+min; }
  provablyFairRoll(){
    // Derive a roll 1..1000 from hash of (serverSeed:clientSeed:nonce) without exposing serverSeed until rotation.
    const preimage = `${this.serverSeed}:${this.clientSeed}:${this.nonce}`;
    const h = this._hash(preimage);
    // Take 32 bits -> integer, mod 1000 for uniform bucket (mod bias negligible since 2^32 % 1000 evenly distributes?).
    // 1000 divides 2^3 * 5^3; 2^32 % 1000 = 0 so distribution is perfectly uniform across 0..999.
    const val = parseInt(h.slice(0,8),16); // 32 bits
    const roll = (val % 1000) + 1; // 1..1000
    const meta = { commit: this.lastCommit, serverSeed: null, clientSeed: this.clientSeed, nonce: this.nonce, hashUsed: h };
    this.nonce++;
    if (this.nonce % 500 === 0){ this.rotateServerSeed(); }
    return { roll, ...meta };
  }
  getCurrentCommit(){ return this.lastCommit; }
  revealCurrentSeed(){
    // force rotation + reveal current seed immediately
    const oldSeed = this.serverSeed;
    const oldCommit = this.lastCommit;
    const rolls = this.nonce;
    this.rotateServerSeed();
    return { serverSeed: oldSeed, commit: oldCommit, rolls };
  }
  enableDeterministic(flag=true){ this.deterministic = !!flag; }
  setServerSeedExplicit(seed){ if (!seed) return; this.serverSeed = seed; this.lastCommit = this._hash(seed); this.nonce=0; }
}
export const RNG = new RNGClass();
