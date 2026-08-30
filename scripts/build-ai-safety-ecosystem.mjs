import { readFile, writeFile } from 'node:fs/promises';
import { buildAiSafetyEcosystem, validateAiSafetyEcosystem } from './lib/ai-safety-ecosystem.mjs';

const coefficient = JSON.parse(await readFile(new URL('../data/coefficient/all-grants.json', import.meta.url), 'utf8'));
const foundersPledge = JSON.parse(await readFile(new URL('../data/founders-pledge/research-matrix.json', import.meta.url), 'utf8'));
const outputUrl = new URL('../data/ai-safety/ecosystem-v1.json', import.meta.url);
const existing = await readFile(outputUrl, 'utf8').then(JSON.parse).catch(() => null);
const generatedAt = process.argv.includes('--write') ? new Date().toISOString() : existing?.generatedAt ?? '1970-01-01T00:00:00.000Z';
const next = validateAiSafetyEcosystem(buildAiSafetyEcosystem(coefficient, foundersPledge, generatedAt));
if (process.argv.includes('--write')) await writeFile(outputUrl, `${JSON.stringify(next, null, 2)}\n`);
else if (!existing || existing.contentHash !== next.contentHash) throw new Error('AI ecosystem snapshot is stale; review and run with --write.');
console.log(`AI ecosystem verified: ${next.summary.grantCount} grants, ${next.summary.organizationCount} organizations, ${next.summary.roleAssignmentCount} role assignments.`);
