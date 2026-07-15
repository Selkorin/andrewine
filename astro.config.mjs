import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://andrewine.ru',
  output: 'static',
  trailingSlash: 'never',
  compressHTML: false,
});
