const DATA_URL = '/assets/data/movie-reviews.json';
const FALLBACK_POSTER = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 180"><rect width="120" height="180" fill="%2317100c"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23ffbf5f" font-size="12" font-family="monospace">No Poster</text></svg>';

function safeText(input) {
  if (typeof input !== 'string') return '';
  return input.replace(/\s+/g, ' ').trim();
}

function formatDate(dateValue) {
  if (!dateValue) return 'Date unknown';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return safeText(dateValue);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function formatRating(stars) {
  const numeric = Number(stars);
  if (!Number.isFinite(numeric) || numeric <= 0) return 'Unrated';
  return `${numeric.toFixed(numeric % 1 === 0 ? 0 : 1)} / 5`;
}

function setStatus(message, isVisible = true) {
  const statusEl = document.getElementById('status');
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.classList.toggle('hidden', !isVisible);
}

function setSyncMeta(meta) {
  const syncEl = document.getElementById('sync-meta');
  if (!syncEl) return;

  if (!meta || !meta.lastSynced) {
    syncEl.textContent = 'Sync status: waiting for first feed sync';
    return;
  }

  const lastSynced = formatDate(meta.lastSynced);
  const total = Number.isFinite(meta.total) ? meta.total : 0;
  syncEl.textContent = `Sync status: ${lastSynced} • ${total} reviews loaded`;
}

function createCard(review, index) {
  const template = document.getElementById('review-card-template');
  if (!template) return null;

  const fragment = template.content.cloneNode(true);
  const card = fragment.querySelector('.review-card');
  const posterLink = fragment.querySelector('.poster-link');
  const poster = fragment.querySelector('.poster');
  const date = fragment.querySelector('.date');
  const rating = fragment.querySelector('.rating');
  const title = fragment.querySelector('.title');
  const excerpt = fragment.querySelector('.excerpt');
  const readLink = fragment.querySelector('.read-link');

  const url = safeText(review.link) || 'https://letterboxd.com/woodmurderedhat/';
  const posterUrl = safeText(review.posterUrl) || FALLBACK_POSTER;
  const plainTitle = safeText(review.title) || 'Untitled Review';
  const plainExcerpt = safeText(review.summary || review.description || '').slice(0, 220);

  if (card) {
    card.style.animationDelay = `${Math.min(index * 45, 450)}ms`;
  }

  if (posterLink) posterLink.href = url;
  if (poster) {
    poster.src = posterUrl;
    poster.alt = `Poster for ${plainTitle}`;
    poster.onerror = () => {
      poster.src = FALLBACK_POSTER;
    };
  }
  if (date) date.textContent = formatDate(review.watchedDate || review.publishedAt);
  if (rating) rating.textContent = formatRating(review.rating);
  if (title) title.textContent = plainTitle;
  if (excerpt) excerpt.textContent = plainExcerpt || 'No excerpt available for this review.';
  if (readLink) readLink.href = url;

  return fragment;
}

async function loadReviews() {
  setStatus('Loading reviews...');

  const grid = document.getElementById('reviews-grid');
  if (!grid) return;

  try {
    const response = await fetch(DATA_URL, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Failed to fetch review data (${response.status})`);
    }

    const payload = await response.json();
    const items = Array.isArray(payload.items) ? payload.items : [];
    setSyncMeta(payload.meta || {});

    if (items.length === 0) {
      setStatus('No reviews available yet. Feed sync will populate this page soon.');
      return;
    }

    const rendered = document.createDocumentFragment();
    items.forEach((review, index) => {
      const card = createCard(review, index);
      if (card) rendered.appendChild(card);
    });

    grid.innerHTML = '';
    grid.appendChild(rendered);
    setStatus(`Showing ${items.length} recent reviews`, false);
  } catch (error) {
    setSyncMeta({});
    setStatus('Could not load reviews right now. You can still open the live Letterboxd profile above.');
  }
}

document.addEventListener('DOMContentLoaded', loadReviews);
