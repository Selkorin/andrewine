import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

// Keep the original files as fallbacks, but publish a smaller WebP sibling for
// every raster asset that is part of the generated site. Legacy Tilda markup is
// resolved to the WebP sibling automatically by legacyChrome.ts.
const roots = [
  path.resolve('public/vendor/tilda/static.tildacdn.com'),
  path.resolve('src/assets'),
];
let created = 0;
let saved = 0;

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await walk(file);
      continue;
    }
    if (!entry.isFile() || !/\.(png|jpe?g)$/i.test(entry.name)) continue;
    const source = await stat(file);
    if (source.size < 32 * 1024) continue;
    const output = file.replace(/\.(png|jpe?g)$/i, '.webp');
    try {
      const current = await stat(output);
      if (current.mtimeMs >= source.mtimeMs) continue;
    } catch {}
    await sharp(file, { animated: true }).webp({ quality: 80, alphaQuality: 90, effort: 5 }).toFile(output);
    const optimized = await stat(output);
    if (optimized.size >= source.size) {
      const { rm } = await import('node:fs/promises');
      await rm(output);
      continue;
    }
    created += 1;
    saved += source.size - optimized.size;
  }
}

for (const root of roots) await walk(root);
console.log(`WebP: создано ${created}, экономия ${(saved / 1024 / 1024).toFixed(2)} МБ.`);
