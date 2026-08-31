import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';

const review = JSON.parse(fs.readFileSync('data/san-francisco/farming-hope-review-v1.json', 'utf8'));
const model = JSON.parse(fs.readFileSync('data/san-francisco/farming-hope-apprenticeship-cea-v1.json', 'utf8'));

test('Farming Hope review separates reported placement from causal impact', () => {
  assert.equal(review.evidence.length, 3);
  assert.match(review.evidence[0].transfer, /does not identify the employment-rate numerator/i);
  assert.match(review.evidence[1].result, /did not increase regular unsubsidized employment/i);
  assert.match(review.evidence[2].result, /4.0 percentage-point impact/i);
  assert.match(review.decision.costEffectiveness, /1\.04M/);
  assert.equal(review.decision.roomForMoreFunding, 'Not published');
  assert.equal(review.model.missingInputs.length, 8);
  assert.match(review.model.qalyBoundary, /No QALY/);
});

test('Farming Hope review preserves portfolio, cost, and public-funding boundaries', () => {
  assert.equal(review.financialContext.totalRevenueUsd, 4118276);
  assert.equal(review.financialContext.jobTrainingProgramExpenseUsd, 1706032);
  assert.equal(review.financialContext.foodAccessProgramExpenseUsd, 1030888);
  assert.match(review.financialContext.boundary, /not incremental costs or impact prices/i);
  assert.match(review.financialContext.boundary, /none is philanthropic funding room/i);
  assert.ok(review.nativeScale.every((row) => /not|does not/i.test(row.semantics)));
  assert.ok(review.sources.every((source) => source.url && source.published && source.retrieved && source.sourceType));
});

test('Farming Hope model reconciles gross historical cost and keeps a null outside the conditional range', () => {
  const expense = model.inputs.find((input) => input.key === 'fy2024_job_training_expense_usd');
  const apprentices = model.inputs.find((input) => input.key === 'reported_apprentices_trained');
  const unitCost = model.inputs.find((input) => input.key === 'historical_gross_cost_per_reported_apprentice_usd');
  const reportedPlacement = model.inputs.find((input) => input.key === 'reported_employment_within_90_days_of_graduation');
  const transferredEffect = model.inputs.find((input) => input.key === 'mfi_transferred_late_year_any_employment_effect');
  assert.equal(expense.best / apprentices.best, unitCost.best);
  assert.equal(unitCost.best / transferredEffect.best, model.bottomLine.costPerAdditionalPersonEverEmployedInLateFollowUpYearUsd);
  assert.equal(model.bottomLine.giftUsd / unitCost.best * transferredEffect.best, model.bottomLine.estimatedAdditionalPeopleEverEmployedInLateFollowUpYear);
  assert.equal(reportedPlacement.best, 0.71);
  assert.equal(transferredEffect.best, 0.04);
  assert.match(reportedPlacement.basis, /not used as the causal effect/i);
  assert.equal(model.sensitivity.length, 3);
  assert.match(model.nullEffectBoundary, /no finite positive impact price/i);
  assert.ok(model.excludedBenefits.some((item) => /10-QALY/i.test(item)));
});

test('Farming Hope model preserves the late-follow-up employment denominator', () => {
  const trial = model.inputs.find((input) => input.key === 'etjd_pooled_late_year_any_employment_effect');
  assert.equal(trial.best, 0.04);
  assert.equal(trial.low, 0.022);
  assert.equal(trial.high, 0.059);
  assert.match(model.formula.denominatorBoundary, /not continuous 12-month retention/i);
  assert.match(model.fundingRoom.boundary, /does not publish a current apprenticeship-only budget/i);
  assert.match(model.decisionUnit, /unemployment-insurance-covered employment/i);
});
