import fs from 'node:fs';
import config from '../data/san-francisco/public-funding-config-v1.json' with { type: 'json' };
import current from '../data/san-francisco/public-funding-v1.json' with { type: 'json' };
import { buildSfPublicFundingSnapshot, fetchSfPublicFundingSources, validateSfPublicFundingSnapshot } from './lib/sf-public-funding.mjs';

const write = process.argv.includes('--write');
const sources = await fetchSfPublicFundingSources(config);
const snapshot = validateSfPublicFundingSnapshot(buildSfPublicFundingSnapshot({ config, ...sources }), config);
if (write) {
  fs.writeFileSync(new URL('../data/san-francisco/public-funding-v1.json', import.meta.url), `${JSON.stringify(snapshot, null, 2)}\n`);
  console.log(`Wrote ${snapshot.contracts.length} active nonprofit contracts and ${snapshot.departmentBudgets.length} department budgets.`);
} else {
  validateSfPublicFundingSnapshot(current, config);
  const expected = new Map(current.sources.map((source) => [source.key, source.semanticHash]));
  for (const source of snapshot.sources) if (expected.get(source.key) !== source.semanticHash) throw new Error(`${source.key} changed (${source.semanticHash}); run the reviewed refresh.`);
  console.log(`SF public-funding sources current: ${snapshot.departmentBudgets.length} departments, ${snapshot.contracts.length} active nonprofit contracts.`);
}
