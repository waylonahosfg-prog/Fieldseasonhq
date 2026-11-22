import fs from 'node:fs';

const HOST = 'fieldseasonhq.com';
const KEY = '8f4e2a91c7b34d609e51f8a2c4d7b903';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const SITEMAP_PATH = 'dist/sitemap.xml';

if (!fs.existsSync(SITEMAP_PATH)) {
  console.error('dist/sitemap.xml not found. Run npm run build first.');
  process.exit(1);
}

const xml = fs.readFileSync(SITEMAP_PATH, 'utf8');
const urlList = [...xml.matchAll(/<loc>(https:\/\/[^<]+)<\/loc>/g)].map((m) => m[1]);

if (!urlList.length) {
  console.log('No URLs found in sitemap.xml.');
  process.exit(0);
}

const payload = {
  host: HOST,
  key: KEY,
  keyLocation: KEY_LOCATION,
  urlList
};

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify(payload)
});

if (res.ok || res.status === 202) {
  console.log(`IndexNow accepted ${urlList.length} URLs (HTTP ${res.status}).`);
} else {
  const body = await res.text();
  console.error(`IndexNow failed (HTTP ${res.status}): ${body}`);
  process.exit(1);
}
