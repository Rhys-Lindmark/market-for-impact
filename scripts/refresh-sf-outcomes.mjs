import fs from 'node:fs';
import { checkSfOntologySource, validateSfOutcomeOntology } from './lib/sf-outcome-ontology.mjs';

const snapshot = validateSfOutcomeOntology(JSON.parse(fs.readFileSync(new URL('../data/san-francisco/outcome-ontology-v1.json', import.meta.url))));
const results = [];
for (const source of snapshot.sources) results.push(await checkSfOntologySource(source));
console.log(`Verified ${results.length} San Francisco ontology sources (${results.reduce((sum, item) => sum + item.bytes, 0)} bytes).`);
