import type { APIRoute } from 'astro';
import { getContent } from '../lib/server/content';

export const GET: APIRoute = async ({ site, url }) => {
  const base = (site ?? url).origin;
  const { portfolio } = await getContent();
  const pages = ['/', '/kebijakan-privasi/', ...portfolio.map((p) => `/portofolio/${p.slug}/`)];
  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    pages.map((p) => `  <url><loc>${base}${p}</loc></url>`).join('\n') +
    '\n</urlset>\n';
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
};
