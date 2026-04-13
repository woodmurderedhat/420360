export function randomGlitchString(len) {
  const chars = '!@#$%^&*()_+=-[]{};:<>,.?/|~420360';
  return Array.from({ length: len }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
}

export function createGlitchService({ renderer, config }) {
  function fullGlitch() {
    if (!renderer.getElement()) return;
    renderer.setFullGlitch(true);
    setTimeout(() => renderer.setFullGlitch(false), 300);
  }

  function glitchRandomWord() {
    const words = renderer.getWords();
    if (!words.length) return;

    if (Math.random() < 0.02) fullGlitch();

    const idx = Math.floor(Math.random() * words.length);
    const span = words[idx];
    if (!span || span.classList.contains('glitch')) return;

    const original = span.textContent || '';
    const previousTimeoutId = Number(span.dataset.glitchTimeoutId || 0);
    if (previousTimeoutId) clearTimeout(previousTimeoutId);

    span.dataset.glitchOriginal = original;
    span.textContent = randomGlitchString(Math.max(1, original.length));
    span.classList.add('glitch');

    const duration = config.GLITCH_WORD_MIN_DURATION
      + Math.random() * (config.GLITCH_WORD_MAX_DURATION - config.GLITCH_WORD_MIN_DURATION);

    const timeoutId = setTimeout(() => {
      const fallbackOriginal = span.dataset.glitchOriginal || original;
      span.textContent = fallbackOriginal;
      span.classList.remove('glitch');
      delete span.dataset.glitchOriginal;
      delete span.dataset.glitchTimeoutId;
    }, duration);

    span.dataset.glitchTimeoutId = String(timeoutId);
  }

  return {
    fullGlitch,
    glitchRandomWord
  };
}
