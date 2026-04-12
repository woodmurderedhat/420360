export function createTextSystem({ state, config, getSentencesFallback }) {
  let sentenceIndex = 0;

  function randomGlitchString(len) {
    const chars = '!@#$%^&*()_+=-[]{};:<>,.?/|~420360';
    return Array.from({ length: len }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
  }

  function setBlurbText(sentence) {
    const blurbEl = document.getElementById('blurb');
    if (!blurbEl) return;

    blurbEl.innerHTML = '';
    const words = sentence.trim().split(' ').filter(Boolean);
    words.forEach(w => {
      const s = document.createElement('span');
      s.textContent = w;
      blurbEl.appendChild(s);
    });
    const cursor = document.createElement('span');
    cursor.className = 'cursor';
    cursor.textContent = '_';
    cursor.setAttribute('aria-hidden', 'true');
    blurbEl.appendChild(cursor);

    if (state.progressiveReveal.enabled) {
      applyProgressiveReveal();
    }
  }

  function initializeProgressiveSentence() {
    const sentencePool = state.sentences.length ? state.sentences : getSentencesFallback();
    if (!sentencePool.length) return;
    sentenceIndex = Math.floor(Math.random() * sentencePool.length);
    const sentence = String(sentencePool[sentenceIndex] || '').trim();
    if (!sentence) return;
    state.currentSentence = sentence;
    state.progressiveReveal.words = sentence.split(/\s+/).filter(Boolean);
    state.progressiveReveal.revealedCount = Math.min(1, state.progressiveReveal.words.length);
    state.progressiveReveal.lastRevealAt = 0;
  }

  function advanceToNextSentence() {
    const sentencePool = state.sentences.length ? state.sentences : getSentencesFallback();
    if (!sentencePool.length) return;
    sentenceIndex = (sentenceIndex + 1) % sentencePool.length;
    const sentence = String(sentencePool[sentenceIndex] || '').trim();
    if (!sentence) return;
    state.currentSentence = sentence;
    state.progressiveReveal.words = sentence.split(/\s+/).filter(Boolean);
    state.progressiveReveal.revealedCount = Math.min(1, state.progressiveReveal.words.length);
    state.progressiveReveal.lastRevealAt = 0;
    setBlurbText(sentence);
    applyProgressiveReveal();
  }

  function applyProgressiveReveal() {
    const blurbEl = document.getElementById('blurb');
    if (!blurbEl) return;

    const spans = blurbEl.querySelectorAll('span:not(.cursor)');
    const maxWords = spans.length;
    const revealCount = Math.max(1, Math.min(state.progressiveReveal.revealedCount, maxWords));

    spans.forEach((span, index) => {
      if (index < revealCount) span.classList.remove('is-hidden-word');
      else span.classList.add('is-hidden-word');
    });

    const cursor = blurbEl.querySelector('.cursor');
    const lastRevealedSpan = spans[revealCount - 1];
    if (cursor && lastRevealedSpan) lastRevealedSpan.after(cursor);
  }

  function revealNextProgressiveWord() {
    if (!state.progressiveReveal.enabled) return;

    const wordsTotal = state.progressiveReveal.words.length;
    if (!wordsTotal) return;
    if (state.progressiveReveal.revealedCount >= wordsTotal) {
      advanceToNextSentence();
      return;
    }

    const now = Date.now();
    if (now - state.progressiveReveal.lastRevealAt < config.POINTER_REVEAL_MIN_INTERVAL) return;

    state.progressiveReveal.revealedCount += 1;
    state.progressiveReveal.lastRevealAt = now;
    applyProgressiveReveal();
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

    const spans = blurbEl.querySelectorAll('span:not(.cursor):not(.is-hidden-word)');
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

  function morphToRandomSentence() {
    if (state.progressiveReveal.enabled) return;

    const blurbEl = document.getElementById('blurb');
    if (!blurbEl) return;

    const currentTrimmed = state.currentSentence.trim();
    const sentencePool = state.sentences.length ? state.sentences : getSentencesFallback();
    const uniqueSentences = sentencePool.filter(s => s.trim() !== currentTrimmed);
    if (uniqueSentences.length === 0) return;

    const nextSentence = uniqueSentences[Math.floor(Math.random() * uniqueSentences.length)];
    const currentWords = state.currentSentence.trim().split(' ');
    const targetWords = nextSentence.trim().split(' ');
    const maxLength = Math.max(currentWords.length, targetWords.length);

    let spans = blurbEl.querySelectorAll('span:not(.cursor)');

    while (spans.length < maxLength) {
      const span = document.createElement('span');
      span.style.marginRight = '6px';
      blurbEl.insertBefore(span, blurbEl.querySelector('.cursor'));
      spans = blurbEl.querySelectorAll('span:not(.cursor)');
    }

    if (spans.length > maxLength) {
      for (let i = spans.length - 1; i >= maxLength; i--) {
        spans[i].remove();
      }
      spans = blurbEl.querySelectorAll('span:not(.cursor)');
    }

    const changeOrder = Array.from({ length: maxLength }, (_, i) => i);
    changeOrder.sort(() => Math.random() - 0.5);

    let step = 0;
    function changeNextWord() {
      if (step >= changeOrder.length) {
        state.currentSentence = nextSentence;
        return;
      }
      const idx = changeOrder[step];
      const newWord = targetWords[idx] || '';
      spans[idx].textContent = newWord;
      step++;
      setTimeout(changeNextWord, 150);
    }
    changeNextWord();
  }

  return {
    randomGlitchString,
    setBlurbText,
    initializeProgressiveSentence,
    applyProgressiveReveal,
    revealNextProgressiveWord,
    glitchRandomWord,
    fullGlitch,
    morphToRandomSentence,
    setSentencePool(pool) {
      if (!Array.isArray(pool) || !pool.length) return;
      state.sentences = pool.filter(s => typeof s === 'string' && s.trim());
    }
  };
}
