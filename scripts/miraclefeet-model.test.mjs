import assert from "node:assert/strict";
import fs from "node:fs";
import calculate, { inputs, scenarios, finiteGrossQalyPerDurableCorrection } from "../lib/miraclefeet-model.mjs";

const close = (actual, expected, tolerance = 1e-12) => {
  assert(Number.isFinite(actual) && Number.isFinite(expected));
  assert(Math.abs(actual - expected) <= tolerance * Math.max(1, Math.abs(actual), Math.abs(expected)), `${actual} != ${expected}`);
};

const deepClose = (actual, expected, path = "root") => {
  if (typeof actual === "number" && typeof expected === "number") return close(actual, expected);
  if (Array.isArray(actual) || Array.isArray(expected)) {
    assert(Array.isArray(actual) && Array.isArray(expected), `${path}: array mismatch`);
    assert.strictEqual(actual.length, expected.length, `${path}: array length`);
    actual.forEach((value, index) => deepClose(value, expected[index], `${path}[${index}]`));
    return;
  }
  if (actual && expected && typeof actual === "object" && typeof expected === "object") {
    assert.deepStrictEqual(Object.keys(actual).sort(), Object.keys(expected).sort(), `${path}: keys`);
    for (const key of Object.keys(actual)) deepClose(actual[key], expected[key], `${path}.${key}`);
    return;
  }
  assert.strictEqual(actual, expected, path);
};

const fresh = calculate();
const saved = JSON.parse(fs.readFileSync(new URL("../data/international/miraclefeet-results-v5.json", import.meta.url), "utf8"));
deepClose(fresh, saved);
assert.strictEqual(inputs.giveWellGrantSpecificDurableCounterfactualShare, 3681 / 9785);
close(fresh.weighted.modeledGiftQalys, 44.48619144086118);
close(fresh.weighted.modeledOrdinaryGiftCostPer10Qaly, 22478.885416149296);
assert.strictEqual(fresh.weighted.modeledGrossResourcesUsd, 211250);
close(fresh.weighted.modeledGrossResourceCostPer10Qaly, 47486.645441615394);
assert.strictEqual(fresh.weighted.verifiedMarginalGiftCostPer10Qaly, null);
assert.strictEqual(fresh.weighted.verifiedCompleteGrossResourceCostPer10Qaly, null);
assert.strictEqual(fresh.weighted.bayDirectHealthShare, 0);
assert.strictEqual(fresh.weighted.sfDirectHealthShare, 0);
close(fresh.noFavorable.modeledOrdinaryGiftCostPer10Qaly, 60372.29943872174);

const harm = fresh.scenarios.find(({ name }) => name === "independentHarm");
const nullCase = fresh.scenarios.find(({ name }) => name === "null");
const central = fresh.scenarios.find(({ name }) => name === "central");
const downside = fresh.scenarios.find(({ name }) => name === "downside");
assert.strictEqual(harm.finiteGrossUtilityQalyPerDurableCorrection, 0);
close(harm.modeledTreatmentBurdenQaly, harm.transferredEnrollmentEquivalents * harm.oneTimeTreatmentBurdenQaly);
assert(harm.modeledGiftQalys < 0 && harm.modeledDonorUsdPer10Qaly === null);
assert.strictEqual(nullCase.modeledGiftQalys, 0);
assert.strictEqual(nullCase.modeledDonorUsdPer10Qaly, null);
assert(downside.modeledGiftQalys < 0 && downside.modeledDonorUsdPer10Qaly === null);
close(central.additionalDurableCorrections, 33.17354875862796);
close(central.finiteGrossUtilityQalyPerDurableCorrection, 1.6135157022979199);
close(central.modeledGrossBenefitQalys, 53.52604182299188);
close(central.modeledTreatmentBurdenQaly, 8.818342151675486);
close(central.modeledGiftQalys, 44.70769967131639);
close(central.modeledDonorUsdPer10Qaly, 22367.511801140172);
close(central.modeledGrossUsdPer10Qaly, 39143.1456519953);
close(finiteGrossQalyPerDurableCorrection(scenarios.find(({ name }) => name === "downside")), 0.25589888241708475);

for (const result of fresh.scenarios) {
  assert(result.currentGiftTransferFrom2023Grant >= 0 && result.currentGiftTransferFrom2023Grant <= 1);
  assert(result.durableCounterfactualSharePerEnrollmentEquivalent >= 0 && result.durableCounterfactualSharePerEnrollmentEquivalent <= 1);
  assert(result.grossResourceMultiplierPrior >= 1);
  assert.strictEqual(result.verifiedCompleteGrossResourcesUsd, null);
  assert.strictEqual(result.bayDirectHealthQalys, 0);
  assert.strictEqual(result.sfDirectHealthQalys, 0);
  close(result.modeledTreatmentBurdenQaly, result.transferredEnrollmentEquivalents * result.oneTimeTreatmentBurdenQaly);
}

const doubled = calculate({ ...inputs, giftUsd: inputs.giftUsd * 2 });
close(doubled.weighted.modeledGiftQalys, fresh.weighted.modeledGiftQalys * 2);
close(doubled.weighted.modeledGrossResourcesUsd, fresh.weighted.modeledGrossResourcesUsd * 2);
close(doubled.weighted.modeledOrdinaryGiftCostPer10Qaly, fresh.weighted.modeledOrdinaryGiftCostPer10Qaly);
close(doubled.weighted.modeledGrossResourceCostPer10Qaly, fresh.weighted.modeledGrossResourceCostPer10Qaly);

const zeroTransfer = calculate(inputs, scenarios.map((scenario) => ({ ...scenario, currentGiftTransferFrom2023Grant: 0 })));
assert.strictEqual(zeroTransfer.weighted.modeledGiftQalys, 0);
assert.strictEqual(zeroTransfer.weighted.modeledOrdinaryGiftCostPer10Qaly, null);
assert.strictEqual(zeroTransfer.weighted.modeledGrossResourceCostPer10Qaly, null);
assert.strictEqual(zeroTransfer.weighted.favorableShareOfModeledExpectedQaly, null);

assert.throws(() => calculate({ ...inputs, giftUsd: -1 }), RangeError);
assert.throws(() => calculate({ ...inputs, verifiedQalyPerDurableCorrection: 1 }), RangeError);
assert.throws(() => calculate(inputs, scenarios.map((scenario) => ({ ...scenario, weight: 0.1 }))), RangeError);
assert.throws(() => calculate(inputs, scenarios.map((scenario, index) => index === 0 ? { ...scenario, annualSurvival: 1.1 } : scenario)), RangeError);
assert(zeroTransfer.scenarios.every((scenario) => scenario.modeledTreatmentBurdenQaly === 0));

console.log("PASS MiracleFeet v5: tolerant cross-runtime snapshot, burden on all treated enrollments, finite QALY priors, signed downside/null/harm, gross separation, zero geography, scaling, and validation");
