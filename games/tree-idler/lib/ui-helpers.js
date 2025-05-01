// Shared UI helpers for panels
export function makeDraggable(panel, panelName) {
  // ...existing code...
}

export function addCollapseButton(panel, panelName) {
  // ...existing code...
}

/**
 * Formats milliseconds into a string like "Xm Ys" or "Ys".
 * @param {number} ms - Duration in milliseconds.
 * @returns {string} Formatted time string.
 */
export function formatTime(ms) {
  if (ms < 0) ms = 0;
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}