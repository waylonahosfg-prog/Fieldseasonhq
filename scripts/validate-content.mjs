import fs from 'node:fs';
import path from 'node:path';

const dir = path.join(process.cwd(), 'src/data/states');
const files = fs.readdirSync(dir).filter((file) => file.endsWith('.json'));
const errors = [];
const slugs = new Set();
const descriptions = new Set();
const validDate = (value) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
const https = (value) => typeof value === 'string' && /^https:\/\//.test(value);
for (const file of files) {
  let state;
  try { state = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8')); }
  catch (error) { errors.push(`${file}: invalid JSON (${error.message})`); continue; }
  const fail = (message) => errors.push(`${file}: ${message}`);
  for (const key of ['slug', 'name', 'metaDescription', 'homepageSummary', 'intro', 'verifiedOn']) if (!state[key]) fail(`missing ${key}`);
  if (!/^[a-z]+(?:-[a-z]+)*$/.test(state.slug || '')) fail('slug must be lowercase words separated by hyphens');
  if (slugs.has(state.slug)) fail('duplicate slug');
  slugs.add(state.slug);
  if (path.basename(file, '.json') !== state.slug) fail('filename must match slug');
  const title = `${state.name} Hunting Season Dates 2026 | Field Season HQ`;
  if (title.length >= 60) fail(`title is ${title.length} characters (must be under 60)`);
  const description = state.metaDescription || '';
  if (description.length < 140 || description.length > 155) fail(`meta description is ${description.length} characters (must be 140–155)`);
  if (!description.includes(state.name) || !description.includes('2026')) fail('meta description must include state and year');
  if (descriptions.has(description)) fail('duplicate meta description');
  descriptions.add(description);
  if (!validDate(state.verifiedOn)) fail('verifiedOn must be a valid YYYY-MM-DD date');
  if (!state.agency?.name || !https(state.agency?.url)) fail('missing agency name or HTTPS URL');
  const checkFact = (fact, label) => {
    if (!https(fact.sourceUrl)) fail(`${label} needs an HTTPS sourceUrl`);
    if (!validDate(fact.verifiedOn)) fail(`${label} needs a valid verifiedOn`);
  };
  for (const key of ['seasonFacts', 'licenseAndEducation', 'deadlines', 'sources']) if (!Array.isArray(state[key]) || !state[key].length) fail(`${key} must be a nonempty array`);
  for (const [i, fact] of (state.seasonFacts || []).entries()) {
    for (const key of ['species', 'method', 'dates', 'status', 'scopeAndExceptions']) if (!fact[key]) fail(`seasonFacts[${i}] missing ${key}`);
    checkFact(fact, `seasonFacts[${i}]`);
  }
  for (const [i, fact] of (state.licenseAndEducation || []).entries()) {
    if (!fact.topic || !fact.fact) fail(`licenseAndEducation[${i}] needs topic and fact`);
    checkFact(fact, `licenseAndEducation[${i}]`);
  }
  for (const [i, fact] of (state.deadlines || []).entries()) {
    if (!fact.applicationOrDeadline || !fact.dateOrStatus) fail(`deadlines[${i}] needs applicationOrDeadline and dateOrStatus`);
    checkFact(fact, `deadlines[${i}]`);
  }
  for (const [i, source] of (state.sources || []).entries()) if (!source.category || !source.title || !https(source.url) || !validDate(source.verifiedOn)) fail(`sources[${i}] needs category, title, HTTPS URL and valid date`);
  for (const [i, item] of (state.gear || []).entries()) {
    if (!/^[A-Z0-9]{10}$/.test(item.asin || '')) fail(`gear[${i}] needs the verified 10-character ASIN`);
    if (item.url !== `https://www.amazon.com/dp/${item.asin}?tag=fieldseasonhq-20`) fail(`gear[${i}] has an incorrect affiliate URL`);
    if (!item.name || !item.whyUseful) fail(`gear[${i}] needs name and whyUseful`);
    if (!validDate(item.verifiedOn) || !https(item.verificationUrl) || !item.verificationUrl.includes(`/dp/${item.asin}`)) fail(`gear[${i}] needs the matching direct verification URL and date`);
  }
}
if (!files.length) errors.push('No state JSON files found.');
if (errors.length) { console.error(`Content validation failed (${errors.length} issue(s)):\n- ${errors.join('\n- ')}`); process.exit(1); }
console.log(`Content validation passed for ${files.length} state file(s).`);
