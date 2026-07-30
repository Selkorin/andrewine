import type { APIRoute } from 'astro';
import { articles } from '../data/articles';
import { categories } from '../data/categories';
import { organization } from '../data/organization';

export const prerender = true;

// llms.txt — складывающаяся конвенция: краткая карта сайта для языковых
// моделей и ИИ-краулеров, где сразу видно, кто мы и где лежат ответы.
// Обычной поисковой выдаче не мешает, к robots.txt отношения не имеет.
export const GET: APIRoute = () => {
  const lines: string[] = [];
  lines.push('# Andrewine');
  lines.push('');
  lines.push('> Оценка и выкуп элитного и коллекционного алкоголя: вино, шампанское, виски, коньяк, портвейн, ром, водка, бренди. Предварительная оценка по фотографиям бесплатна, итоговая цена — после очного осмотра. Очный осмотр в Москве, работаем с регионами России.');
  lines.push('');
  lines.push('## Что важно знать');
  lines.push('');
  lines.push('- Компания: Andrewine, andrewine.ru');
  lines.push(`- Контакты: ${organization.telephone}, ${organization.email}, Telegram ${organization.telegram}`);
  lines.push('- География: очный осмотр — Москва; предварительная оценка по фотографиям — вся Россия');
  lines.push('- Оценка по фотографиям бесплатна и ни к чему не обязывает');
  lines.push('- Точная цена по фотографиям не называется: определяется диапазон, итог — после осмотра');
  lines.push('- Принимаются как отдельные бутылки, так и коллекции целиком');
  lines.push('');
  lines.push('## Разделы');
  lines.push('');
  lines.push('- [Скупка элитного алкоголя](https://andrewine.ru/premium_alcohol/): головная страница услуги — категории, критерии цены, порядок сделки');
  lines.push('- [Журнал](https://andrewine.ru/articles/): база знаний по оценке и продаже, разбита по категориям напитков');
  for (const category of categories) {
    lines.push(`- [${category.label}](https://andrewine.ru/articles/${category.slug}/): ${category.seoDescription}`);
  }
  lines.push('');
  lines.push('## Страницы выкупа по категориям');
  lines.push('');
  for (const category of categories) {
    lines.push(`- [${category.buyLabel}](https://andrewine.ru/${category.buyRoute}/)`);
  }
  lines.push('');
  lines.push('## Материалы');
  lines.push('');
  for (const article of articles) {
    lines.push(`- [${article.title}](https://andrewine.ru/articles/${article.slug}/): ${article.description}`);
  }
  lines.push('');

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
