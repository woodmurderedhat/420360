export function createSentenceSource({ initialPool = [], fallbackProvider = () => [] } = {}) {
  let sentencePool = sanitizePool(initialPool);

  function sanitizePool(pool) {
    if (!Array.isArray(pool)) return [];
    return pool
      .filter(item => typeof item === 'string')
      .map(item => item.trim())
      .filter(Boolean);
  }

  function getPool() {
    if (sentencePool.length) return sentencePool;
    return sanitizePool(fallbackProvider());
  }

  function setPool(nextPool) {
    const sanitized = sanitizePool(nextPool);
    if (!sanitized.length) return false;
    sentencePool = sanitized;
    return true;
  }

  return {
    getPool,
    setPool
  };
}
