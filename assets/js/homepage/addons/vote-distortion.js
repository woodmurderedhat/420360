/**
 * Vote distortion — pure utility.
 * Given up/downvote counts, returns a visibility descriptor.
 * The result intentionally contains seeded random noise so the
 * same message looks slightly different on every render call,
 * creating unpredictable weighted visibility.
 *
 * opacity:  0.15 – 1.0  (highly-downvoted messages barely render)
 * glitch:   boolean      (volatile/contested messages flicker)
 * boosted:  boolean      (high up-score messages get a neon glow)
 */

function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

export function computeVisibility(up = 0, dn = 0) {
  const score = up - dn;
  const total = up + dn;

  // Base visibility from sigmoid centred at zero, scaled by score
  const base = sigmoid(score / 5);

  // Random noise, weighted heavier for contested messages
  const contestedFactor = total > 0 ? Math.min(1, total / 10) : 0;
  const noise = (Math.random() - 0.5) * 0.35 * (0.5 + contestedFactor);

  const opacity = Math.min(1, Math.max(0.12, base + noise));

  // Glitch if score is volatile (many votes total but low net)
  const glitch = total >= 4 && Math.abs(score) <= 2 && Math.random() < 0.35;

  // Boosted if strong positive signal
  const boosted = score >= 5 && up >= 5;

  return { opacity, glitch, boosted };
}
