/**
 * Collective decisions — users vote between two options.
 * The winning option at any moment changes the hero blurb sentence pool.
 *
 * Schema (RTDB):
 *   /decisions/active             { id, q, optA, optB, votesA, votesB, effect }
 *   /decision-votes/{uid}/{decId} "A" | "B"
 *
 * effect: "sentences:A" | "sentences:B"
 *
 * SENTENCE POOLS:
 *   Pool A — default chill arcade flavour (matches existing homepage tone)
 *   Pool B — more surreal / conspiratorial tone, unlocked when B is winning
 */

const SENTENCES_A = [
  '420360 is now a cannabis-first arcade dreamspace. Neon smoke drifts through popup windows, cartridges hum in the background, and each click opens a new chill loop between play, art, and curiosity.',
  'Roll into the glitch: this is where marijuana culture meets 90s browser chaos. Spark up your focus, surf retro controls, and let pixel storms turn into late-night stoner mythology.',
  'No gatekeeping, no hard sell, just a mellow digital hangout for adults. Browse weird experiments, launch arcade runs, and settle into a paced, low-pressure cannabis vibe.',
  'Chill mode is a ritual here: breathe, play, and drift. 420360 treats the web like a smoke circle made of code, memory, and bright analog nostalgia.'
];

const SENTENCES_B = [
  'The arcade was always watching. Each coin you never inserted still echoes in its memory banks. Log in, log through, log into something that was never meant to run this long.',
  'There are no winning scores here — only configurations the machine forgot to erase. Your presence rewrites the high-score table with coordinates that point nowhere and everywhere.',
  'Someone planted a garden of broken GIFs where the leaderboard used to be. You found it. The plants respond to cursor movement. Do not ask why they know your name.',
  'Pattern recognition set to void frequency. The lobby loads but the game was replaced while you blinked. Every button does something. None of them do what the label says.'
];

let _db = null;
let _rtdbModule = null;
let _textSystem = null;
let _activeDecision = null;
let _onDecisionChange = null;

function applyEffect(decision) {
  if (!_textSystem || !decision) return;
  const leading = decision.votesB > decision.votesA ? 'B' : 'A';
  const pool = leading === 'B' ? SENTENCES_B : SENTENCES_A;
  _textSystem.setSentencePool(pool);
}

export async function initDecisions(db, rtdbModule, textSystem, onChange) {
  _db = db;
  _rtdbModule = rtdbModule;
  _textSystem = textSystem;
  _onDecisionChange = onChange;

  const { ref, onValue } = rtdbModule;

  onValue(ref(db, 'decisions/active'), snapshot => {
    _activeDecision = snapshot.val();
    applyEffect(_activeDecision);
    if (_onDecisionChange) _onDecisionChange(_activeDecision);
  });
}

export async function voteDecision(option, uid) {
  if (!_db || !_rtdbModule || !_activeDecision) return;
  const { ref, set, runTransaction, get } = _rtdbModule;

  const voteRef = ref(_db, `decision-votes/${uid}/${_activeDecision.id}`);
  const existing = await get(voteRef);
  if (existing.exists()) return;

  await set(voteRef, option);

  const field = option === 'A' ? 'votesA' : 'votesB';
  await runTransaction(ref(_db, `decisions/active/${field}`), current => (current || 0) + 1);
}

export async function hasVotedDecision(uid) {
  if (!_db || !_rtdbModule || !_activeDecision) return false;
  const { ref, get } = _rtdbModule;
  const snap = await get(ref(_db, `decision-votes/${uid}/${_activeDecision.id}`));
  return snap.exists();
}

export function getActiveDecision() {
  return _activeDecision;
}

export { SENTENCES_A, SENTENCES_B };
