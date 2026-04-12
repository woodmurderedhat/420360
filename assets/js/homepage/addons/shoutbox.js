/**
 * Shoutbox — anonymous real-time chat with decay and vote distortion.
 *
 * Schema (RTDB):
 *   /shoutbox/{pushId}            { text, ts, uid, up: 0, dn: 0 }
 *   /shoutbox-votes/{uid}/{msgId} "up" | "dn"
 *
 * Rules enforced:
 *   - Messages decay after TTL_MS (client-side filter)
 *   - Max MAX_MESSAGES kept; oldest pruned on write
 *   - 1 vote per uid per message (RTDB rule: !data.exists())
 */

const MAX_MESSAGES = 100;
const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

let _db = null;
let _rtdbModule = null;
let _onMessagesChange = null;
let _messages = [];

function sanitizeText(raw) {
  return String(raw)
    .replace(/[<>]/g, c => c === '<' ? '&lt;' : '&gt;')
    .trim()
    .slice(0, 280);
}

export async function initShoutbox(db, rtdbModule, onChange) {
  _db = db;
  _rtdbModule = rtdbModule;
  _onMessagesChange = onChange;

  const { ref, onValue } = rtdbModule;
  const shoutRef = ref(db, 'shoutbox');

  onValue(shoutRef, snapshot => {
    const now = Date.now();
    const raw = snapshot.val() || {};
    _messages = Object.entries(raw)
      .map(([id, v]) => ({ id, ...v }))
      .filter(m => m.ts && now - m.ts < TTL_MS)
      .sort((a, b) => a.ts - b.ts);

    if (_onMessagesChange) _onMessagesChange([..._messages]);
  });
}

export async function postMessage(text, uid) {
  if (!_db || !_rtdbModule) return;
  const { ref, push, remove, get } = _rtdbModule;

  const clean = sanitizeText(text);
  if (!clean) return;

  // Prune excess messages before writing (best-effort, client-side)
  try {
    const snap = await get(ref(_db, 'shoutbox'));
    const all = snap.val() || {};
    const entries = Object.entries(all).sort((a, b) => (a[1].ts || 0) - (b[1].ts || 0));
    if (entries.length >= MAX_MESSAGES) {
      const toRemove = entries.slice(0, entries.length - MAX_MESSAGES + 1);
      await Promise.all(toRemove.map(([id]) => remove(ref(_db, `shoutbox/${id}`))));
    }
  } catch (_) { /* non-critical */ }

  await push(ref(_db, 'shoutbox'), {
    text: clean,
    ts: Date.now(),
    uid,
    up: 0,
    dn: 0
  });
}

export async function voteMessage(msgId, direction, uid) {
  if (!_db || !_rtdbModule) return;
  const { ref, set, runTransaction, get } = _rtdbModule;

  const voteRef = ref(_db, `shoutbox-votes/${uid}/${msgId}`);

  // Check if already voted (RTDB rule also enforces this, but fail fast client-side)
  const existing = await get(voteRef);
  if (existing.exists()) return;

  // Record vote (1-vote-per-uid enforced by RTDB rule !data.exists())
  await set(voteRef, direction);

  // Increment counter on message
  const field = direction === 'up' ? 'up' : 'dn';
  await runTransaction(ref(_db, `shoutbox/${msgId}/${field}`), current => (current || 0) + 1);
}

export function getMessages() {
  return [..._messages];
}
