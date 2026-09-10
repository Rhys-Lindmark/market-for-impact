import assert from "assert";
import fs from "fs";
import calculatePortfolio, { calculateNfpMortalityHorizonSensitivity, inputs, scenarios } from "../lib/nfp-portfolio-model.mjs";
import calculateV3 from "../lib/nfp-model.mjs";

const fresh = calculatePortfolio();
const prior = calculateV3();
const saved = JSON.parse(fs.readFileSync(new URL("../data/us/nfp-portfolio-results-v4.json", import.meta.url), "utf8"));
const compactFresh = {
  modelVersion: fresh.inputs.modelVersion,
  diagnostics: fresh.diagnostics,
  weighted: fresh.weighted,
  noFavorable: fresh.noFavorable,
  publishedLifetimeBestGuess: (() => {
    const sensitivity = calculateNfpMortalityHorizonSensitivity();
    return {
      assumedMeanCounterfactualDeathAge: sensitivity.assumptions.assumedMeanCounterfactualDeathAge,
      remainingLifeYearsAtAge10: sensitivity.assumptions.remainingLifeYearsAtAge10,
      healthUtility: sensitivity.assumptions.healthUtility,
      annualDiscountRate: sensitivity.assumptions.annualDiscountRate,
      discountFromPregnancyBaselineYears: sensitivity.assumptions.discountFromPregnancyBaselineYears,
      observedWindowYearsAfterAssumedDeath: sensitivity.assumptions.observedWindowYearsAfterAssumedDeath,
      postAge20PersistencePrior: sensitivity.assumptions.postAge20PersistencePrior,
      discountedAtAge10QalyPerPreventedDeath: sensitivity.discountedAtAge10QalyPerPreventedDeath,
      fullyCreditedObservedWindowQaly: sensitivity.fullyCreditedObservedWindowQaly,
      fullLifetimeBaselineQaly: sensitivity.fullLifetimeBaselineQaly,
      postAge20BaselineQaly: sensitivity.postAge20BaselineQaly,
      discountedFiniteQalyPerPreventedDeath: sensitivity.discountedFiniteQalyPerPreventedDeath,
      positiveNfpQalyScale: sensitivity.positiveNfpQalyScale,
      weightedGiftQaly: sensitivity.weighted.giftQaly,
      weightedDonorCostPer10Qaly: sensitivity.weighted.donorCostPer10Qaly,
      weightedGrossCostPer10Qaly: sensitivity.weighted.grossCostPer10Qaly,
      favorableShareOfSignedExpectedQaly: sensitivity.weighted.favorableShareOfSignedExpectedQaly,
      noFavorableDonorCostPer10Qaly: sensitivity.noFavorable.donorCostPer10Qaly,
    };
  })(),
  scenarios: fresh.scenarios.map((scenario) => ({
    name: scenario.name,
    weight: scenario.weight,
    fundingAdditionality: scenario.fundingAdditionality,
    nfpGiftQaly: scenario.nfpGiftQaly,
    childFirstGiftQaly: scenario.childFirstGiftQaly,
    giftQaly: scenario.giftQaly,
    grossResources: scenario.grossResources,
    donorCostPer10Qaly: scenario.donorCostPer10Qaly,
    grossCostPer10Qaly: scenario.grossCostPer10Qaly,
  })),
};
assert.deepStrictEqual(compactFresh, saved);

// The extension preserves accepted-v3 NFP outcomes scenario by scenario.
for (const result of fresh.scenarios) {
  const priorResult = prior.scenarios.find(({ name }) => name === result.name);
  assert.strictEqual(result.nfpGiftQaly, priorResult.giftQaly);
}
assert.strictEqual(fresh.weighted.nfpGiftQaly, prior.weighted.giftQaly);

// FY2024 scope shares and matched 2024 service units are exact.
assert.strictEqual(fresh.diagnostics.childFirstDirectExpenseShareOfWholeOrg, 5679121 / 30712013);
assert.strictEqual(fresh.diagnostics.childFirstShareOfProgramServiceExpense, 5679121 / 21649815);
assert.strictEqual(fresh.diagnostics.childFirstFamilyShareOfNamedPrograms, 2564 / (57005 + 2564));
assert.strictEqual(fresh.diagnostics.childFirstContactShareOfNamedPrograms, 60971 / (586081 + 60971));
assert.strictEqual(
  fresh.diagnostics.nfpAllocatedWholeOrgExpense + fresh.diagnostics.childFirstAllocatedWholeOrgExpense,
  inputs.fy2024Expense,
);

// Each scenario scales both programs from one whole-organization gift fraction,
// adds program QALYs without overlap, and counts the donor gift once.
for (const result of fresh.scenarios) {
  assert.strictEqual(result.organizationScaleFraction, result.additionalSupportCash / inputs.fy2024Expense);
  assert.strictEqual(result.giftQaly, result.nfpGiftQaly + result.childFirstGiftQaly);
  assert.strictEqual(result.modeledInternalExpense, result.additionalSupportCash);
  assert.strictEqual(result.grossResources, inputs.gift + result.externalResources);
  assert.strictEqual(result.bayQaly, result.nfpGiftQaly * result.nfpBayShare);
  assert.strictEqual(result.sfQaly, result.nfpGiftQaly * result.nfpSfShare);
  assert(result.sfQaly <= result.bayQaly || result.sfQaly < 0);
}

