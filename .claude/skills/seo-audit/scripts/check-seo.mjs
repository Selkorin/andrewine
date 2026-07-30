#!/usr/bin/env node
// Аудит SEO/ГЕО по собранному dist/ и данным статей.
// Запуск: node .claude/skills/seo-audit/scripts/check-seo.mjs
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'dist');
if (!fs.existsSync(DIST)) {
  console.error('Нет dist/. Сначала: npm run build');
  process.exit(1);
}

const problems = [];
const warnings = [];
const note = (m) => problems.push(m);

/* ---------- 1. Мета-теги: уникальность, длины, каннибализация ---------- */
const htmlFiles = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.html')) htmlFiles.push(p);
  }
})(DIST);

const titles = new Map();
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  const route = '/' + path.relative(DIST, file).replace(/index\.html$/, '');
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '';
  const desc = html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '';

  // Легаси-страницы (/ и /buy_*) несут мета-теги владельца из Tilda-экспорта:
  // их длину только показываем, менять текст без запроса нельзя.
  const legacy = route === '/' || /^\/buy_/.test(route);
  const warn = (m) => (legacy ? warnings.push(m) : note(m));

  if (!title) note(`${route}: нет title`);
  else {
    if (title.length > 65) warn(`${route}: title ${title.length} знаков (>65)`);
    const prev = titles.get(title);
    if (prev) note(`ДУБЛЬ title: «${title.slice(0, 45)}…» на ${prev} и ${route}`);
    else titles.set(title, route);
  }
  if (!desc) warn(`${route}: нет description`);
  else if (desc.length < 120 || desc.length > 175) warn(`${route}: description ${desc.length} знаков (нужно 120–175)`);

  // Битый JSON-LD
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(m[1]); } catch { note(`${route}: битый JSON-LD`); }
  }
  if (/[Аа]лковыкуп/.test(html)) note(`${route}: остался старый бренд «Алковыкуп»`);
  if (html.includes('t-tildalabel')) note(`${route}: плашка Тильды`);
}

// Каннибализация: раздел журнала не должен уходить в транзакционный интент,
// который держит парная страница выкупа.
for (const [title, route] of titles) {
  if (/^\/articles\/[a-z]+\/$/.test(route) && /^(Продать|Скупка|Выкуп)/i.test(title)) {
    note(`КАННИБАЛИЗАЦИЯ: раздел ${route} взял транзакционный заголовок «${title.slice(0, 40)}…» — это интент buy_*`);
  }
}

/* ---------- 2. Контент статей: шаблон, гео, запреты ---------- */
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'seo-'));
try {
  execFileSync('npx', ['esbuild', 'src/data/articles.ts', '--bundle', '--format=esm',
    `--outfile=${path.join(tmp, 'a.mjs')}`, '--log-level=error'], { cwd: ROOT, stdio: 'pipe' });
} catch {
  note('не удалось собрать src/data/articles.ts для проверки контента');
}

if (fs.existsSync(path.join(tmp, 'a.mjs'))) {
  const { articles } = await import(path.join(tmp, 'a.mjs'));
  const wc = (s) => s.trim().split(/\s+/).length;
  const seen = { slug: new Map(), title: new Map(), image: new Map() };

  for (const a of articles) {
    const id = a.slug;
    for (const key of ['slug', 'title', 'image']) {
      const v = a[key];
      if (seen[key].has(v)) note(`дубль ${key}: ${id} и ${seen[key].get(v)}`);
      else seen[key].set(v, id);
    }
    if (a.sections?.length !== 3) note(`${id}: секций ${a.sections?.length}, нужно 3`);
    a.sections?.forEach((s, i) => {
      if (s.paragraphs.length !== 2) note(`${id}: секция ${i + 1} — ${s.paragraphs.length} абзаца`);
      s.paragraphs.forEach((p, j) => {
        const n = wc(p);
        if (n < 35 || n > 55) note(`${id}: с${i + 1}а${j + 1} — ${n} слов (нужно 35–55)`);
      });
    });
    if (a.checklist?.length !== 4) note(`${id}: чек-лист ${a.checklist?.length}, нужно 4`);
    if (a.faq?.length !== 3) note(`${id}: FAQ ${a.faq?.length}, нужно 3`);
    a.faq?.forEach(([, ans], i) => {
      const n = wc(ans);
      if (n < 25 || n > 45) note(`${id}: ответ FAQ ${i + 1} — ${n} слов (нужно 25–45)`);
    });

    const meta = [a.note, a.description, ...(a.faq ?? []).flat()].join(' ');
    if (!/Москв|Росси/iu.test(meta)) note(`${id}: нет упоминания Москвы или России`);

    // ВАЖНО: \w в JS не покрывает кириллицу — только явные диапазоны.
    const body = [a.intro, ...(a.sections ?? []).flatMap((s) => s.paragraphs), a.note,
      ...(a.faq ?? []).flat()].join(' ');
    if (/\d[\d\s]*(руб|₽|тысяч|миллион|%)/iu.test(body)) note(`${id}: конкретная цена в тексте`);
    if (/мы (купим|выкупим)|гарантируем/iu.test(body)) note(`${id}: обещание выкупа`);
    if (/в 20\d\d году|в этом году|сегодня/iu.test(body)) note(`${id}: привязка к дате`);
  }

  const withToken = articles.filter((a) =>
    /элитн[а-яё]* алкогол/iu.test([a.intro, ...(a.sections ?? []).flatMap((s) => s.paragraphs), a.note].join(' ')));
  console.log(`Статей: ${articles.length} · с фразой «элитный алкоголь» в теле: ${withToken.length}`);
  if (withToken.length === 0) note('НИ ОДНА статья не содержит целевую фразу «элитный алкоголь»');
}
fs.rmSync(tmp, { recursive: true, force: true });

/* ---------- 3. Инфраструктура ---------- */
for (const f of ['sitemap.xml', 'robots.txt', 'llms.txt']) {
  if (!fs.existsSync(path.join(DIST, f))) note(`нет ${f}`);
}
const sitemap = fs.existsSync(path.join(DIST, 'sitemap.xml'))
  ? fs.readFileSync(path.join(DIST, 'sitemap.xml'), 'utf8') : '';
for (const m of sitemap.matchAll(/<loc>https:\/\/andrewine\.ru([^<]*)<\/loc>/g)) {
  const route = m[1] || '/';
  const file = route === '/' ? path.join(DIST, 'index.html')
    : path.join(DIST, route.replace(/^\/|\/$/g, ''), 'index.html');
  if (!fs.existsSync(file)) note(`${route}: есть в sitemap, но страницы нет`);
}

console.log(`Страниц: ${htmlFiles.length} · уникальных title: ${titles.size}`);
if (warnings.length) {
  console.log('\nПредупреждения по легаси-страницам (мета владельца, менять по запросу):');
  console.log([...new Set(warnings)].map((w) => '  · ' + w).join('\n'));
}
if (problems.length) {
  console.log('\n' + [...new Set(problems)].join('\n'));
  process.exit(1);
}
console.log('✓ ЧИСТО: мета, разметка, шаблон статей, гео и запреты — без нарушений');
