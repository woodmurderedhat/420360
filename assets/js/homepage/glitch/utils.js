export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function weightedPick(entries = []) {
  const valid = entries.filter((entry) => entry && Number(entry.weight) > 0);
  if (!valid.length) return null;

  const total = valid.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = Math.random() * total;

  for (let i = 0; i < valid.length; i += 1) {
    const entry = valid[i];
    roll -= entry.weight;
    if (roll <= 0) return entry;
  }

  return valid[valid.length - 1];
}

export function shuffle(items = []) {
  const arr = items.slice();
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = randInt(0, i);
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
  return arr;
}

export function now() {
  return typeof performance !== 'undefined' ? performance.now() : Date.now();
}