// Zero gift and zero funding-additionality have complete ratio guards.
const zeroGift = calculatePortfolio({ ...inputs, gift: 0 });
assert.strictEqual(zeroGift.weighted.giftQaly, 0);
assert.strictEqual(zeroGift.weighted.grossResources, 0);
assert.strictEqual(zeroGift.weighted.donorCostPer10Qaly, null);
assert.strictEqual(zeroGift.weighted.grossCostPer10Qaly, null);
assert.strictEqual(zeroGift.weighted.bayImpactShare, null);

const zeroFunding = calculatePortfolio(inputs, scenarios.map((scenario) => ({ ...scenario, fundingAdditionality: 0 })));
assert.strictEqual(zeroFunding.weighted.giftQaly, 0);
assert.strictEqual(zeroFunding.weighted.donorCostPer10Qaly, null);
assert.strictEqual(zeroFunding.weighted.grossCostPer10Qaly, null);
assert.strictEqual(zeroFunding.weighted.bayDonorCostPer10Qaly, null);

// Two-times gift scales every quantity and resource, but not unit prices.
const doubled = calculatePortfolio({ ...inputs, gift: inputs.gift * 2 });
for (const key of ["nfpGiftQaly", "childFirstGiftQaly", "giftQaly", "bayQaly", "sfQaly", "grossResources"]) {
  assert.strictEqual(doubled.weighted[key], fresh.weighted[key] * 2);
}
for (const key of ["donorCostPer10Qaly", "grossCostPer10Qaly", "bayDonorCostPer10Qaly", "sfDonorCostPer10Qaly"]) {
  assert.strictEqual(doubled.weighted[key], fresh.weighted[key]);
}

// Explicit signed uncertainty: harm is negative, null is zero, and the estimate
// remains highly dependent on the favorable stress case.
assert(fresh.scenarios.find(({ name }) => name === "harm").giftQaly < 0);
assert.strictEqual(fresh.scenarios.find(({ name }) => name === "null").giftQaly, 0);
assert(fresh.weighted.favorableShareOfSignedExpectedQaly > 0.80);
assert(fresh.noFavorable.donorCostPer10Qaly > fresh.weighted.donorCostPer10Qaly);

// Child First is material but does not dominate the signed expected benefit.
assert(fresh.weighted.childFirstShareOfSignedExpectedQaly > 0.05);
assert(fresh.weighted.childFirstShareOfSignedExpectedQaly < 0.15);

// The separate actuarial-anchored sensitivity extends only positive NFP
// survival credit. It leaves harm/null and every Child First assumption intact.
const horizon = calculateNfpMortalityHorizonSensitivity();
assert.strictEqual(horizon.scenarios.length, 5);
assert.strictEqual(horizon.scenarios.find(({name}) => name === 'central').donorCostPer10Qaly, 9988359.139298167);
assert.strictEqual(horizon.scenarios.reduce((sum, scenario) => sum + scenario.weight * scenario.giftQaly, 0), horizon.weighted.giftQaly);
assert(horizon.discountedFiniteQalyPerPreventedDeath > 9);
assert(horizon.discountedFiniteQalyPerPreventedDeath < 30);
assert(horizon.weighted.giftQaly > fresh.weighted.giftQaly);
assert(horizon.weighted.donorCostPer10Qaly < fresh.weighted.donorCostPer10Qaly);
assert.strictEqual(horizon.scenarioQalyPerCompletedCourse.find(({ name }) => name === "harm").nfpQalyPerCompletedCourse, -0.01);
assert.strictEqual(horizon.scenarioQalyPerCompletedCourse.find(({ name }) => name === "null").nfpQalyPerCompletedCourse, 0);
const zeroPersistence = calculateNfpMortalityHorizonSensitivity(inputs, scenarios, {
  ...horizon.assumptions,
  postAge20PersistencePrior: 0,
});
const fullPersistence = calculateNfpMortalityHorizonSensitivity(inputs, scenarios, {
  ...horizon.assumptions,
  postAge20PersistencePrior: 1,
});
assert.strictEqual(zeroPersistence.discountedFiniteQalyPerPreventedDeath, horizon.fullyCreditedObservedWindowQaly);
assert.strictEqual(fullPersistence.discountedFiniteQalyPerPreventedDeath, horizon.fullLifetimeBaselineQaly);
assert(zeroPersistence.weighted.giftQaly < horizon.weighted.giftQaly);
assert(horizon.weighted.giftQaly < fullPersistence.weighted.giftQaly);

// Invalid parameters fail loudly.
assert.throws(() => calculatePortfolio({ ...inputs, gift: -1 }), RangeError);
assert.throws(() => calculatePortfolio({ ...inputs, childFirstFamiliesServed2024: 0 }), RangeError);
assert.throws(() => calculatePortfolio(inputs, scenarios.map((scenario) => ({ ...scenario, weight: 0.1 }))), RangeError);
assert.throws(() => calculatePortfolio(inputs, scenarios.map((scenario, index) => index === 0 ? { ...scenario, nfpSfShare: 0.03 } : scenario)), RangeError);

console.log("PASS mfi-nfp-portfolio-model-v4: v3 NFP parity, portfolio allocation, no double gift, signed/null/zero guards, geography, scaling, and gross boundary");
