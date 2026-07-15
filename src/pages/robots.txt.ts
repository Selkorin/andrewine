import type { APIRoute } from 'astro';

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(['User-agent: *', 'Allow: /', 'Sitemap: https://andrewine.ru/sitemap.xml', ''].join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
