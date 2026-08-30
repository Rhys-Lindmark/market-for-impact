import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildAllGrantsSnapshot, buildCoefficientMarketSummary, diffAllGrantsSnapshots, fetchAllCoefficientGrantHits,
} from './lib/coefficient-all-source.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const snapshotPath = resolve(root, 'data/coefficient/all-grants.json');
const summaryPath = resolve(root, 'data/normalized/coefficient-market-summary.json');
const write = process.argv.includes('--write');

const { hits } = await fetchAllCoefficientGrantHits();
const next = buildAllGrantsSnapshot(hits);
let previous = null;
try {
  previous = JSON.parse(await readFile(snapshotPath, 'utf8'));
} catch (error) {
  if (error?.code !== 'ENOENT') throw error;
}

const diff = previous ? diffAllGrantsSnapshots(previous, next) : {
  changed: true, added: next.records, updated: [], removed: [],
};
if (!diff.changed) {
  console.log(`Coefficient all-grants snapshot unchanged: ${next.records.length} records.`);
  if (write) {
    await mkdir(dirname(summaryPath), { recursive: true });
    await writeFile(summaryPath, `${JSON.stringify(buildCoefficientMarketSummary(previous), null, 2)}\n`);
    console.log(`Regenerated ${summaryPath} from the unchanged committed snapshot.`);
  }
  process.exit(0);
}

console.log(`Coefficient all-grants refresh: +${diff.added.length} / ~${diff.updated.length} / -${diff.removed.length}; ${next.records.length} current records.`);
for (const record of diff.added.slice(0, 10)) console.log(`+ ${record.recipients.join('; ')} — ${record.purpose} — ${record.amountDisplay ?? 'amount not published'}`);
for (const record of diff.updated.slice(0, 10)) console.log(`~ ${record.after.recipients.join('; ')} — ${record.after.purpose} — ${record.after.amountDisplay ?? 'amount not published'}`);
for (const record of diff.removed.slice(0, 10)) console.log(`- ${record.recipients.join('; ')} — ${record.purpose} — ${record.amountDisplay ?? 'amount not published'}`);

if (!write) {
  console.error('All-grants snapshot differs. Review the summary, then run with --write to accept it.');
  process.exitCode = 2;
} else {
  await mkdir(dirname(snapshotPath), { recursive: true });
  await mkdir(dirname(summaryPath), { recursive: true });
  await writeFile(snapshotPath, `${JSON.stringify(next, null, 2)}\n`);
  await writeFile(summaryPath, `${JSON.stringify(buildCoefficientMarketSummary(next), null, 2)}\n`);
  console.log(`Wrote ${snapshotPath} and ${summaryPath}.`);
}
