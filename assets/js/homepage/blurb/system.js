import { createSentenceSource } from './sentence-source.js';
import { createBlurbRenderer } from './renderer.js';
import { createGlitchService, randomGlitchString } from './glitch-service.js';

export function createBlurbSystem({
  state,
  config,
  sentencePool = [],
  getSentencesFallback,
  allowExternalSentencePoolUpdates = true,
  elementId = 'blurb',
  hooks = {}
}) {
  const source = createSentenceSource({
    initialPool: sentencePool,
    fallbackProvider: getSentencesFallback
  });

  const renderer = createBlurbRenderer({ elementId });
  const glitchService = createGlitchService({ renderer, config });

  const internal = {
    started: false,
    paused: false,
    sentenceIndex: 0,
    wordIndex: 0,
    currentSentence: ''
  };

  function emit(hook, payload) {
    const handler = hooks[hook];
    if (typeof handler !== 'function') return;
    handler(payload);
  }

  function warn(message, details) {
    emit('onWarning', { message, details });
  }

  function selectInitialSentence() {
    const pool = source.getPool();
    if (!pool.length) {
      internal.currentSentence = '';
      return;
    }

    internal.sentenceIndex = Math.floor(Math.random() * pool.length);
    internal.wordIndex = 0;
    internal.currentSentence = String(pool[internal.sentenceIndex] || '').trim();
    syncState();
  }

  function syncState() {
    if (!state) return;
    state.wordStream.sentenceIndex = internal.sentenceIndex;
    state.wordStream.wordIndex = internal.wordIndex;
    state.currentSentence = internal.currentSentence;
    state.sentences = source.getPool();
  }

  function init() {
    if (internal.started) {
      warn('Blurb already initialized; ignoring duplicate init call.');
      return true;
    }

    if (!renderer.reset()) {
      warn('Blurb mount element is missing.', { elementId });
      return false;
    }

    selectInitialSentence();
    if (!source.getPool().length) {
      warn('Blurb sentence pool is empty after initialization.');
    }

    internal.started = true;
    internal.paused = false;
    emit('onInit', { sentencePool: source.getPool() });
    return true;
  }

  function pause() {
    if (!internal.started) return;
    internal.paused = true;
    emit('onPause');
  }

  function resume() {
    if (!internal.started) return;
    internal.paused = false;
    emit('onResume');
  }

  function stop() {
    if (!internal.started) return;
    internal.started = false;
    internal.paused = true;
    renderer.teardown();
    emit('onStop');
  }

  function destroy() {
    stop();
    internal.wordIndex = 0;
    internal.sentenceIndex = 0;
    internal.currentSentence = '';
    syncState();
    emit('onDestroy');
  }

  function streamNextWord() {
    if (!internal.started || internal.paused) return;

    const pool = source.getPool();
    if (!pool.length) return;

    const words = String(pool[internal.sentenceIndex] || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (!words.length) {
      internal.sentenceIndex = (internal.sentenceIndex + 1) % pool.length;
      internal.wordIndex = 0;
      internal.currentSentence = String(pool[internal.sentenceIndex] || '').trim();
      syncState();
      return;
    }

    const word = words[internal.wordIndex];
    if (!word) return;

    const appended = renderer.appendWord(word);
    if (!appended) return;

    internal.wordIndex += 1;
    if (internal.wordIndex >= words.length) {
      internal.sentenceIndex = (internal.sentenceIndex + 1) % pool.length;
      internal.wordIndex = 0;
      internal.currentSentence = String(pool[internal.sentenceIndex] || '').trim();
    }

    syncState();
    emit('onWordStream', {
      sentenceIndex: internal.sentenceIndex,
      wordIndex: internal.wordIndex,
      currentSentence: internal.currentSentence
    });
  }

  function glitchRandomWord() {
    if (!internal.started || internal.paused) return;
    glitchService.glitchRandomWord();
  }

  function fullGlitch() {
    if (!internal.started || internal.paused) return;
    glitchService.fullGlitch();
    emit('onFullGlitch');
  }

  function setSentencePool(pool) {
    if (!allowExternalSentencePoolUpdates) {
      warn('External sentence pool updates are disabled for this blurb instance.');
      return false;
    }

    const changed = source.setPool(pool);
    if (!changed) {
      warn('Attempted to set an invalid or empty sentence pool.');
      return false;
    }

    if (internal.sentenceIndex >= source.getPool().length) {
      internal.sentenceIndex = 0;
      internal.wordIndex = 0;
    }

    syncState();
    emit('onSentencePoolChange', { sentencePool: source.getPool() });
    return true;
  }

  function getSentencePool() {
    return source.getPool();
  }

  return {
    randomGlitchString,
    init,
    start: init,
    stop,
    pause,
    resume,
    destroy,
    streamNextWord,
    glitchRandomWord,
    fullGlitch,
    setSentencePool,
    getSentencePool,
    initWordStream: init
  };
}
