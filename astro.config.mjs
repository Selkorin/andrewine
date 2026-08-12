import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://andrewine.ru',
  output: 'static',
  trailingSlash: 'never',
  compressHTML: false,
  build: {
    // Extracted stylesheets are linked as "/_astro/...", an absolute path from the
    // domain root. That resolves on andrewine.ru but 404s on GitHub Pages, where
    // the site is served from /andrewine/ — leaving pages completely unstyled.
    // Inline them instead, which is how the rest of the site already ships CSS.
    inlineStylesheets: 'always',
  },
});
