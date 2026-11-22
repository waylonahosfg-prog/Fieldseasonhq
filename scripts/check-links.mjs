import fs from 'node:fs';
import path from 'node:path';

const stateDir = path.join(process.cwd(), 'src/data/states');
const files = fs.readdirSync(stateDir).filter((f) => f.endsWith('.json'));
const urlMap = new Map();

const track = (url, ref) => {
  if (!url) return;
  if (!urlMap.has(url)) urlMap.set(url, []);
  urlMap.get(url).push(ref);
};

for (const file of files) {
  const data = JSON.parse(fs.readFileSync(path.join(stateDir, file), 'utf8'));
  track(data.agency?.url, `${file} (agency)`);
  for (const [i, f] of (data.seasonFacts || []).entries()) track(f.sourceUrl, `${file} seasonFacts[${i}]`);
  for (const [i, f] of (data.licenseAndEducation || []).entries()) track(f.sourceUrl, `${file} licenseAndEducation[${i}]`);
  for (const [i, d] of (data.deadlines || []).entries()) track(d.sourceUrl, `${file} deadlines[${i}]`);
  for (const [i, s] of (data.sources || []).entries()) track(s.url, `${file} sources[${i}]`);
}

const urls = [...urlMap.keys()];
console.log(`Checking ${urls.length} unique official agency URLs across ${files.length} states...`);

const failures = [];
const warnings = [];

async function checkUrl(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    let res = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'User-Agent': 'FieldSeasonHQ-LinkAudit/1.0 (+https://fieldseasonhq.com/about/)' }
    });
    if (res.status === 405 || res.status === 403 || res.status === 400) {
      res = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal,
        headers: { 'User-Agent': 'FieldSeasonHQ-LinkAudit/1.0 (+https://fieldseasonhq.com/about/)' }
      });
    }
    if (res.status === 404 || res.status === 410 || res.status >= 500) {
      failures.push(`HTTP ${res.status} -> ${url} (used in: ${urlMap.get(url).slice(0, 3).join(', ')})`);
    } else if (!res.ok) {
      warnings.push(`HTTP ${res.status} (bot-shielded or redirect check) -> ${url}`);
    }
  } catch (err) {
    warnings.push(`Network/Timeout (${err.name}) -> ${url}`);
  } finally {
    clearTimeout(timer);
  }
}

for (let i = 0; i < urls.length; i += 6) {
  await Promise.all(urls.slice(i, i + 6).map(checkUrl));
}

if (warnings.length) {
  console.warn(`Warnings (${warnings.length}):\n` + warnings.join('\n'));
}
if (failures.length) {
  console.error(`Broken agency links detected (${failures.length}):\n` + failures.join('\n'));
  process.exit(1);
}
console.log(`Link audit passed: 0 hard 404/500 errors across ${urls.length} official URLs.`);
