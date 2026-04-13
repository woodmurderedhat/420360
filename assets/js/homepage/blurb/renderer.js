function clearWordTimeouts(root) {
  if (!root) return;
  const glitched = root.querySelectorAll('span[data-glitch-timeout-id]');
  for (const span of glitched) {
    const timeoutId = Number(span.dataset.glitchTimeoutId || 0);
    if (timeoutId) clearTimeout(timeoutId);
    delete span.dataset.glitchTimeoutId;
    delete span.dataset.glitchOriginal;
  }
}

export function createBlurbRenderer({ elementId = 'blurb' } = {}) {
  function getElement() {
    return document.getElementById(elementId);
  }

  function reset() {
    const root = getElement();
    if (!root) return false;

    clearWordTimeouts(root);
    root.classList.remove('glitch-effect');
    root.innerHTML = '';

    const cursor = document.createElement('span');
    cursor.className = 'cursor';
    cursor.textContent = '_';
    cursor.setAttribute('aria-hidden', 'true');
    root.appendChild(cursor);
    return true;
  }

  function appendWord(word) {
    const root = getElement();
    if (!root) return null;

    const cursor = root.querySelector('.cursor');
    if (!cursor) return null;

    const span = document.createElement('span');
    span.textContent = String(word || '');
    span.classList.add('word-new');
    root.insertBefore(span, cursor);
    setTimeout(() => span.classList.remove('word-new'), 220);

    // Prune immediately to avoid one-frame overflow flashes.
    pruneToFit(root);
    requestAnimationFrame(() => pruneToFit(root));
    return span;
  }

  function pruneToFit(root) {
    const maxIter = 200;
    let iter = 0;
    while (root.scrollHeight > root.clientHeight && iter < maxIter) {
      const first = root.querySelector('span:not(.cursor)');
      if (!first) break;

      const timeoutId = Number(first.dataset.glitchTimeoutId || 0);
      if (timeoutId) clearTimeout(timeoutId);
      first.remove();
      iter += 1;
    }
  }

  function getWords() {
    const root = getElement();
    if (!root) return [];
    return Array.from(root.querySelectorAll('span:not(.cursor)'));
  }

  function setFullGlitch(active) {
    const root = getElement();
    if (!root) return;
    root.classList.toggle('glitch-effect', Boolean(active));
  }

  function teardown() {
    const root = getElement();
    if (!root) return;
    clearWordTimeouts(root);
    root.classList.remove('glitch-effect');
  }

  return {
    getElement,
    reset,
    appendWord,
    getWords,
    setFullGlitch,
    teardown
  };
}
