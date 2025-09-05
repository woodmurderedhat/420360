// money.js - integer cents helpers
export function toCents(v){ return Math.round((v||0)*100); }
export function fromCents(c){ return (c||0)/100; }
export function fmt(c){ return fromCents(c).toFixed(2); }
export function pct(bps){ return (bps/10000).toFixed(4); }
