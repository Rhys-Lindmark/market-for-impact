import config from '../data/san-francisco/public-funding-config-v1.json' with { type: 'json' };
import snapshot from '../data/san-francisco/public-funding-v1.json' with { type: 'json' };
import { validateSfPublicFundingSnapshot } from './lib/sf-public-funding.mjs';

validateSfPublicFundingSnapshot(snapshot, config);
console.log(`SF public-funding snapshot valid: ${snapshot.departmentBudgets.length} departments, ${snapshot.contracts.length} contracts, ${snapshot.summary.classifiedContractCount} outcome-linked.`);
