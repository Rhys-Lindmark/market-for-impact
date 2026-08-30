import fs from 'node:fs';
import { validateSfOutcomeOntology } from './lib/sf-outcome-ontology.mjs';

const snapshot = JSON.parse(fs.readFileSync(new URL('../data/san-francisco/outcome-ontology-v1.json', import.meta.url)));
validateSfOutcomeOntology(snapshot);
console.log(`San Francisco ontology current: ${snapshot.outcomes.length} outcomes, ${snapshot.sources.length} sources, ${snapshot.overlaps.length} overlap rules.`);
