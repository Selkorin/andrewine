// Зеркалирует иллюстрации статей из Wikimedia Commons в public/assets/articles/
// под SEO-именами и переписывает поле image в src/data/articles/*.ts на локальную
// копию. Запускать на машине с доступом в интернет: npm run fetch:images
// Повторный запуск безопасен: уже локальные статьи пропускаются.
import { mkdir, readFile, readdir, writeFile, access } from 'node:fs/promises';
import path from 'node:path';

const dataDir = path.resolve('src/data/articles');
const outDir = path.resolve('public/assets/articles');
const publicBase = 'https://selkorin.github.io/andrewine/assets/articles';
const headers = { 'User-Agent': 'AndrewineImageMirror/1.0 (andrewine.ru; contact: andrewine@mail.com)' };

await mkdir(outDir, { recursive: true });

let downloaded = 0;
let skipped = 0;
let failed = 0;

for (const entry of await readdir(dataDir)) {
  if (!entry.endsWith('.ts')) continue;
  const file = path.join(dataDir, entry);
  let source = await readFile(file, 'utf8');
  const pairs = [...source.matchAll(/image: '([^']+)',[\s\S]*?imageSeoName: '([^']+)'/g)];

  for (const [, imageUrl, seoName] of pairs) {
    if (imageUrl.startsWith(publicBase)) {
      skipped += 1;
      continue;
    }
    const target = path.join(outDir, seoName);
    let exists = false;
    try {
      await access(target);
      exists = true;
    } catch {}

    if (!exists) {
      try {
        const response = await fetch(imageUrl, { headers, redirect: 'follow' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const type = response.headers.get('content-type') ?? '';
        if (!type.startsWith('image/')) throw new Error(`не картинка: ${type}`);
        await writeFile(target, Buffer.from(await response.arrayBuffer()));
        downloaded += 1;
        console.log(`✓ ${seoName}`);
      } catch (error) {
        failed += 1;
        console.error(`✗ ${seoName}: ${error.message} (${imageUrl})`);
        continue;
      }
    }
    source = source.replace(`image: '${imageUrl}',`, `image: '${publicBase}/${seoName}',`);
  }

  await writeFile(file, source);
}

console.log(`Готово: скачано ${downloaded}, уже локальных ${skipped}, ошибок ${failed}.`);
if (failed) process.exit(1);
