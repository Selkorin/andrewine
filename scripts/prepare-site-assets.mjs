import { mkdir, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const dist = path.resolve('dist');
const source = path.join(dist, 'vendor', 'tilda');
const target = path.join(dist, 'site-assets');
const hosts = {
  'static.tildacdn.com': 's',
  'thb.tildacdn.com': 't',
  'neo.tildacdn.com': 'n',
};

await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });

for (const [host, alias] of Object.entries(hosts)) {
  await rename(path.join(source, host), path.join(target, alias));
}

// CSS references assets from sibling CDN-host folders. Those folders now use
// neutral aliases too, so update the relative references after moving them.
async function rewriteCss(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await rewriteCss(file);
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith('.css')) continue;

    const { readFile, writeFile } = await import('node:fs/promises');
    const original = await readFile(file, 'utf8');
    const rewritten = Object.entries(hosts).reduce(
      (css, [host, alias]) => css.replaceAll(host, alias),
      original,
    );
    if (rewritten !== original) await writeFile(file, rewritten, 'utf8');
  }
}

await rewriteCss(target);

// Astro components may reference vendored public images directly during local
// development. Once the host folders move to neutral production paths, update
// those references in generated text assets as well.
async function rewriteGeneratedReferences(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await rewriteGeneratedReferences(file);
      continue;
    }
    if (!entry.isFile() || !/\.(?:html|css|js|xml)$/.test(entry.name)) continue;

    const original = await readFile(file, 'utf8');
    const rewritten = Object.entries(hosts).reduce(
      (content, [host, alias]) => content.replaceAll(`/vendor/tilda/${host}/`, `/site-assets/${alias}/`),
      original,
    );
    if (rewritten !== original) await writeFile(file, rewritten, 'utf8');
  }
}

await rewriteGeneratedReferences(dist);
await rm(path.join(dist, 'vendor'), { recursive: true, force: true });

console.log('Подготовлены нейтральные локальные URL для ресурсов сайта.');
