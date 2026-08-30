import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeSnapshot } from './lib/coefficient.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const inputPath = resolve(root, 'data/coefficient/effective-giving-and-careers.json');
const outputPath = resolve(root, 'data/normalized/coefficient-effective-giving-and-careers.json');
const snapshot = JSON.parse(await readFile(inputPath, 'utf8'));
const normalized = normalizeSnapshot(snapshot);
await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(normalized, null, 2)}\n`);
console.log(`Normalized ${normalized.summary.grantCount} grants (${normalized.source.contentHash.slice(0, 12)}).`);
