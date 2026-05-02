import { getDb } from '../assets/js/homepage/addons/rtdb.js';
import {
  ref,
  push,
  query,
  limitToLast,
  onValue,
  get,
  set
} from 'https://www.gstatic.com/firebasejs/12.11.0/firebase-database.js';

const MAX_TITLE_LENGTH = 120;
const MAX_POST_LENGTH = 500;
const MAX_ALIAS_LENGTH = 24;
const MAX_MOOD_LENGTH = 24;
const MAX_VISIBLE_POSTS = 200;
const PAGE_SIZE = 12;
const UID_KEY = '420360_blog_uid';
const ALIAS_KEY = '420360_blog_alias';
const MOOD_KEY = '420360_blog_mood';
const TITLE_DRAFT_KEY = '420360_blog_draft_title';
const TEXT_DRAFT_KEY = '420360_blog_draft_text';

const state = {
  uid: null,
  db: null,
  posts: [],
  likes: {},
  visibleCount: PAGE_SIZE,
  highlightPostId: null
};

function getUid() {
  let uid = localStorage.getItem(UID_KEY);
  if (uid) return uid;

  uid = `anon_${Date.now().toString(36)}_${Array.from(crypto.getRandomValues(new Uint8Array(6)))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('')}`;
  localStorage.setItem(UID_KEY, uid);
  return uid;
}

function sanitizeTitle(raw) {
  return String(raw || '')
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_TITLE_LENGTH);
}

function sanitizeBody(raw) {
  return String(raw || '')
    .replace(/\r\n/g, '\n')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, MAX_POST_LENGTH);
}

function sanitizeAlias(raw) {
  const cleaned = String(raw || '')
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_ALIAS_LENGTH);
  return cleaned || 'anonymous';
}

function sanitizeMood(raw) {
  const cleaned = String(raw || '')
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_MOOD_LENGTH);
  return cleaned || 'smoke signal';
}

function loadDraftPreferences() {
  return {
    alias: sanitizeAlias(localStorage.getItem(ALIAS_KEY) || 'anonymous'),
    mood: sanitizeMood(localStorage.getItem(MOOD_KEY) || 'smoke signal')
  };
}

function loadDraftContent() {
  return {
    title: String(localStorage.getItem(TITLE_DRAFT_KEY) || '').slice(0, MAX_TITLE_LENGTH),
    text: String(localStorage.getItem(TEXT_DRAFT_KEY) || '').slice(0, MAX_POST_LENGTH)
  };
}

