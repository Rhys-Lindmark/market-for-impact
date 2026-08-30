import { readFile, writeFile } from 'node:fs/promises';
import { buildEvaluatorComparison, validateEvaluatorComparison } from './lib/evaluator-comparison.mjs';

const read = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8'));
const inputs = {
  coefficient: await read('../data/coefficient/all-grants.json'),
  givewell: await read('../data/givewell/top-charities.json'),
  ace: await read('../data/ace/recommendations-2025.json'),
  givingGreen: await read('../data/giving-green/recommendations-2025-2026.json'),
  foundersPledge: await read('../data/founders-pledge/research-matrix.json'),
};
const outputUrl = new URL('../data/comparisons/evaluator-matrix-v1.json', import.meta.url);
const existing = await readFile(outputUrl, 'utf8').then(JSON.parse).catch(() => null);
const generatedAt = process.argv.includes('--write') ? new Date().toISOString() : existing?.generatedAt ?? '1970-01-01T00:00:00.000Z';
const next = validateEvaluatorComparison(buildEvaluatorComparison(inputs, generatedAt));
if (process.argv.includes('--write')) await writeFile(outputUrl, `${JSON.stringify(next, null, 2)}\n`);
else if (!existing || existing.contentHash !== next.contentHash) throw new Error('Evaluator comparison snapshot is stale; review and run with --write.');
console.log(`Evaluator comparison verified: ${next.causes.length} causes × ${next.evaluatorProfiles.length} evaluators.`);
