// Downloads every asset the legacy export still pulls from tildacdn.com, stores
// it under public/vendor/tilda/, and rewrites the exported HTML to point at the
// local copy. Run it where tildacdn.com is reachable — the site keeps working
// exactly as before, but stops calling Tilda at runtime.
//
//   node scripts/vendor-tilda.mjs          # download + rewrite
//   node scripts/vendor-tilda.mjs --dry    # list what would be fetched
//
// Assets referenced from inside downloaded CSS (fonts, sprites, background
// images) are followed too, until nothing new turns up.

import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const LEGACY_DIR = 'src/legacy';
const VENDOR_DIR = 'public/vendor/tilda';
const PUBLIC_PREFIX = '__ROOT__vendor/tilda';
const TILDA_URL = /https?:\/\/[a-z0-9.-]*tildacdn\.[a-z]+\/[^\s"'()\\<>]+/gi;
const CSS_URL = /url\(\s*['"]?([^'")]+)['"]?\s*\)/gi;

const dryRun = process.argv.includes('--dry');

/** static.tildacdn.com/css/x.css?t=1 -> static.tildacdn.com/css/x.css */
function localPathFor(url) {
  const { host, pathname } = new URL(url);
  return path.join(VENDOR_DIR, host, decodeURIComponent(pathname).replace(/^\/+/, ''));
}

function publicPathFor(url) {
  const { host, pathname } = new URL(url);
  return `${PUBLIC_PREFIX}/${host}${decodeURIComponent(pathname)}`.replace(/\/{2,}/g, (m, i) => (i === 0 ? m : '/'));
}

async function download(url) {
  const target = localPathFor(url);
  if (existsSync(target)) return readFile(target);

  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText} — ${url}`);
  const body = Buffer.from(await response.arrayBuffer());

  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, body);
  return body;
}

/** Rewrites url() references inside a vendored stylesheet to sit beside it. */
function rewriteCss(css, cssUrl) {
  return css.replace(CSS_URL, (whole, ref) => {
    if (/^(data:|#)/i.test(ref)) return whole;
    let absolute;
    try {
      absolute = new URL(ref, cssUrl).href;
    } catch {
      return whole;
    }
    if (!/tildacdn\.[a-z]+/i.test(absolute)) return whole;
    const from = path.dirname(localPathFor(cssUrl));
    const to = localPathFor(absolute);
    return `url("${path.relative(from, to).split(path.sep).join('/')}")`;
  });
}

const pages = (await readdir(LEGACY_DIR)).filter((name) => name.endsWith('.html'));
const sources = new Map();
const queue = new Set();

for (const page of pages) {
  const html = await readFile(path.join(LEGACY_DIR, page), 'utf8');
  sources.set(page, html);
  for (const url of html.match(TILDA_URL) ?? []) queue.add(url);
}

console.log(`Страниц: ${pages.length}. Ссылок на tildacdn: ${queue.size}.`);
if (dryRun) {
  for (const url of [...queue].sort()) console.log('  ', url);
  process.exit(0);
}

const done = new Set();
const failed = [];
let cssRewritten = 0;

while (queue.size) {
  const url = queue.values().next().value;
  queue.delete(url);
  if (done.has(url)) continue;
  done.add(url);

  let body;
  try {
    body = await download(url);
  } catch (error) {
    failed.push(`${url} — ${error.message}`);
    continue;
  }

  if (!/\.css(\?|$)/i.test(url)) continue;

  // Follow and localise everything the stylesheet itself pulls in.
  const css = body.toString('utf8');
  for (const [, ref] of css.matchAll(CSS_URL)) {
    if (/^(data:|#)/i.test(ref)) continue;
    try {
      const absolute = new URL(ref, url).href;
      if (/tildacdn\.[a-z]+/i.test(absolute) && !done.has(absolute)) queue.add(absolute);
    } catch {
      /* malformed url() — leave it as authored */
    }
  }
  await writeFile(localPathFor(url), rewriteCss(css, url), 'utf8');
  cssRewritten += 1;
}

for (const [page, html] of sources) {
  const rewritten = html.replace(TILDA_URL, (url) => (done.has(url) && !failed.some((f) => f.startsWith(url)) ? publicPathFor(url) : url));
  if (rewritten !== html) await writeFile(path.join(LEGACY_DIR, page), rewritten, 'utf8');
}

console.log(`Загружено: ${done.size - failed.length}. Стилей переписано: ${cssRewritten}.`);
if (failed.length) {
  console.log(`Не удалось загрузить (${failed.length}) — ссылки оставлены прежними:`);
  for (const line of failed) console.log('  ', line);
  process.exitCode = 1;
}