function formatTimestamp(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date unknown';
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

function formatRelativeTime(value) {
  const diffMs = Date.now() - value;
  if (!Number.isFinite(diffMs)) return 'unknown time';

  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return formatTimestamp(value);
}

function getFilteredPosts() {
  const searchInput = document.getElementById('feed-search');
  const moodFilter = document.getElementById('feed-mood-filter');
  const sortSelect = document.getElementById('feed-sort');

  const searchTerm = String(searchInput?.value || '').trim().toLowerCase();
  const mood = String(moodFilter?.value || '').trim().toLowerCase();
  const sortOrder = String(sortSelect?.value || 'newest');

  const filteredPosts = state.posts.filter(post => {
    const haystack = `${post.title || ''} ${post.text || ''} ${post.alias || ''}`.toLowerCase();
    if (searchTerm && !haystack.includes(searchTerm)) return false;
    if (mood && String(post.mood || '').toLowerCase() !== mood) return false;
    return true;
  });

  filteredPosts.sort((left, right) => {
    const delta = (right.ts || 0) - (left.ts || 0);
    return sortOrder === 'oldest' ? -delta : delta;
  });

  return filteredPosts;
}

function updateMoodOptions(posts) {
  const select = document.getElementById('feed-mood-filter');
  if (!select) return;

  const currentValue = select.value;
  const moods = Array.from(new Set(posts.map(post => sanitizeMood(post.mood || '')).filter(Boolean))).sort((a, b) => a.localeCompare(b));
  select.innerHTML = '<option value="">All moods</option>';

  moods.forEach(mood => {
    const option = document.createElement('option');
    option.value = mood;
    option.textContent = mood;
    select.appendChild(option);
  });

  if (moods.includes(currentValue)) {
    select.value = currentValue;
  }
}

function getPostLikeCount(postId) {
  const likes = state.likes[postId];
  if (!likes || typeof likes !== 'object') return 0;
  return Object.values(likes).filter(value => value === true).length;
}

function hasLikedPost(postId) {
  return !!state.likes[postId]?.[state.uid];
}

function setComposerStatus(message, tone = 'idle') {
  const status = document.getElementById('composer-status');
  if (!status) return;
  status.textContent = message;
  status.dataset.tone = tone;
}

function setFeedStatus(message) {
  const status = document.getElementById('feed-status');
  if (!status) return;
  status.textContent = message;
}

function setMeta(message) {
  const meta = document.getElementById('blog-meta');
  if (!meta) return;
  meta.textContent = message;
}

function updateCounter(elementId, value, maxLength) {
  const element = document.getElementById(elementId);
  if (!element) return;
  element.textContent = `${value.length} / ${maxLength}`;
}

function getHighlightedPostId() {
  const hash = window.location.hash.replace(/^#/, '').trim();
  return hash.startsWith('post-') ? hash.slice(5) : null;
}

function ensureHighlightedPostVisible(posts) {
  if (!state.highlightPostId) return;

  const highlightedIndex = posts.findIndex(post => post.id === state.highlightPostId);
  if (highlightedIndex === -1) return;

  const requiredVisibleCount = highlightedIndex + 1;
  if (requiredVisibleCount > state.visibleCount) {
    state.visibleCount = Math.ceil(requiredVisibleCount / PAGE_SIZE) * PAGE_SIZE;
  }
}

function highlightPost(postId) {
  state.highlightPostId = postId;
  document.querySelectorAll('.post-card.is-highlighted').forEach(card => {
    card.classList.remove('is-highlighted');
  });

  if (!postId) return;

  const card = document.getElementById(`post-${postId}`);
  if (!card) return;
  card.classList.add('is-highlighted');
  card.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function likePost(postId, button) {
  if (!state.db || !state.uid) return;

  const likeRef = ref(state.db, `blog-post-likes/${postId}/${state.uid}`);
  button.disabled = true;

  try {
    const snapshot = await get(likeRef);
    if (snapshot.exists()) return;
    await set(likeRef, true);
  } catch (error) {
    console.error('[blog] Failed to like post:', error);
  } finally {
    button.disabled = false;
  }
}

function renderPosts(posts) {
  const feed = document.getElementById('post-feed');
  const template = document.getElementById('post-card-template');
  const loadMoreButton = document.getElementById('load-more-posts');
  if (!feed || !template) return;

  feed.innerHTML = '';

  const visiblePosts = posts.slice(0, state.visibleCount);

  if (!visiblePosts.length) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = posts.length ? 'No posts match the current filters.' : 'No posts yet. Be the first to write one.';
    feed.appendChild(empty);
    if (loadMoreButton) loadMoreButton.hidden = true;
    return;
  }

  const fragment = document.createDocumentFragment();

  visiblePosts.forEach((post, index) => {
    const clone = template.content.cloneNode(true);
    const card = clone.querySelector('.post-card');
    const date = clone.querySelector('.post-date');
    const author = clone.querySelector('.post-author');
    const mood = clone.querySelector('.post-mood');
    const title = clone.querySelector('.post-title');
    const body = clone.querySelector('.post-body');
    const likeButton = clone.querySelector('.like-button');
    const likeCount = clone.querySelector('.like-count');
    const postLink = clone.querySelector('.post-link');

    if (card) {
      card.id = `post-${post.id}`;
      card.style.animationDelay = `${Math.min(index * 40, 360)}ms`;
      card.classList.toggle('is-highlighted', post.id === state.highlightPostId);
    }

    if (date) {
      const exact = formatTimestamp(post.ts);
      date.textContent = `${formatRelativeTime(post.ts)} • ${exact}`;
      date.title = exact;
    }
    if (author) author.textContent = `${post.alias || 'anonymous'} • ${post.uid === state.uid ? 'you' : 'transmission'}`;
    if (mood) mood.textContent = post.mood || 'smoke signal';
    if (title) title.textContent = post.title;
    if (body) body.textContent = post.text;
    if (likeCount) {
      const count = getPostLikeCount(post.id);
      likeCount.textContent = `${count} like${count === 1 ? '' : 's'}`;
    }
    if (likeButton) {
      const liked = hasLikedPost(post.id);
      likeButton.textContent = liked ? 'Liked' : 'Like';
      likeButton.disabled = liked;
      likeButton.classList.toggle('is-liked', liked);
      likeButton.addEventListener('click', () => likePost(post.id, likeButton));
    }
    if (postLink) {
      postLink.href = `#post-${post.id}`;
      postLink.addEventListener('click', event => {
        event.preventDefault();
        window.location.hash = `post-${post.id}`;
        highlightPost(post.id);
      });
    }

    fragment.appendChild(clone);
  });

  feed.appendChild(fragment);

  if (loadMoreButton) {
    loadMoreButton.hidden = posts.length <= state.visibleCount;
  }
}

function refreshFeed() {
  const filteredPosts = getFilteredPosts();
  ensureHighlightedPostVisible(filteredPosts);
  renderPosts(filteredPosts);
  setFeedStatus(`Showing ${Math.min(filteredPosts.length, state.visibleCount)} of ${filteredPosts.length} matching posts`);
  if (state.highlightPostId) {
    requestAnimationFrame(() => highlightPost(state.highlightPostId));
  }
}

async function initBlog() {
  const form = document.getElementById('post-form');
  const aliasInput = document.getElementById('post-alias');
  const moodInput = document.getElementById('post-mood');
  const titleInput = document.getElementById('post-title');
  const textInput = document.getElementById('post-text');
  const titleCounter = document.getElementById('title-counter');
  const textCounter = document.getElementById('text-counter');
  const submitButton = document.getElementById('post-submit');
  const searchInput = document.getElementById('feed-search');
  const moodFilter = document.getElementById('feed-mood-filter');
  const sortSelect = document.getElementById('feed-sort');
  const loadMoreButton = document.getElementById('load-more-posts');

  if (!form || !aliasInput || !moodInput || !titleInput || !textInput || !titleCounter || !textCounter || !submitButton || !searchInput || !moodFilter || !sortSelect || !loadMoreButton) return;

  setComposerStatus('Connecting...', 'idle');

  try {
    const db = await getDb();
    state.db = db;
    state.uid = getUid();

    const draftPreferences = loadDraftPreferences();
    const draftContent = loadDraftContent();
    aliasInput.value = draftPreferences.alias;
    moodInput.value = draftPreferences.mood;
    titleInput.value = draftContent.title;
    textInput.value = draftContent.text;
    updateCounter('title-counter', titleInput.value, MAX_TITLE_LENGTH);
    updateCounter('text-counter', textInput.value, MAX_POST_LENGTH);
    state.highlightPostId = getHighlightedPostId();

    const postsQuery = query(ref(db, 'blog-posts'), limitToLast(MAX_VISIBLE_POSTS));
    const likesQuery = query(ref(db, 'blog-post-likes'), limitToLast(MAX_VISIBLE_POSTS));

    onValue(postsQuery, snapshot => {
      const rawPosts = snapshot.val() || {};
      state.posts = Object.entries(rawPosts)
        .map(([id, value]) => ({ id, ...value }))
        .filter(post => post && typeof post.title === 'string' && typeof post.text === 'string')
        .map(post => ({
          ...post,
          alias: sanitizeAlias(post.alias || 'anonymous'),
          mood: sanitizeMood(post.mood || 'smoke signal')
        }))
        .sort((left, right) => (right.ts || 0) - (left.ts || 0));

      updateMoodOptions(state.posts);
      refreshFeed();

      if (state.posts.length) {
        setMeta(`Realtime archive live • latest post ${formatTimestamp(state.posts[0].ts)}`);
      } else {
        setMeta('Realtime archive live • waiting for the first post');
      }
    });

    onValue(likesQuery, snapshot => {
      state.likes = snapshot.val() || {};
      refreshFeed();
    });

    aliasInput.addEventListener('change', () => {
      aliasInput.value = sanitizeAlias(aliasInput.value);
      localStorage.setItem(ALIAS_KEY, aliasInput.value);
    });

    moodInput.addEventListener('change', () => {
      moodInput.value = sanitizeMood(moodInput.value);
      localStorage.setItem(MOOD_KEY, moodInput.value);
    });

    titleInput.addEventListener('input', () => {
      localStorage.setItem(TITLE_DRAFT_KEY, titleInput.value);
      updateCounter('title-counter', titleInput.value, MAX_TITLE_LENGTH);
    });

    textInput.addEventListener('input', () => {
      localStorage.setItem(TEXT_DRAFT_KEY, textInput.value);
      updateCounter('text-counter', textInput.value, MAX_POST_LENGTH);
    });

    searchInput.addEventListener('input', () => {
      state.visibleCount = PAGE_SIZE;
      refreshFeed();
    });

    moodFilter.addEventListener('change', () => {
      state.visibleCount = PAGE_SIZE;
      refreshFeed();
    });

    sortSelect.addEventListener('change', () => {
      state.visibleCount = PAGE_SIZE;
      refreshFeed();
    });

    loadMoreButton.addEventListener('click', () => {
      state.visibleCount += PAGE_SIZE;
      refreshFeed();
    });

    window.addEventListener('hashchange', () => {
      state.highlightPostId = getHighlightedPostId();
      highlightPost(state.highlightPostId);
    });

    form.addEventListener('submit', async event => {
      event.preventDefault();

      const alias = sanitizeAlias(aliasInput.value);
      const mood = sanitizeMood(moodInput.value);
      const title = sanitizeTitle(titleInput.value);
      const text = sanitizeBody(textInput.value);

      if (!title || !text) {
        setComposerStatus('Add both a title and a post before publishing.', 'error');
        return;
      }

      submitButton.disabled = true;
      aliasInput.disabled = true;
      moodInput.disabled = true;
      titleInput.disabled = true;
      textInput.disabled = true;
      setComposerStatus('Publishing...', 'idle');

      try {
        await push(ref(db, 'blog-posts'), {
          alias,
          mood,
          title,
          text,
          ts: Date.now(),
          uid: state.uid
        });

        localStorage.setItem(ALIAS_KEY, alias);
        localStorage.setItem(MOOD_KEY, mood);
        form.reset();
        localStorage.removeItem(TITLE_DRAFT_KEY);
        localStorage.removeItem(TEXT_DRAFT_KEY);
        aliasInput.value = alias;
        moodInput.value = mood;
        updateCounter('title-counter', '', MAX_TITLE_LENGTH);
        updateCounter('text-counter', '', MAX_POST_LENGTH);
        setComposerStatus('Posted.', 'success');
      } catch (error) {
        console.error('[blog] Failed to publish post:', error);
        setComposerStatus('Could not publish right now. Please try again.', 'error');
      } finally {
        submitButton.disabled = false;
        aliasInput.disabled = false;
        moodInput.disabled = false;
        titleInput.disabled = false;
        textInput.disabled = false;
        titleInput.focus();
      }
    });

    setComposerStatus('Ready to post.', 'idle');
  } catch (error) {
    console.error('[blog] Failed to initialize:', error);
    setMeta('Could not connect to the realtime archive.');
    setFeedStatus('Connection failed');
    setComposerStatus('Blog is unavailable right now.', 'error');
  }
}

document.addEventListener('DOMContentLoaded', initBlog);
