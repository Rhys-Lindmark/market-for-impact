import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {calculate, DEFAULT_INPUTS} from '../lib/lacasa-model.mjs';

const saved = JSON.parse(readFileSync(new URL('../data/bay/lacasa-results.json',import.meta.url), 'utf8'));
const actual = calculate();
for (const key of Object.keys(saved.weighted)) {
  assert.equal(actual.weighted[key], saved.weighted[key], `snapshot mismatch: weighted.${key}`);
}
assert.equal(actual.rows.find((x) => x.id === 'central').donorUsdPerTenQaly, saved.diagnostics.centralDonorUsdPerTenQaly);
assert.equal(actual.rows.find((x) => x.id === 'central').grossUsdPerTenQaly, saved.diagnostics.centralGrossUsdPerTenQaly);
assert.equal(actual.rows.find((x) => x.id === 'favorable').donorUsdPerTenQaly, saved.diagnostics.favorableDonorUsdPerTenQaly);
assert.equal(actual.rows.find((x) => x.id === 'harm').qaly, saved.diagnostics.harmQaly);
assert.equal(actual.inputs.observedBroadDirectServiceUmbrella, 1384);
assert.equal(actual.inputs.communityOfficeSubsetDiagnostic, 885);
assert.equal(actual.inputs.reportedDonatedServicesAndEquipmentUsd, 95586);
assert.equal(actual.inputs.donatedServicesReconciledToIrsExpense, null);
assert.equal(actual.evidenceBridge.impliedQalyPerFullAdvocacyEquivalent, 0.055);
assert.equal(actual.evidenceBridge.chosenCentralQalyPerFullAdvocacyEquivalent, 0.05);

const zero = calculate({...DEFAULT_INPUTS, giftUsd: 0});
assert.equal(zero.weighted.qaly, 0);
assert.equal(zero.weighted.grossResourcesUsd, 0);
assert.equal(zero.weighted.donorUsdPerTenQaly, null);
assert.equal(zero.weighted.grossUsdPerTenQaly, null);

const zeroAdditionality = calculate({...DEFAULT_INPUTS, scenarios: DEFAULT_INPUTS.scenarios.map((scenario) => ({...scenario, fundingAdditionality: 0}))});
assert.equal(zeroAdditionality.weighted.qaly, 0);
assert.equal(zeroAdditionality.weighted.bayQaly, 0);
assert.equal(zeroAdditionality.weighted.sfQaly, 0);
assert.equal(zeroAdditionality.weighted.donorUsdPerTenQaly, null);
assert.equal(zeroAdditionality.weighted.grossUsdPerTenQaly, null);
assert.equal(zeroAdditionality.weighted.bayDonorUsdPerTenQaly, null);
assert.equal(zeroAdditionality.weighted.sfDonorUsdPerTenQaly, null);
assert.equal(zeroAdditionality.weighted.favorableContributionShare, null);
assert.equal(zeroAdditionality.weighted.noFavorableDonorUsdPerTenQaly, null);

const doubled = calculate({...DEFAULT_INPUTS, giftUsd: 200_000});
assert.equal(doubled.weighted.qaly, actual.weighted.qaly * 2);
assert.equal(doubled.weighted.grossResourcesUsd, actual.weighted.grossResourcesUsd * 2);
assert.equal(doubled.weighted.donorUsdPerTenQaly, actual.weighted.donorUsdPerTenQaly);
assert.equal(doubled.weighted.grossUsdPerTenQaly, actual.weighted.grossUsdPerTenQaly);

for (const row of actual.rows) assert.ok(row.sfRecipientShare <= row.bayRecipientShare);
assert.ok(actual.weighted.sfQaly <= actual.weighted.bayQaly);
assert.ok(actual.weighted.bayQaly <= actual.weighted.qaly);
assert.ok(actual.weighted.favorableContributionShare > 0.86);

assert.throws(() => calculate({...DEFAULT_INPUTS, fy2025WholeOrgExpenseUsd: 0}), /positive/);
assert.throws(() => calculate({...DEFAULT_INPUTS, scenarios: DEFAULT_INPUTS.scenarios.map((s, i) => ({...s, weight: i === 0 ? 0.06 : s.weight}))}), /sum to one/);
assert.throws(() => calculate({...DEFAULT_INPUTS, scenarios: DEFAULT_INPUTS.scenarios.map((s, i) => i === 0 ? {...s, sfRecipientShare: 0.91} : s)}), /must not exceed/);

console.log('La Casa whole-organization model: exact snapshot, gift-zero, all-additionality-zero, scaling, geography, gross boundary, and validation checks pass.');
