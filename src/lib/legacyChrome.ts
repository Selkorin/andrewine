import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const source = readFileSync(
  path.join(process.cwd(), 'src', 'legacy', 'page132437346.html'),
  'utf8',
);

const routeNames = [
  'buy_wine',
  'buy_champagne',
  'buy_whisky',
  'buy_cognac',
  'buy_portwine',
  'buy_rum',
  'buy_vodka',
  'buy_brandy',
] as const;

const oldDomains = [
  'https://xn--80aexbctj5a4e.xn--p1ai',
  'http://xn--80aexbctj5a4e.xn--p1ai',
  'https://алковыкуп.рф',
  'http://алковыкуп.рф',
];

function normalizeRoot(root: string) {
  return root.endsWith('/') ? root : `${root}/`;
}

const tildaAssetUrl = /https?:\/\/[a-z0-9.-]*tildacdn\.[a-z]+\/[^\s\"'()\\<>]+/gi;

// Keep CDN-looking host names out of public URLs. Privacy/ad-blocking extensions
// can block a same-origin request purely because its path contains
// "tildacdn.com"; when the page stylesheet is blocked, the absolutely
// positioned footer covers the entire page and makes the content look empty.
const publicAssetHosts: Record<string, string> = {
  'static.tildacdn.com': 's',
  'thb.tildacdn.com': 't',
  'neo.tildacdn.com': 'n',
};

const vendorRoot = path.join(process.cwd(), 'public', 'vendor', 'tilda');

function versionedPublicVendorPath(vendorPath: string, root: string) {
  if (/\.(png|jpe?g)$/i.test(vendorPath)) {
    const webpPath = vendorPath.replace(/\.(png|jpe?g)$/i, '.webp');
    if (existsSync(webpPath)) vendorPath = webpPath;
  }
  const relative = path.relative(vendorRoot, vendorPath);
  if (relative.startsWith('..') || path.isAbsolute(relative)) return null;

  const [host, ...parts] = relative.split(path.sep);
  const publicHost = publicAssetHosts[host];
  if (!publicHost || !existsSync(vendorPath)) return null;

  const asset = statSync(vendorPath);
  const version = `${asset.size}-${Math.trunc(asset.mtimeMs)}`;
  return `${normalizeRoot(root)}site-assets/${publicHost}/${parts.join('/')}?v=${version}`;
}

function localVendorUrl(url: string, root: string) {
  try {
    const parsed = new URL(url);
    const relativePath = decodeURIComponent(parsed.pathname).replace(/^\/+/, '');
    const vendorPath = path.join(process.cwd(), 'public', 'vendor', 'tilda', parsed.hostname, relativePath);

    if (!existsSync(vendorPath)) return url;

    return versionedPublicVendorPath(vendorPath, root) ?? url;
  } catch {
    return url;
  }
}

function inlineVendoredStylesheet(tag: string, root: string) {
  const href = tag.match(/\bhref=["']([^"']+)["']/i)?.[1];
  if (!href || !/tildacdn\.[a-z]+/i.test(href)) return resolveVendorPaths(tag, root);

  try {
    const parsed = new URL(href);
    const relativePath = decodeURIComponent(parsed.pathname).replace(/^\/+/, '');
    const vendorPath = path.join(vendorRoot, parsed.hostname, relativePath);
    if (!existsSync(vendorPath) || !vendorPath.endsWith('.css')) return resolveVendorPaths(tag, root);

    const css = readFileSync(vendorPath, 'utf8').replace(
      /url\(\s*(["']?)([^"')]+)\1\s*\)/gi,
      (whole, _quote, reference) => {
        if (/^(data:|#)/i.test(reference)) return whole;
        if (/^https?:\/\//i.test(reference)) {
          const localized = localVendorUrl(reference, root);
          return localized === reference ? whole : `url("${localized}")`;
        }

        const cleanReference = reference.split(/[?#]/, 1)[0];
        const referencedFile = path.resolve(path.dirname(vendorPath), decodeURIComponent(cleanReference));
        const localized = versionedPublicVendorPath(referencedFile, root);
        return localized ? `url("${localized}")` : whole;
      },
    );

    return `<style data-vendored-css="${relativePath}">${css}</style>`;
  } catch {
    return resolveVendorPaths(tag, root);
  }
}

export function resolveTildaHead(markup: string, root = './') {
  return resolveVendorPaths(
    markup.replace(/<link[^>]*\brel=["']stylesheet["'][^>]*>/gi, tag => inlineVendoredStylesheet(tag, root)),
    root,
  );
}

// vendor-tilda.mjs rewrites tildacdn URLs to "__ROOT__vendor/tilda/...". The token
// is resolved per page because the site is served from the domain root on
// andrewine.ru but from a subdirectory on GitHub Pages.
export function resolveVendorPaths(markup: string, root = './') {
  return markup
    .replaceAll('__ROOT__', normalizeRoot(root))
    .replace(tildaAssetUrl, (url) => localVendorUrl(url, root));
}

export function rewriteLegacyLinks(markup: string, root = './') {
  const localRoot = normalizeRoot(root);
  let result = resolveVendorPaths(markup, root);

  for (const domain of oldDomains) result = result.replaceAll(domain, 'https://andrewine.ru');

  for (const route of routeNames) {
    for (const quote of ['"', "'"]) {
      for (const href of [
        `/${route}`,
        `/${route}/`,
        `https://andrewine.ru/${route}`,
        `https://andrewine.ru/${route}/`,
      ]) {
        result = result.replaceAll(`href=${quote}${href}${quote}`, `href=${quote}${localRoot}${route}/${quote}`);
      }
    }
  }

  for (const quote of ['"', "'"]) {
    for (const href of ['/premium_alcohol', '/premium_alcohol/', 'https://andrewine.ru/premium_alcohol', 'https://andrewine.ru/premium_alcohol/']) {
      result = result.replaceAll(`href=${quote}${href}${quote}`, `href=${quote}${localRoot}articles/${quote}`);
    }
    result = result
      .replaceAll(`href=${quote}https://andrewine.ru/${quote}`, `href=${quote}${localRoot}${quote}`)
      .replaceAll(`href=${quote}#about${quote}`, `href=${quote}${localRoot}#about${quote}`)
      .replaceAll(`href=${quote}#request${quote}`, `href=${quote}${localRoot}#request${quote}`);
  }

  // The old "ЭЛИТНЫЙ АЛКОГОЛЬ" nav item now leads to the journal. It is plain text
  // again: the book drawn into this slot kept being reshaped by Tilda's own rules
  // for the menu item, and those rules cannot be rendered here to check against.
  // Restore the book once the Tilda assets are vendored and the header can be
  // reproduced locally.
  const label = 'СТАТЬИ';

  result = result
    .replaceAll('>ЭЛИТНЫЙ АЛКОГОЛЬ</span>', `>${label}</span>`)
    .replace(/>(\s*)ЭЛИТНЫЙ АЛКОГОЛЬ(\s*)<\/a>/g, `>${label}</a>`);

  return result;
}

function replaceLocalVectorAssets(markup: string) {
  let result = markup
    .replaceAll('https://static.tildacdn.com/tild6164-6333-4835-a466-626266363438/Group_10.png', 'https://selkorin.github.io/andrewine/assets/experience-badge.svg')
    .replaceAll('https://thb.tildacdn.com/tild6164-6333-4835-a466-626266363438/-/resize/20x/Group_10.png', 'https://selkorin.github.io/andrewine/assets/experience-badge.svg');

  for (const lineAsset of [
    'tild6364-3939-4137-b533-386662663831',
    'tild3930-3936-4337-a661-336165396539',
    'tild3237-3363-4836-a331-653463626463',
    'tild3366-3661-4630-b061-613364393634',
  ]) {
    result = result
      .replaceAll(`https://static.tildacdn.com/${lineAsset}/_.png`, 'https://selkorin.github.io/andrewine/assets/section-line.svg')
      .replaceAll(`https://thb.tildacdn.com/${lineAsset}/-/resize/20x/_.png`, 'https://selkorin.github.io/andrewine/assets/section-line.svg');
  }

  return result;
}

export function getOriginalHeader(root = './') {
  const start = source.indexOf('<!--header-->');
  const end = source.indexOf('<!--/header-->', start);
  if (start < 0 || end < 0) throw new Error('Original Tilda header was not found');
  const markup = source.slice(start + '<!--header-->'.length, end);
  return rewriteLegacyLinks(replaceLocalVectorAssets(markup), root);
}

export function getOriginalFooter(root = './') {
  const footerStart = source.indexOf('<footer id="t-footer"');
  const footerOpenEnd = source.indexOf('>', footerStart);
  const recordStart = source.indexOf('<div id="rec2189759551"', footerOpenEnd);
  const footerEnd = source.indexOf('</footer>', recordStart);
  if (footerStart < 0 || footerOpenEnd < 0 || recordStart < 0 || footerEnd < 0) {
    throw new Error('Original Tilda footer was not found');
  }

  const openTag = source.slice(footerStart, footerOpenEnd + 1);
  const footerRecord = source.slice(recordStart, footerEnd);
  return rewriteLegacyLinks(replaceLocalVectorAssets(`${openTag}${footerRecord}</footer>`), root);
}

export function getTildaHeadAssets(root = './') {
  const head = source.match(/<head[^>]*>([\s\S]*?)<\/head>/i)?.[1] ?? '';
  const tags = (head.match(/<link[^>]*\brel="stylesheet"[^>]*>|<script[^>]*\bsrc="[^"]+"[^>]*><\/script>|<script(?![^>]*\bsrc=)[^>]*>[\s\S]*?<\/script>/gi) ?? [])
    .filter(tag => !tag.startsWith('<script') || tag.includes(' src=') || tag.includes('t_onReady'));
  if (!tags.length) throw new Error('Tilda head assets were not found');
  return tags.map(tag => tag.startsWith('<link') ? inlineVendoredStylesheet(tag, root) : resolveVendorPaths(tag, root)).join('\n');
}
