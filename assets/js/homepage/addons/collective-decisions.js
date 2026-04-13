/**
 * Collective decisions — users vote between two options.
 * The winning option is tracked for UI effects only.
 *
 * Schema (RTDB):
 *   /decisions/active             { id, q, optA, optB, votesA, votesB, effect }
 *   /decision-votes/{uid}/{decId} "A" | "B"
 *
 * effect: "sentences:A" | "sentences:B"
 */

let _db = null;
let _rtdbModule = null;
let _blurb = null;
let _activeDecision = null;
let _onDecisionChange = null;

function applyEffect(decision) {
  if (!_blurb || !decision) return;
}

export async function initDecisions(db, rtdbModule, blurb, onChange) {
  _db = db;
  _rtdbModule = rtdbModule;
  _blurb = blurb;
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
