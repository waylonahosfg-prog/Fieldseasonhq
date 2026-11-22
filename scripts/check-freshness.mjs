import fs from 'node:fs';
import path from 'node:path';

const stateDir = path.join(process.cwd(), 'src/data/states');
const files = fs.readdirSync(stateDir).filter((f) => f.endsWith('.json'));
const now = Date.now();
const DAY_MS = 86400000;
const STALE_DAYS = 180;

const staleReports = [];

for (const file of files) {
  const data = JSON.parse(fs.readFileSync(path.join(stateDir, file), 'utf8'));
  const verifiedMs = Date.parse(`${data.verifiedOn}T00:00:00Z`);
  const ageDays = Math.floor((now - verifiedMs) / DAY_MS);
  if (ageDays > STALE_DAYS) {
    staleReports.push(`${file}: state verifiedOn (${data.verifiedOn}) is ${ageDays} days old (> ${STALE_DAYS}d)`);
  }
}

if (staleReports.length) {
  console.warn('Freshness alert — re-verify these state regulations soon:\n' + staleReports.join('\n'));
  process.exit(1);
}

console.log(`Freshness check passed: all ${files.length} states verified within ${STALE_DAYS} days.`);
