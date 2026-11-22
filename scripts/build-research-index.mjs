import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dataDir = path.join(root, 'src/data/states');
const states = fs.readdirSync(dataDir)
  .filter((name) => name.endsWith('.json'))
  .map((name) => JSON.parse(fs.readFileSync(path.join(dataDir, name), 'utf8')))
  .sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));

const esc = (value) => String(value ?? '').replaceAll('|', '\\|');
const sourceLines = [
  '# Official sources',
  '',
  'Every listed source is an official state wildlife-agency page, regulation publication, or license/draw portal. Individual page facts carry their own source link and verification date.',
  ''
];
const unverifiedLines = [
  '# Unverified items',
  '',
  'Items below were not confirmed from an official source as of the state guide’s verification date. Do not treat an unverified item as a published rule or date.',
  ''
];

for (const state of states) {
  sourceLines.push(`## ${state.name}`, '', `Last verified: ${state.verifiedOn}`, '', '| Fact category | Official source | Verification date |', '|---|---|---|');
  const rows = [
    ...(state.sources ?? []).map((source) => ({ category: source.category, title: source.title, url: source.url, verifiedOn: source.verifiedOn })),
    ...(state.seasonFacts ?? []).map((fact) => ({ category: `Season — ${fact.species}: ${fact.method}`, title: `${fact.species} / ${fact.method}`, url: fact.sourceUrl, verifiedOn: fact.verifiedOn })),
    ...(state.licenseAndEducation ?? []).map((fact) => ({ category: fact.topic, title: fact.topic, url: fact.sourceUrl, verifiedOn: fact.verifiedOn })),
    ...(state.deadlines ?? []).map((fact) => ({ category: fact.applicationOrDeadline, title: fact.applicationOrDeadline, url: fact.sourceUrl, verifiedOn: fact.verifiedOn }))
  ];
  const seen = new Set();
  for (const row of rows) {
    if (!row.url) continue;
    const key = [row.category, row.url, row.verifiedOn].join('|');
    if (seen.has(key)) continue;
    seen.add(key);
    sourceLines.push(`| ${esc(row.category)} | [${esc(row.title || row.url)}](${row.url}) | ${esc(row.verifiedOn)} |`);
  }
  if (!seen.size) sourceLines.push('| No source records | — | — |');
  sourceLines.push('');

  unverifiedLines.push(`## ${state.name}`, '', `Last verified: ${state.verifiedOn}`, '');
  if ((state.unverifiedItems ?? []).length) {
    for (const item of state.unverifiedItems) unverifiedLines.push(`- ${item}`);
  } else {
    unverifiedLines.push('- No unverified items recorded in this state file.');
  }
  unverifiedLines.push('');
}

fs.writeFileSync(path.join(root, 'sources.md'), `${sourceLines.join('\n')}\n`);
fs.writeFileSync(path.join(root, 'unverified-items.md'), `${unverifiedLines.join('\n')}\n`);
console.log(`Wrote sources.md and unverified-items.md for ${states.length} states.`);
