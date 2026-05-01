import { getDb } from '../assets/js/homepage/addons/rtdb.js';
import {
  ref,
  push,
  query,
  limitToLast,
  onValue
} from 'https://www.gstatic.com/firebasejs/12.11.0/firebase-database.js';

const MAX_TITLE_LENGTH = 120;
const MAX_POST_LENGTH = 500;
const MAX_VISIBLE_POSTS = 100;
const UID_KEY = '420360_blog_uid';

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

function renderPosts(posts) {
  const feed = document.getElementById('post-feed');
  const template = document.getElementById('post-card-template');
  if (!feed || !template) return;

  feed.innerHTML = '';

  if (!posts.length) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = 'No posts yet. Be the first to write one.';
    feed.appendChild(empty);
    return;
  }

  const fragment = document.createDocumentFragment();

  posts.forEach((post, index) => {
    const clone = template.content.cloneNode(true);
    const card = clone.querySelector('.post-card');
    const date = clone.querySelector('.post-date');
    const title = clone.querySelector('.post-title');
    const body = clone.querySelector('.post-body');

    if (card) {
      card.style.animationDelay = `${Math.min(index * 40, 360)}ms`;
    }

    if (date) date.textContent = formatTimestamp(post.ts);
    if (title) title.textContent = post.title;
    if (body) body.textContent = post.text;

    fragment.appendChild(clone);
  });

  feed.appendChild(fragment);
}

async function initBlog() {
  const form = document.getElementById('post-form');
  const titleInput = document.getElementById('post-title');
  const textInput = document.getElementById('post-text');
  const submitButton = document.getElementById('post-submit');

  if (!form || !titleInput || !textInput || !submitButton) return;

  setComposerStatus('Connecting...', 'idle');

  try {
    const db = await getDb();
    const uid = getUid();
    const postsQuery = query(ref(db, 'blog-posts'), limitToLast(MAX_VISIBLE_POSTS));

    onValue(postsQuery, snapshot => {
      const rawPosts = snapshot.val() || {};
      const posts = Object.entries(rawPosts)
        .map(([id, value]) => ({ id, ...value }))
        .filter(post => post && typeof post.title === 'string' && typeof post.text === 'string')
        .sort((left, right) => (right.ts || 0) - (left.ts || 0));

      renderPosts(posts);
      setFeedStatus(`${posts.length} post${posts.length === 1 ? '' : 's'} loaded`);

      if (posts.length) {
        setMeta(`Realtime archive live • latest post ${formatTimestamp(posts[0].ts)}`);
      } else {
        setMeta('Realtime archive live • waiting for the first post');
      }
    });

    form.addEventListener('submit', async event => {
      event.preventDefault();

      const title = sanitizeTitle(titleInput.value);
      const text = sanitizeBody(textInput.value);

      if (!title || !text) {
        setComposerStatus('Add both a title and a post before publishing.', 'error');
        return;
      }

      submitButton.disabled = true;
      titleInput.disabled = true;
      textInput.disabled = true;
      setComposerStatus('Publishing...', 'idle');

      try {
        await push(ref(db, 'blog-posts'), {
          title,
          text,
          ts: Date.now(),
          uid
        });

        form.reset();
        setComposerStatus('Posted.', 'success');
      } catch (error) {
        console.error('[blog] Failed to publish post:', error);
        setComposerStatus('Could not publish right now. Please try again.', 'error');
      } finally {
        submitButton.disabled = false;
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
