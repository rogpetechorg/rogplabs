import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const base = site ?? new URL('https://rogplabs.rogpe.tech');
  return new Response(`User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${new URL('/sitemap.xml', base)}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
