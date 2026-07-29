import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://andrewine.ru',
  output: 'static',
  // 'ignore': dev/preview обслуживают URL и со слешем, и без — как статический
  // хостинг в проде. С 'never' сервер отдавал 404 на все внутренние ссылки
  // сайта (они со слешем), ломая навигацию между разделами.
  trailingSlash: 'ignore',
  compressHTML: false,
});
