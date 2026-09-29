import type { APIRoute } from 'astro';
import { articles } from '../data/articles';
import { landingRoutes, siteUrl } from '../data/seo';
import { brandLandings } from '../data/brandLandings';

export const prerender = true;

const routes = [...landingRoutes, ...brandLandings.map(({ slug }) => `/${slug}/`), '/articles/', ...articles.map(({ slug }) => `/articles/${slug}/`)];

export const GET: APIRoute = () => {
  const urls = routes.map((route) => `<url><loc>${new URL(route, siteUrl).href}</loc><changefreq>${route.startsWith('/articles/') ? 'monthly' : 'weekly'}</changefreq><priority>${route === '/' ? '1.0' : route === '/articles/' ? '0.8' : '0.9'}</priority></url>`).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
