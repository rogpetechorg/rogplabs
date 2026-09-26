import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async ({ site }) => {
  const base = site ?? new URL('https://rogplabs.rogpe.tech');
  const radar = await getCollection('radar');
  const records = await getCollection('registro', ({ data }) => !data.draft);
  const staticPaths = ['/', '/radar/', '/registro/', '/projetos/', '/contato/', '/privacidade/', '/termos/'];
  const entries = [
    ...staticPaths.map((path) => ({ path })),
    ...radar.map((item) => ({ path: `/radar/${item.id}/`, modified: item.data.updatedAt })),
    ...records.map((item) => ({ path: `/registro/${item.id}/`, modified: item.data.publishedAt })),
  ];
  const urls = entries.map(({ path, modified }) => `<url><loc>${new URL(path, base)}</loc>${modified ? `<lastmod>${modified.toISOString().slice(0, 10)}</lastmod>` : ''}</url>`).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
