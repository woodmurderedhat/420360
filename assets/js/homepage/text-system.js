export function createTextSystem({ state, config, getSentencesFallback }) {
  function randomGlitchString(len) {
    const chars = '!@#$%^&*()_+=-[]{};:<>,.?/|~420360';
    return Array.from({ length: len }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
  }

  function initWordStream() {
    const blurbEl = document.getElementById('blurb');
    if (!blurbEl) return;

    const sentencePool = state.sentences.length ? state.sentences : getSentencesFallback();
    if (!sentencePool.length) return;

    state.wordStream.sentenceIndex = Math.floor(Math.random() * sentencePool.length);
    state.wordStream.wordIndex = 0;
    state.currentSentence = String(sentencePool[state.wordStream.sentenceIndex] || '').trim();

    blurbEl.innerHTML = '';
    const cursor = document.createElement('span');
    cursor.className = 'cursor';
    cursor.textContent = '_';
    cursor.setAttribute('aria-hidden', 'true');
    blurbEl.appendChild(cursor);
  }

  function pruneToFit(blurbEl) {
    const maxIter = 200;
    let iter = 0;
    while (blurbEl.scrollHeight > blurbEl.clientHeight && iter < maxIter) {
      const first = blurbEl.querySelector('span:not(.cursor)');
      if (!first) break;
      const timeoutId = Number(first.dataset.glitchTimeoutId || 0);
      if (timeoutId) clearTimeout(timeoutId);
      first.remove();
      iter++;
    }
  }

  function streamNextWord() {
    const blurbEl = document.getElementById('blurb');
    if (!blurbEl) return;

    const sentencePool = state.sentences.length ? state.sentences : getSentencesFallback();
    if (!sentencePool.length) return;

    const words = String(sentencePool[state.wordStream.sentenceIndex] || '').trim().split(/\s+/).filter(Boolean);

    if (!words.length) {
      state.wordStream.sentenceIndex = (state.wordStream.sentenceIndex + 1) % sentencePool.length;
      state.wordStream.wordIndex = 0;
      return;
    }

    const word = words[state.wordStream.wordIndex];
    if (!word) return;

    const cursor = blurbEl.querySelector('.cursor');
    const span = document.createElement('span');
    span.textContent = word;
    span.classList.add('word-new');
    blurbEl.insertBefore(span, cursor);
    setTimeout(() => span.classList.remove('word-new'), 220);

    requestAnimationFrame(() => pruneToFit(blurbEl));

    state.wordStream.wordIndex += 1;
    if (state.wordStream.wordIndex >= words.length) {
      state.wordStream.sentenceIndex = (state.wordStream.sentenceIndex + 1) % sentencePool.length;
      state.wordStream.wordIndex = 0;
      state.currentSentence = String(sentencePool[state.wordStream.sentenceIndex] || '').trim();
    }
  }

  function fullGlitch() {
    const blurbEl = document.getElementById('blurb');
    if (!blurbEl) return;
    blurbEl.classList.add('glitch-effect');
    setTimeout(() => blurbEl.classList.remove('glitch-effect'), 300);
  }

  function glitchRandomWord() {
    const blurbEl = document.getElementById('blurb');
    if (!blurbEl) return;

    const spans = blurbEl.querySelectorAll('span:not(.cursor)');
    if (!spans.length) return;

    if (Math.random() < 0.02) fullGlitch();

    const idx = Math.floor(Math.random() * spans.length);
    const span = spans[idx];
    if (!span || span.classList.contains('glitch')) return;

    const original = span.textContent;
    const previousTimeoutId = Number(span.dataset.glitchTimeoutId || 0);
    if (previousTimeoutId) clearTimeout(previousTimeoutId);

    span.dataset.glitchOriginal = original;
    span.textContent = randomGlitchString(Math.max(1, original.length));
    span.classList.add('glitch');

    const duration = config.GLITCH_WORD_MIN_DURATION + Math.random() * (config.GLITCH_WORD_MAX_DURATION - config.GLITCH_WORD_MIN_DURATION);
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
    randomGlitchString,
    initWordStream,
    streamNextWord,
    glitchRandomWord,
    fullGlitch,
    setSentencePool(pool) {
      if (!Array.isArray(pool) || !pool.length) return;
      state.sentences = pool.filter(s => typeof s === 'string' && s.trim());
    }
  };
}
