import fs from 'node:fs';
import path from 'node:path';

const root = path.join(process.cwd(), 'dist');
const states = fs.readdirSync('src/data/states').filter((f) => f.endsWith('.json')).map((f) => JSON.parse(fs.readFileSync(`src/data/states/${f}`, 'utf8')));
const pages = ['/', '/about/', '/privacy/', ...states.map((state) => `/${state.slug}/`)];
const errors = [];
const assert = (condition, message) => { if (!condition) errors.push(message); };
for (const route of pages) {
  const file = path.join(root, route, 'index.html');
  assert(fs.existsSync(file), `${route}: missing HTML`);
  if (!fs.existsSync(file)) continue;
  const html = fs.readFileSync(file, 'utf8');
  assert((html.match(/<h1(?:\s|>)/g) || []).length === 1, `${route}: must have exactly one h1`);
  assert(html.includes(`href="https://fieldseasonhq.com${route}"`), `${route}: missing canonical`);
  assert(html.includes('property="og:title"') && html.includes('property="og:description"') && html.includes('property="og:url"'), `${route}: missing Open Graph metadata`);
  assert(html.includes('Last verified:') || html.includes('Last updated:'), `${route}: missing verification date`);
  assert(html.includes('As an Amazon Associate I earn from qualifying purchases.'), `${route}: missing disclosure`);
  assert(!html.includes('FAQPage'), `${route}: FAQ schema must not be used`);
  assert(!/<script[^>]+src=/.test(html), `${route}: unexpected client-side script`);
  for (const match of html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>/g)) {
    const [tag, href] = match;
    if (href.startsWith('https://www.amazon.com/')) {
      assert(/rel="sponsored nofollow noopener"/.test(tag), `${route}: affiliate link missing rel values`);
      assert(href.includes('?tag=fieldseasonhq-20') || href.includes('&tag=fieldseasonhq-20'), `${route}: affiliate tag missing`);
    }
    if (href.startsWith('/') && !href.startsWith('//')) {
      const target = href.split('#')[0];
      assert(fs.existsSync(path.join(root, target, target.endsWith('/') ? 'index.html' : '')), `${route}: broken internal link ${href}`);
    }
  }
  const state = states.find((item) => route === `/${item.slug}/`);
  if (state) {
    assert(html.includes('BreadcrumbList'), `${route}: missing breadcrumbs schema`);
    assert(html.includes('WebPage'), `${route}: missing WebPage schema`);
    assert(html.includes('id="education"'), `${route}: missing education section`);
    for (const fact of [...state.seasonFacts, ...state.licenseAndEducation, ...state.deadlines]) {
      assert(html.includes(fact.sourceUrl.replaceAll('&', '&amp;')) || html.includes(fact.sourceUrl), `${route}: source not rendered: ${fact.sourceUrl}`);
    }
  }
}
const sitemap = fs.existsSync(path.join(root, 'sitemap.xml')) ? fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8') : '';
for (const route of pages) assert(sitemap.includes(`<loc>https://fieldseasonhq.com${route}</loc>`), `sitemap.xml: missing ${route}`);
const robots = fs.existsSync(path.join(root, 'robots.txt')) ? fs.readFileSync(path.join(root, 'robots.txt'), 'utf8') : '';
assert(robots.includes('Sitemap: https://fieldseasonhq.com/sitemap.xml'), 'robots.txt: wrong/missing sitemap URL');
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`Production HTML audit passed: ${pages.length} pages; metadata, citations, links, disclosures, sitemap and robots verified.`);
