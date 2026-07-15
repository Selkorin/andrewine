import { readFileSync } from 'node:fs';
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

export function rewriteLegacyLinks(markup: string, root = './') {
  const localRoot = normalizeRoot(root);
  let result = markup;

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
      result = result.replaceAll(`href=${quote}${href}${quote}`, `href=${quote}${localRoot}${quote}`);
    }
    result = result
      .replaceAll(`href=${quote}https://andrewine.ru/${quote}`, `href=${quote}${localRoot}${quote}`)
      .replaceAll(`href=${quote}#about${quote}`, `href=${quote}${localRoot}#about${quote}`)
      .replaceAll(`href=${quote}#request${quote}`, `href=${quote}${localRoot}#request${quote}`);
  }

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

export function getTildaBootstrap() {
  const head = source.match(/<head[^>]*>([\s\S]*?)<\/head>/i)?.[1] ?? '';
  const inlineScript = head.match(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/i)?.[1];
  if (!inlineScript) throw new Error('Tilda bootstrap script was not found');
  return inlineScript;
}
