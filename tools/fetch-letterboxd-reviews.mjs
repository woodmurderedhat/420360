#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const FEED_URL = process.env.LETTERBOXD_RSS_URL || 'https://letterboxd.com/woodmurderedhat/rss/';
const PROFILE_URL = process.env.LETTERBOXD_PROFILE_URL || 'https://letterboxd.com/woodmurderedhat/';
const MAX_ITEMS = Number.parseInt(process.env.LETTERBOXD_MAX_ITEMS || '30', 10);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUT_PATH = path.resolve(__dirname, '..', 'assets', 'data', 'movie-reviews.json');

function decodeHtmlEntities(value) {
  return (value || '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function stripTags(value) {
  return decodeHtmlEntities(value)
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getTagValue(xml, tagName) {
  const escapedTag = tagName.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  const match = xml.match(new RegExp(`<${escapedTag}>([\\s\\S]*?)<\\/${escapedTag}>`, 'i'));
  return match ? match[1].trim() : '';
}

function toIsoDate(input) {
  if (!input) return null;
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function pickPosterUrl(descriptionHtml) {
  const decoded = decodeHtmlEntities(descriptionHtml);
  const imgMatch = decoded.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (!imgMatch) return null;

  const src = imgMatch[1];
  if (!src) return null;

  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }

  return null;
}

function parseItem(itemXml) {
  const rawDescription = getTagValue(itemXml, 'description');
  const rawContent = getTagValue(itemXml, 'content:encoded');

  const publishedAt = toIsoDate(getTagValue(itemXml, 'pubDate'));
  const watchedDate = toIsoDate(getTagValue(itemXml, 'letterboxd:watchedDate'));
  const ratingValue = Number.parseFloat(getTagValue(itemXml, 'letterboxd:memberRating'));

  const link = decodeHtmlEntities(getTagValue(itemXml, 'link'));
  const title = stripTags(getTagValue(itemXml, 'title'));

  const summarySource = rawContent || rawDescription;
  const summary = stripTags(summarySource);

  const review = {
    title,
    link,
    rating: Number.isFinite(ratingValue) ? ratingValue : null,
    watchedDate,
    publishedAt,
    summary,
    posterUrl: pickPosterUrl(summarySource)
  };

  return review;
}

function parseFeed(xmlText) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;

  while ((match = itemRegex.exec(xmlText)) !== null) {
    const parsed = parseItem(match[1]);
    if (!parsed.title || !parsed.link) continue;
    items.push(parsed);
  }

  return items;
}

function sortReviews(reviews) {
  return reviews.sort((a, b) => {
    const dateA = new Date(a.watchedDate || a.publishedAt || 0).getTime();
    const dateB = new Date(b.watchedDate || b.publishedAt || 0).getTime();
    return dateB - dateA;
  });
}

async function main() {
  const response = await fetch(FEED_URL, {
    headers: {
      'User-Agent': '420360-letterboxd-sync/1.0 (+https://420360.xyz/)'
    }
  });

  if (!response.ok) {
    throw new Error(`Feed request failed: ${response.status} ${response.statusText}`);
  }

  const xmlText = await response.text();
  const parsed = parseFeed(xmlText);
  const sorted = sortReviews(parsed).slice(0, MAX_ITEMS);

  const payload = {
    meta: {
      source: FEED_URL,
      profile: PROFILE_URL,
      lastSynced: new Date().toISOString(),
      total: sorted.length
    },
    items: sorted
  };

  await fs.mkdir(path.dirname(OUT_PATH), { recursive: true });
  await fs.writeFile(OUT_PATH, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

  console.log(`Wrote ${sorted.length} reviews to ${OUT_PATH}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
