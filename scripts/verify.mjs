import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('dist');
const routes = ['/', '/buy_champagne', '/buy_whisky', '/buy_cognac', '/buy_portwine', '/buy_rum', '/buy_vodka', '/buy_brandy', '/buy_wine'];
const errors = [];

for (const route of routes) {
  const file = route === '/' ? path.join(root, 'index.html') : path.join(root, route.slice(1), 'index.html');
  let html = '';
  try {
    html = await readFile(file, 'utf8');
  } catch {
    errors.push(`${route}: нет HTML`);
    continue;
  }
  if (!html.includes('t-records')) errors.push(`${route}: потеряна исходная Tilda-разметка`);
  if (!html.includes('https://andrewine.ru')) errors.push(`${route}: не заменён домен`);
  if (html.includes('xn--80aexbctj5a4e.xn--p1ai') || html.includes('https://алковыкуп.рф')) {
    errors.push(`${route}: остался старый домен`);
  }
  if (!/<title>[^<]+<\/title>/.test(html)) errors.push(`${route}: нет title`);
  if (!/<h1(?:\s|>)/i.test(html)) errors.push(`${route}: нет H1`);
  if (html.includes('</script></script>') || html.includes('</script></style>')) {
    errors.push(`${route}: остались повреждённые закрывающие теги`);
  }
  if (!html.includes('.t-records{opacity:1!important}')) errors.push(`${route}: нет защиты видимости Tilda-блоков`);
}

for (const asset of ['robots.txt', 'sitemap.xml']) {
  try {
    await access(path.join(root, asset));
  } catch {
    errors.push(`нет ${asset}`);
  }
}

async function collectHtml(directory) {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await collectHtml(target));
    if (entry.isFile() && entry.name.endsWith('.html')) result.push(target);
  }
  return result;
}

const htmlFiles = await collectHtml(root);
for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  const route = path.relative(root, file);
  if (!/<header[^>]+id=["']t-header["']/i.test(html) || !html.includes('rec2189620761')) {
    errors.push(`${route}: отсутствует оригинальная Tilda-шапка`);
  }
  if (!/<footer[^>]+id=["']t-footer["']/i.test(html) || !html.includes('rec2189759551')) {
    errors.push(`${route}: отсутствует оригинальный Tilda-футер`);
  }
  if (html.includes('article-site-header') || html.includes('article-site-footer')) {
    errors.push(`${route}: найдена самодельная копия header/footer`);
  }
  for (const legacyRoute of ['buy_wine', 'buy_champagne', 'buy_whisky', 'buy_cognac', 'buy_portwine', 'buy_rum', 'buy_vodka', 'buy_brandy']) {
    if (html.includes(`href="/${legacyRoute}`) || html.includes(`href='/${legacyRoute}`)) {
      errors.push(`${route}: абсолютная ссылка /${legacyRoute} сломает GitHub Pages`);
    }
  }
}

for (const articleFile of htmlFiles.filter(file => file.includes(`${path.sep}articles${path.sep}`))) {
  const html = await readFile(articleFile, 'utf8');
  const route = path.relative(root, articleFile);
  if (!html.includes('family=Playfair+Display') || !html.includes('family=Manrope')) {
    errors.push(`${route}: не подключена оригинальная типографика`);
  }
  if (!html.includes('tilda-zero-1.1.min.js') || !html.includes('tilda-menu-1.0.min.js')) {
    errors.push(`${route}: не подключено адаптивное поведение оригинальной шапки`);
  }
}

if (htmlFiles.length !== 17) errors.push(`ожидалось 17 HTML-страниц, собрано ${htmlFiles.length}`);

if (errors.length) {
  console.error(`Проверка не пройдена:\n- ${errors.join('\n- ')}`);
  process.exit(1);
}

console.log(`Проверено ${htmlFiles.length} страниц: оригинальные header/footer и внутренние ссылки корректны.`);
