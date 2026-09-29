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
  if (!/<meta[^>]+name=["']description["'][^>]+content=["'][^"']{50,}["']/i.test(html)) errors.push(`${route}: нет полноценного description`);
  if (!/<link[^>]+rel=["']canonical["'][^>]*>/i.test(html)) errors.push(`${route}: нет canonical`);
  const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1];
  if (route !== '/' && canonical && !canonical.endsWith('/')) errors.push(`${route}: canonical должен оканчиваться слешем`);
  if (!/<h1(?:\s|>)/i.test(html)) errors.push(`${route}: нет H1`);
  if ((html.match(/<h1(?:\s|>)/gi) ?? []).length !== 1) errors.push(`${route}: должен быть ровно один H1`);
  if (/createElement\(['"]h1['"]\)/i.test(html)) errors.push(`${route}: скрипт создаёт скрытый дополнительный H1`);
  if (html.includes('</script></script>') || html.includes('</script></style>')) {
    errors.push(`${route}: остались повреждённые закрывающие теги`);
  }
  if (!html.includes('.t-records{opacity:1!important}')) errors.push(`${route}: нет защиты видимости Tilda-блоков`);
  if (!/<style data-vendored-css="css\/tilda-grid-3\.0\.min\.css">/.test(html)) {
    errors.push(`${route}: базовые стили Tilda не встроены в HTML`);
  }
  if (!/<style data-vendored-css="ws\/project22260796\/tilda-blocks-page\d+\.min\.css">/.test(html)) {
    errors.push(`${route}: стили страницы Tilda не встроены в HTML`);
  }
  if (/href=["']https:\/\/static(?:3)?\.tildacdn\.com\/ws\/project22260796\/tilda-blocks-page/.test(html)) {
    errors.push(`${route}: стили страницы всё ещё зависят от Tilda CDN`);
  }
  if (/vendor\/tilda|site-assets\/(?:[^snt/]|s(?:tatic)?\.tildacdn)/i.test(html)) {
    errors.push(`${route}: публичный URL ресурса может быть заблокирован расширением браузера`);
  }
}

for (const asset of ['robots.txt', 'sitemap.xml']) {
  try {
    await access(path.join(root, asset));
  } catch {
    errors.push(`нет ${asset}`);
  }
}

const sitemap = await readFile(path.join(root, 'sitemap.xml'), 'utf8').catch(() => '');
if ((sitemap.match(/<url>/g) ?? []).length !== 24) errors.push('sitemap должен содержать 24 индексируемые страницы (без 404)');
if (!sitemap.includes('/articles/')) errors.push('в sitemap отсутствуют статьи');
for (const slug of ['sell-macallan', 'sell-hennessy', 'sell-louis-xiii', 'sell-dom-perignon']) {
  const html = await readFile(path.join(root, slug, 'index.html'), 'utf8').catch(() => '');
  if (!html) errors.push(`/${slug}/: нет брендовой посадочной страницы`);
  if ((html.match(/<h1(?:\s|>)/gi) ?? []).length !== 1) errors.push(`/${slug}/: должен быть ровно один H1`);
  if (!html.includes('FAQPage') || !html.includes('schema.org')) errors.push(`/${slug}/: отсутствуют структурированные данные`);
  if (!sitemap.includes(`/${slug}/`)) errors.push(`/${slug}/: адрес отсутствует в sitemap`);
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

// Pages under preview/ are work-in-progress views of the rewritten chrome and
// deliberately carry neither the Tilda header nor its footer.
const isPreview = (file) => path.relative(root, file).startsWith('preview-');

const isVerificationFile = (file) => /^(?:yandex_[a-f0-9]+|google[a-f0-9]+)\.html$/i.test(path.basename(file));
const htmlFiles = (await collectHtml(root)).filter((file) => !isPreview(file) && !isVerificationFile(file));
for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  const route = path.relative(root, file);
  if ((html.match(/113109306/g) ?? []).length < 2) errors.push(`${route}: не установлен счётчик Яндекс Метрики`);
  if ((html.match(/tag\.js\?id=113109306/g) ?? []).length !== 1) errors.push(`${route}: счётчик Яндекс Метрики должен подключаться ровно один раз`);
  if (!html.includes('webvisor:true') || !html.includes('clickmap:true')) errors.push(`${route}: не включены Вебвизор или карта кликов`);
  if (!html.includes('class="site-header"')) {
    errors.push(`${route}: отсутствует шапка сайта`);
  }
  // Only the markup matters — the id also appears in the page's inline CSS.
  if (html.includes('<div id="rec2189620761"')) {
    errors.push(`${route}: осталась старая Tilda-шапка`);
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

if (htmlFiles.length !== 25) errors.push(`ожидалось 25 HTML-страниц, собрано ${htmlFiles.length}`);

if (errors.length) {
  console.error(`Проверка не пройдена:\n- ${errors.join('\n- ')}`);
  process.exit(1);
}

console.log(`Проверено ${htmlFiles.length} страниц: оригинальные header/footer и внутренние ссылки корректны.`);
