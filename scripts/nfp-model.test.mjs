import assert from "assert";
import fs from "fs";
import calculate, { inputs, scenarios } from "../lib/nfp-model.mjs";

const saved = JSON.parse(fs.readFileSync("data/us/nfp-accepted-results.json", "utf8"));
const fresh = calculate();

// Corrected-v3 snapshot must remain exact.
assert.deepStrictEqual(fresh, saved);
assert.strictEqual(fresh.inputs.modelVersion, "nurse-family-partnership-v3-resource-timing-aligned");
assert.strictEqual(fresh.inputs.modeledCourseDurationYears, 2.5);
assert.strictEqual(
  fresh.inputs.wholeOrgExpensePerModeledCourse,
  fresh.inputs.wholeOrgExpensePerNfpFamily * fresh.inputs.modeledCourseDurationYears,
);

// Zero funding-additionality and zero gift both have null ratio guards.
const zeroFundingScenarios = scenarios.map((scenario) => ({ ...scenario, fundingAdditionality: 0 }));
const zeroFunding = calculate(inputs, zeroFundingScenarios);
assert.strictEqual(zeroFunding.weighted.giftQaly, 0);
assert.strictEqual(zeroFunding.weighted.donorCostPer10Qaly, null);
assert.strictEqual(zeroFunding.weighted.grossCostPer10Qaly, null);
assert.strictEqual(zeroFunding.weighted.bayImpactShare, null);
assert.strictEqual(zeroFunding.weighted.sfImpactShare, null);
assert.strictEqual(zeroFunding.weighted.bayDonorCostPer10Qaly, null);
assert.strictEqual(zeroFunding.weighted.sfDonorCostPer10Qaly, null);

const zeroGift = calculate({ ...inputs, gift: 0 });
assert.strictEqual(zeroGift.weighted.giftQaly, 0);
assert.strictEqual(zeroGift.weighted.grossResources, 0);
assert.strictEqual(zeroGift.weighted.donorCostPer10Qaly, null);
assert.strictEqual(zeroGift.weighted.grossCostPer10Qaly, null);

// Two-times gift scales quantities/resources linearly and preserves unit prices.
const doubled = calculate({ ...inputs, gift: inputs.gift * 2 });
for (const key of ["giftQaly", "bayQaly", "sfQaly", "grossResources"]) {
  assert.strictEqual(doubled.weighted[key], fresh.weighted[key] * 2);
}
for (const key of ["donorCostPer10Qaly", "grossCostPer10Qaly", "bayDonorCostPer10Qaly", "sfDonorCostPer10Qaly"]) {
  assert.strictEqual(doubled.weighted[key], fresh.weighted[key]);
}

// SF is nested within Bay in every scenario and in the signed expectation.
for (const scenario of fresh.scenarios) {
  assert(scenario.sfShare <= scenario.bayShare);
  assert.strictEqual(scenario.sfQaly, scenario.giftQaly * scenario.sfShare);
  assert.strictEqual(scenario.bayQaly, scenario.giftQaly * scenario.bayShare);
}
assert.strictEqual(fresh.weighted.bayImpactShare, 0.025000000000000005);
assert.strictEqual(fresh.weighted.sfImpactShare, 0.002);
assert(fresh.weighted.sfImpactShare < fresh.weighted.bayImpactShare);

// Gross resources add the gift once and charge delivery resources to funded
// full-course equivalents before the separate health-benefit realization factor.
for (const scenario of fresh.scenarios) {
  const expectedExternalPerCourse = Math.max(
    0,
    scenario.fullDeliveryCostPerFamily - fresh.inputs.wholeOrgExpensePerModeledCourse,
  );
  assert.strictEqual(scenario.externalResourcesPerFullCourse, expectedExternalPerCourse);
  assert.strictEqual(scenario.externalResources, scenario.fullCourseEquivalentsBeforeRealization * expectedExternalPerCourse);
  assert.strictEqual(scenario.grossResources, fresh.inputs.gift + scenario.externalResources);
  if (scenario.serviceRealization < 1 && expectedExternalPerCourse > 0) {
    assert(scenario.externalResources > scenario.realizedFullCourseEquivalents * expectedExternalPerCourse);
  }
}
assert(fresh.weighted.grossCostPer10Qaly > fresh.weighted.donorCostPer10Qaly);
assert.strictEqual(fresh.weighted.grossResources, 145710.8484618055);
assert.strictEqual(fresh.weighted.grossCostPer10Qaly, 22008179.050293565);
assert.strictEqual(fresh.scenarios.find(({ name }) => name === "central").grossCostPer10Qaly, 26468999.64915358);
assert.strictEqual(fresh.scenarios.find(({ name }) => name === "favorableStress").grossCostPer10Qaly, 1837842.0867975568);

// Invalid public API inputs fail loudly rather than producing NaN/Infinity.
assert.throws(() => calculate({ ...inputs, gift: -1 }), RangeError);
assert.throws(() => calculate({ ...inputs, gift: Number.NaN }), TypeError);
assert.throws(() => calculate(inputs, scenarios.map((scenario) => ({ ...scenario, weight: 0.1 }))), RangeError);
assert.throws(() => calculate(inputs, scenarios.map((scenario, index) => index === 0 ? { ...scenario, sfShare: 0.03 } : scenario)), RangeError);
assert.throws(() => calculate({ ...inputs, modeledCourseDurationYears: 1 }), RangeError);

console.log("PASS mfi-nfp-model-ready: exact corrected-v3 snapshot, zero guards, 2x gift scaling, nested geography, pre-realization gross boundary, and validation");
