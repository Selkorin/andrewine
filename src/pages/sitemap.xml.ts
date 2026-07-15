import type { APIRoute } from 'astro';

export const prerender = true;

const routes = [
  '/',
  '/buy_champagne',
  '/buy_whisky',
  '/buy_cognac',
  '/buy_portwine',
  '/buy_rum',
  '/buy_vodka',
  '/buy_brandy',
  '/buy_wine',
];

export const GET: APIRoute = () => {
  const urls = routes.map((route) => `<url><loc>https://andrewine.ru${route}</loc></url>`).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
