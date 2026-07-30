#!/usr/bin/env node
// Аудит вёрстки: переполнения, выравнивание, битые ссылки, h1, JS-ошибки.
// Запуск: node .claude/skills/ui-audit/scripts/check-layout.mjs [--widths=..] [--routes=..]
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'dist');
const PORT = 4771;
const CHROMIUM = '/opt/pw-browsers/chromium';

if (!fs.existsSync(DIST)) {
  console.error('Нет dist/. Сначала: npm run build');
  process.exit(1);
}

const arg = (name, fallback) => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
};
const widths = arg('widths', '1440,1024,768,390').split(',').map(Number);

function discoverRoutes() {
  const custom = arg('routes', '');
  if (custom) return custom.split(',');
  const routes = ['/articles/', '/premium_alcohol/'];
  const articlesDir = path.join(DIST, 'articles');
  if (fs.existsSync(articlesDir)) {
    for (const entry of fs.readdirSync(articlesDir, { withFileTypes: true })) {
      if (entry.isDirectory()) routes.push(`/articles/${entry.name}/`);
    }
  }
  if (fs.existsSync(path.join(DIST, '404.html'))) routes.push('/404.html');
  return routes;
}

const server = spawn('python3', ['-m', 'http.server', String(PORT)], {
  cwd: DIST, stdio: 'ignore', detached: true,
});
const stop = () => { try { process.kill(-server.pid); } catch {} };
process.on('exit', stop);
process.on('SIGINT', () => { stop(); process.exit(1); });

await new Promise((r) => setTimeout(r, 2500));

const { chromium } = await import('playwright-core');
const browser = await chromium.launch({ executablePath: CHROMIUM });
const routes = discoverRoutes();
const problems = [];

for (const width of widths) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 } });
  // Внешние хосты недоступны в песочнице: без abort страница висит минутами.
  await ctx.route('**/*', (route) =>
    new URL(route.request().url()).hostname === 'localhost' ? route.continue() : route.abort());
  const page = await ctx.newPage();
  page.on('pageerror', (e) => problems.push(`JS@${width}: ${e.message.slice(0, 70)}`));

  for (const route of routes) {
    await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: 'domcontentloaded' });
    // Оригинальные Tilda-записи локально не стилизуются (CDN закрыт) — прячем,
    // чтобы их разъезд не давал ложных срабатываний.
    await page.addStyleTag({ content: '[id^="rec"],#t-footer{display:none!important}' });
    await page.waitForTimeout(110);

    const res = await page.evaluate(() => {
      const main = document.querySelector('.article-main, .not-found');
      if (!main) return { skip: true };
      const vw = window.innerWidth;
      const over = [];
      for (const el of main.querySelectorAll('*')) {
        const b = el.getBoundingClientRect();
        if (b.width > 0 && (b.right > vw + 2 || b.left < -2)) {
          over.push(`${(el.className || '').toString().split(' ')[0] || el.tagName}`);
        }
      }
      const lefts = [...main.children]
        .filter((el) => el.getBoundingClientRect().width > 0)
        .map((el) => Math.round(el.getBoundingClientRect().left));
      return {
        over: [...new Set(over)].slice(0, 3),
        lefts: [...new Set(lefts)].sort((a, b) => a - b),
        h1: document.querySelectorAll('h1').length,
        links: [...document.querySelectorAll('main a[href]')].map((a) => a.href),
      };
    });
    if (res.skip) continue;

    if (res.over.length) problems.push(`${route}@${width}: вылезает ${res.over.join(', ')}`);
    if (res.h1 !== 1) problems.push(`${route}@${width}: h1=${res.h1} (должен быть 1)`);

    if (width === widths[0]) {
      for (const link of res.links) {
        const u = new URL(link);
        if (u.hostname !== 'localhost') continue;
        const target = path.join(DIST, u.pathname.replace(/\/$/, ''), 'index.html');
        const asFile = path.join(DIST, u.pathname.replace(/^\//, ''));
        if (!fs.existsSync(target) && !fs.existsSync(asFile)) {
          problems.push(`битая ссылка ${u.pathname} ← ${route}`);
        }
      }
    }
  }
  await ctx.close();
}

await browser.close();
stop();

console.log(`Проверено: ${routes.length} страниц × ${widths.length} ширин (${widths.join(', ')})`);
if (problems.length) {
  console.log([...new Set(problems)].join('\n'));
  process.exit(1);
}
console.log('✓ ЧИСТО: переполнений, битых ссылок, дублей h1 и JS-ошибок нет');
