import { readFile } from 'node:fs/promises';
import path from 'node:path';

const host = 'andrewine.ru';
const key = '429164fc347e200f2069f64067a5cd76';
const keyLocation = `https://${host}/${key}.txt`;
const sitemap = await readFile(path.resolve('dist/sitemap.xml'), 'utf8');
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => url);

if (!urlList.length) throw new Error('В dist/sitemap.xml не найдено ни одного URL');

const response = await fetch('https://yandex.com/indexnow', {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host, key, keyLocation, urlList }),
});

if (![200, 202].includes(response.status)) {
  throw new Error(`IndexNow вернул HTTP ${response.status}: ${await response.text()}`);
}

console.log(`IndexNow принял ${urlList.length} URL: HTTP ${response.status}`);
