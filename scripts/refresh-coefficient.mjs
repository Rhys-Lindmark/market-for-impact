import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildSnapshotFromAlgolia, COEFFICIENT_ALGOLIA, diffSnapshots } from './lib/coefficient-source.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const snapshotPath = resolve(root, 'data/coefficient/effective-giving-and-careers.json');
const write = process.argv.includes('--write');

async function fetchIndex() {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(COEFFICIENT_ALGOLIA.endpoint, {
        method: 'POST',
        headers: {
          'X-Algolia-Application-Id': COEFFICIENT_ALGOLIA.applicationId,
          'X-Algolia-API-Key': COEFFICIENT_ALGOLIA.searchKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: '',
          hitsPerPage: 1000,
          facetFilters: ['post_type:Grants', `focus-area:${COEFFICIENT_ALGOLIA.fund}`],
        }),
        signal: AbortSignal.timeout(15_000),
      });
      if (response.ok) return response.json();
      lastError = new Error(`Coefficient index returned HTTP ${response.status}.`);
      if (response.status !== 429 && response.status < 500) break;
    } catch (error) {
      lastError = error;
    }
    if (attempt < 3) await new Promise((resolveDelay) => setTimeout(resolveDelay, attempt * 500));
  }
  throw lastError ?? new Error('Coefficient index refresh failed.');
}

const previous = JSON.parse(await readFile(snapshotPath, 'utf8'));
const next = buildSnapshotFromAlgolia(await fetchIndex());
const diff = diffSnapshots(previous, next);
const provenanceMissing = previous.records.some((record) => !record.sourceRecordId || !record.publicationDate);

if (!diff.changed && !provenanceMissing) {
  console.log(`Coefficient EGC snapshot unchanged: ${next.records.length} records.`);
  process.exit(0);
}

console.log(`Coefficient EGC refresh: +${diff.added.length} / ~${diff.updated.length} / -${diff.removed.length}; ${next.records.length} current records.`);
for (const record of diff.added.slice(0, 10)) console.log(`+ ${record.recipient} — ${record.purpose} — ${record.amount}`);
for (const record of diff.updated.slice(0, 10)) console.log(`~ ${record.after.recipient} — ${record.after.purpose} — ${record.after.amount}`);
for (const record of diff.removed.slice(0, 10)) console.log(`- ${record.recipient} — ${record.purpose} — ${record.amount}`);

if (!write) {
  console.error('Snapshot differs. Review the summary, then run with --write to accept it.');
  process.exitCode = 2;
} else {
  await writeFile(snapshotPath, `${JSON.stringify(next, null, 2)}\n`);
  console.log(`Wrote ${snapshotPath}.`);
}
