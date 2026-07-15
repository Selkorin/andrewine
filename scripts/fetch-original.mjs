import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const origin = 'https://xn--80aexbctj5a4e.xn--p1ai';
const pages = {
  '/': 'page132437346.html',
  '/buy_champagne': 'page136045756.html',
  '/buy_whisky': 'page136045966.html',
  '/buy_cognac': 'page136046316.html',
  '/buy_portwine': 'page136046936.html',
  '/buy_rum': 'page136047606.html',
  '/buy_vodka': 'page136048186.html',
  '/buy_brandy': 'page136049296.html',
  '/buy_wine': 'page136462246.html',
  '/404': '404.html',
};

const assetPattern = /(?:["'(=]|&quot;)\/?((?:css|js|images|files)\/[^"'()<>\s?&]+)/g;
const assets = new Set();

async function download(url) {
  const response = await fetch(url, { redirect: 'follow' });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response;
}

function collect(text) {
  for (const match of text.matchAll(assetPattern)) assets.add(match[1]);
}

await mkdir('src/legacy', { recursive: true });
for (const [route, filename] of Object.entries(pages)) {
  const response = await download(`${origin}${route}`);
  const html = await response.text();
  collect(html);
  await writeFile(path.join('src/legacy', filename), html);
}

for (const asset of assets) {
  const response = await download(`${origin}/${asset}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  const target = path.join('public', asset);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, bytes);
  if (asset.endsWith('.css') || asset.endsWith('.js')) collect(bytes.toString('utf8'));
}

console.log(`Downloaded ${Object.keys(pages).length} pages and ${assets.size} assets.`);
