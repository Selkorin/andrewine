import { access, readFile } from 'node:fs/promises';
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

if (errors.length) {
  console.error(`Проверка не пройдена:\n- ${errors.join('\n- ')}`);
  process.exit(1);
}

console.log(`Исходный дизайн и контент сохранены: ${routes.length} страниц.`);
