import type { APIRoute } from 'astro';
import { slugifySpecies } from '../utils/formatters';

export const prerender = true;
export const GET: APIRoute = () => {
  const files = import.meta.glob('../data/states/*.json', { eager: true, import: 'default' });
  const states = Object.values(files) as Array<{ slug: string; verifiedOn: string; seasonFacts?: Array<{ species: string }> }>;
  const latest = states.map((state) => state.verifiedOn).sort().at(-1) || '2026-11-03';
  const speciesPages = states.flatMap((state) => {
    const uniqueSpecies = [...new Set((state.seasonFacts || []).map((f) => f.species))];
    return uniqueSpecies.map((sp) => ({
      path: `/${state.slug}/${slugifySpecies(sp)}/`,
      date: state.verifiedOn
    }));
  });
  const pages = [
    { path: '/', date: latest },
    { path: '/about/', date: latest },
    { path: '/privacy/', date: latest },
    ...states.map((state) => ({ path: `/${state.slug}/`, date: state.verifiedOn })),
    ...speciesPages
  ];
  const urls = pages.map((page) => `<url><loc>https://fieldseasonhq.com${page.path}</loc><lastmod>${page.date}</lastmod></url>`).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
