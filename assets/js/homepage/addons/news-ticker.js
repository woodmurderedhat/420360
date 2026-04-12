/**
 * News Ticker — scrolls live shoutbox messages across a fixed bottom bar.
 *
 * Usage:
 *   const ticker = initNewsTicker();
 *   ticker.setMessages(msgs);  // msgs = [{ text, ts, uid, up, dn }, ...]
 *
 * The ticker element is hidden when there are no messages and shown once
 * at least one message is available. Content is doubled so the animation
 * loops seamlessly. Scroll speed is calculated from the rendered width
 * at 80 px/s (minimum 8 s duration).
 */

const PX_PER_S = 80;
const MIN_DURATION_S = 8;
const SEP = '<span class="ticker-sep" aria-hidden="true">&#9670;</span>';

export function initNewsTicker() {
  const bar     = document.getElementById('news-ticker');
  const content = document.getElementById('news-ticker-content');

  if (!bar || !content) return { setMessages: () => {} };

  // Open the commune panel when the SHOUTBOX label is clicked.
  // _toggleCommunePanel is set by addons/index.js after panel init.
  const label = document.getElementById('news-ticker-label');
  if (label) {
    label.addEventListener('click', () => {
      if (typeof window._toggleCommunePanel === 'function') {
        window._toggleCommunePanel();
      }
    });
  }

  function setMessages(msgs) {
    if (!msgs || !msgs.length) {
      bar.classList.remove('visible');
      return;
    }

    // Build a single pass of all messages joined by diamond separators.
    // Text is already HTML-entity-escaped by shoutbox.js so safe for innerHTML.
    const pass = msgs.map(m => m.text).join(SEP);

    // Double the content so the loop is seamless (the animation shifts by -50%).
    content.innerHTML = pass + SEP + pass + SEP;

    // Show the bar before measuring so scrollWidth is accurate.
    bar.classList.add('visible');

    // Reset the animation fully so the loop always starts clean from position 0.
    // Changing animationDuration on a running animation causes a mid-scroll jump.
    requestAnimationFrame(() => {
      // 1. Freeze the animation at the origin
      content.style.animation = 'none';
      // 2. Force a synchronous reflow so the browser commits "none" before we proceed
      void content.offsetWidth;
      // 3. Re-apply with the correct duration derived from the rendered width
      const halfWidth = content.scrollWidth / 2;
      const duration = Math.max(halfWidth / PX_PER_S, MIN_DURATION_S);
      content.style.animation = `ticker-scroll ${duration.toFixed(2)}s linear infinite`;
    });
  }

  return { setMessages };
}
