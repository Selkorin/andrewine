import type { APIRoute } from 'astro';

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(['User-agent: *', 'Allow: /', '', 'User-agent: Yandex', 'Allow: /', 'Clean-param: utm_source&utm_medium&utm_campaign&utm_content&utm_term&yclid&gclid', '', 'Host: andrewine.ru', 'Sitemap: https://andrewine.ru/sitemap.xml', ''].join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
