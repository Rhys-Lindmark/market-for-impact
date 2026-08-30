import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeGiveWellGrants, validateGiveWellOpportunities } from './lib/givewell.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const inputFlag = process.argv.indexOf('--input');
const externalInput = inputFlag >= 0 ? process.argv[inputFlag + 1] : null;
if (inputFlag >= 0 && !externalInput) throw new Error('--input requires a CSV path.');
const rawPath = resolve(root, 'data/givewell/grants.csv');
const inputPath = externalInput ? resolve(externalInput) : rawPath;
const manifestPath = resolve(root, 'data/givewell/grants-source.json');
const opportunitiesPath = resolve(root, 'data/givewell/top-charities.json');
const outputPath = resolve(root, 'data/normalized/givewell-grants.json');

const [csvText, manifest, opportunities] = await Promise.all([
  readFile(inputPath, 'utf8'),
  readFile(manifestPath, 'utf8').then(JSON.parse),
  readFile(opportunitiesPath, 'utf8').then(JSON.parse),
]);
const normalized = normalizeGiveWellGrants(csvText, manifest);
validateGiveWellOpportunities(opportunities);
await mkdir(dirname(outputPath), { recursive: true });
if (externalInput) await copyFile(inputPath, rawPath);
await writeFile(outputPath, `${JSON.stringify(normalized, null, 2)}\n`);
console.log(`Normalized ${normalized.summary.grantCount} GiveWell grants totaling $${normalized.summary.totalPublishedAmountUsd.toLocaleString('en-US')} (${normalized.source.contentHash.slice(0, 12)}).`);
