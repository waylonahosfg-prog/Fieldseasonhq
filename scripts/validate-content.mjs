import fs from 'node:fs';
import path from 'node:path';

const stateDir = path.join(process.cwd(), 'src/data/states');
const files = fs.readdirSync(stateDir).filter((file) => file.endsWith('.json'));
const errors = [];
const assert = (cond, msg) => { if (!cond) errors.push(msg); };
const validDate = (value) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
const validHttpUrl = (value) => {
  try { const u = new URL(value); return u.protocol === 'https:' || u.protocol === 'http:'; } catch { return false; }
};
const validAmazonUrl = (value) => {
  try {
    const u = new URL(value);
    const isAmazon = u.protocol === 'https:' && u.hostname === 'www.amazon.com';
    const hasTag = u.searchParams.get('tag') === 'fieldseasonhq-20';
    const isDp = /^\/dp\/[A-Z0-9]{10}$/.test(u.pathname);
    const isSearch = u.pathname === '/s' && Boolean(u.searchParams.get('k'));
    return isAmazon && hasTag && (isDp || isSearch);
  } catch {
    return false;
  }
};

assert(files.length >= 5, `Expected at least 5 state JSON files, found ${files.length}`);

const seenIntros = new Set();
const seenMeta = new Set();

for (const file of files) {
  const data = JSON.parse(fs.readFileSync(path.join(stateDir, file), 'utf8'));
  const prefix = `${file}:`;
  for (const key of ['slug', 'name', 'year', 'metaDescription', 'intro', 'verifiedOn']) {
    assert(typeof data[key] === 'string' && data[key].trim().length > 0, `${prefix} missing ${key}`);
  }
  assert(!seenIntros.has(data.intro.trim()), `${prefix} duplicate intro detected (anti-scaled-content check)`);
  assert(!seenMeta.has(data.metaDescription.trim()), `${prefix} duplicate metaDescription detected`);
  seenIntros.add(data.intro.trim());
  seenMeta.add(data.metaDescription.trim());

  assert(validDate(data.verifiedOn), `${prefix} invalid verifiedOn`);
  assert(`${data.name} Hunting Season Dates 2026 | Field Season HQ`.length <= 60, `${prefix} title exceeds 60 characters`);
  assert(data.metaDescription.length >= 110 && data.metaDescription.length <= 165, `${prefix} metaDescription length (${data.metaDescription.length}) outside 110..165`);
  assert(data.agency && typeof data.agency.name === 'string' && validHttpUrl(data.agency.url), `${prefix} invalid agency`);
  assert(Array.isArray(data.seasonFacts) && data.seasonFacts.length >= 8, `${prefix} expected >=8 seasonFacts`);
  assert(Array.isArray(data.licenseAndEducation) && data.licenseAndEducation.length >= 3, `${prefix} expected >=3 licenseAndEducation`);
  assert(Array.isArray(data.deadlines) && data.deadlines.length >= 2, `${prefix} expected >=2 deadlines`);
  assert(Array.isArray(data.sources) && data.sources.length >= 3, `${prefix} expected >=3 sources`);
  assert(Array.isArray(data.unverifiedItems), `${prefix} unverifiedItems must be an array`);
  assert(Array.isArray(data.gear), `${prefix} gear must be an array`);

  for (const [index, fact] of data.seasonFacts.entries()) {
    for (const field of ['species', 'method', 'dates', 'status', 'scopeAndExceptions']) {
      assert(typeof fact[field] === 'string' && fact[field].trim().length > 0, `${prefix} seasonFacts[${index}] missing ${field}`);
    }
    assert(validHttpUrl(fact.sourceUrl), `${prefix} seasonFacts[${index}] invalid sourceUrl`);
    assert(validDate(fact.verifiedOn), `${prefix} seasonFacts[${index}] invalid verifiedOn`);
  }
  for (const [index, fact] of data.licenseAndEducation.entries()) {
    for (const field of ['topic', 'fact']) {
      assert(typeof fact[field] === 'string' && fact[field].trim().length > 0, `${prefix} licenseAndEducation[${index}] missing ${field}`);
    }
    assert(validHttpUrl(fact.sourceUrl), `${prefix} licenseAndEducation[${index}] invalid sourceUrl`);
    assert(validDate(fact.verifiedOn), `${prefix} licenseAndEducation[${index}] invalid verifiedOn`);
  }
  for (const [index, item] of data.deadlines.entries()) {
    for (const field of ['applicationOrDeadline', 'dateOrStatus']) {
      assert(typeof item[field] === 'string' && item[field].trim().length > 0, `${prefix} deadlines[${index}] missing ${field}`);
    }
    assert(validHttpUrl(item.sourceUrl), `${prefix} deadlines[${index}] invalid sourceUrl`);
    assert(validDate(item.verifiedOn), `${prefix} deadlines[${index}] invalid verifiedOn`);
  }
  for (const [index, item] of data.gear.entries()) {
    assert(typeof item.name === 'string' && item.name.trim().length > 0, `${prefix} gear[${index}] missing name`);
    assert(/^[A-Z0-9]{10}$/.test(item.asin), `${prefix} gear[${index}] invalid ASIN`);
    assert(validAmazonUrl(item.url), `${prefix} gear[${index}] invalid Amazon URL`);
    assert(validHttpUrl(item.verificationUrl) && item.verificationUrl.includes(`/dp/${item.asin}`), `${prefix} gear[${index}] verificationUrl must match ASIN`);
    assert(validDate(item.verifiedOn), `${prefix} gear[${index}] invalid verifiedOn`);
  }
}

const catalogFile = fs.readFileSync(path.join(process.cwd(), 'src/data/gearCatalog.ts'), 'utf8');
assert(catalogFile.includes("const TAG = 'fieldseasonhq-20';"), 'gearCatalog.ts: missing fieldseasonhq-20 tag');

if (errors.length) {
  console.error('Content validation failed:\n' + errors.join('\n'));
  process.exit(1);
}
console.log(`Validated ${files.length} state files (unique copy verified) and dynamic gear catalog cleanly.`);
