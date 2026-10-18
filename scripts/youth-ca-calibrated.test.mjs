import test from 'node:test';
import assert from 'node:assert/strict';
import {calculate, defaults, cases} from '../lib/youth-ca-calibrated-model.mjs';
import {incomeHealthyYearEquivalent} from '../lib/income-health-equivalence.mjs';
import {readFileSync} from 'node:fs';
import {reportPrice, scenarioIncomeEquivalent, expenseAverage} from '../lib/geography-reports.mjs';

const near = (actual, expected) => assert.ok(Math.abs(actual - expected) <= 1e-10 * Math.max(1, Math.abs(expected)), `${actual} != ${expected}`);
const integrate = (fn, years, steps = 20000) => {
  let sum = 0;
  const width = years / steps;
  for (let i = 0; i < steps; i++) sum += fn((i + .5) * width) * width;
  return sum;
};

test('Central health is reconstructed from finite injury and independent counseling trajectories', () => {
  const s = calculate(), x = defaults;
  const scale = x.gift / x.expense * x.funding;
  const avoided = scale * x.cicAnnual * x.intensiveCompletion * x.injuryRisk * (1 - x.injuryRR);
  const discount = t => (1 + x.discount) ** -t;
  const nonfatal = avoided * (1 - x.fatalShare) * x.nonfatalGap * integrate(t => discount(x.delay + .5 + t), x.nonfatalYears);
  const mortality = avoided * x.fatalShare * x.survivalUtility * integrate(t => Math.exp(-x.competingMortality * t) * discount(x.delay + .5 + t), x.survivalYears);
  const counseling = scale * (x.counselingAnnual - x.cicCounseling - x.pathwaysCounseling) * x.counselingGap * x.counselingResponse * x.counselingUtility * integrate(t => discount(x.delay + t), x.counselingYears);
  near(s.nonfatalYearsAll, nonfatal);
  near(s.mortalityYearsAll, mortality);
  near(s.counselingYearsAll, counseling);
  near(s.healthYearsCA, .0014316240019768853);
  near(s.incomeEquivalentYearsCA, .0006674205041692664);
  near(s.caUsdPerBetterLife, 476407240.0903978);
});

test('Every case agrees with the common income crosswalk, including signed resources and independent burdens', () => {
  for (const overrides of Object.values(cases)) {
    const s = calculate(overrides), x = s.inputs;
    const convert = (people, gain, years, causal, independent, delay, geography) => people > 0 ? incomeHealthyYearEquivalent({people, annualIncomeBeforeUSD:x.baseline, annualIncomeGainUSD:gain, years, causalShare:causal, independentShare:independent, delayYears:delay, editionShare:geography, discountRate:x.discount}) : 0;
    const jobs = convert(s.scale * x.jobsAnnual * x.householdShare, x.jobNetAnnual, x.jobYears, x.jobCausal, x.assignment, x.jobDelay, x.incomeCA);
    const awards = convert(s.scale * x.applicationsAnnual * x.awardSuccess * x.householdShare, x.netAward, 1, x.navigationCausal, x.assignment * (x.netAward > 0 ? x.awardIndependent : 1), x.receiptDelay, x.incomeCA);
    const burden = convert(x.inducedApplicants, -x.applicantLoss, 1, 1, 1, x.delay, x.burdenCA);
    near(s.incomeEquivalentYearsCA, jobs + awards);
    near(s.inducedBurdenYearsCA, burden);
    near(s.combinedYearsCA, s.healthYearsCA + jobs + awards + burden);
    assert.equal(s.caUsdPerBetterLife === null, s.combinedYearsCA <= 0);
  }
});

test('Additional output uses one recipient budget and respects the shared capacity cap', () => {
  const s = calculate();
  near(s.additionalCic / defaults.cicAnnual, s.additionalPathways / defaults.pathwaysAnnual);
  near(s.allocatedIndependentCounseling, s.scale * 42);
  near(calculate({capacityScale:.001}).scale, .001);
  for (const overrides of [{funding:0}, {capacityScale:0}, {assignment:0}]) {
    const result = calculate(overrides);
    near(result.combinedYearsCA, 0);
    assert.equal(result.caUsdPerBetterLife, null);
  }
});

test('Health and resource geography are separate; harms are not erased by positive-benefit overlap', () => {
  const s = calculate();
  near(calculate({healthCA:0}).combinedYearsCA, s.incomeEquivalentYearsCA);
  near(calculate({incomeCA:0}).combinedYearsCA, s.healthYearsCA);
  assert.equal(calculate(cases.noCA).caUsdPerBetterLife, null);
  assert.ok(calculate(cases.harmNoAssignment).combinedYearsCA < 0);
  assert.ok(calculate(cases.negativeEarnings).jobEquivalentYearsAll < 0);
  near(calculate({netAward:-500,awardIndependent:0}).awardEquivalentYearsAll, calculate({netAward:-500,awardIndependent:1}).awardEquivalentYearsAll);
  near(calculate({netAward:500,awardIndependent:0}).awardEquivalentYearsAll, 0);
});

test('Domain rejects malformed, nonfinite, impossible-cohort and unbounded inputs', () => {
  for (const overrides of [null, [], {gift:Infinity}, {gift:100001}, {unknown:1}, {funding:1.1}, {injuryRR:-1}, {jobYears:4}, {netAward:-25000}, {applicantLoss:25000}, {jobsAnnual:75}, {applicationsAnnual:119}, {cicCounseling:90,pathwaysCounseling:18}, {expense:Number.MIN_VALUE,funding:0}, {inducedApplicants:Number.MAX_VALUE,applicantLoss:24999}]) assert.throws(() => calculate(overrides));
  assert.throws(() => calculate(Object.create({gift:1000})));
  assert.throws(() => calculate({injuryRisk:.8, injuryRR:2}), /Intervention injury probability/);
});

test('Costs, finite clinical prognosis and income duration change independently', () => {
  const s = calculate();
  near(calculate({fee:.1}).caUsdPerBetterLife, s.caUsdPerBetterLife * 1.1);
  const partner = calculate({externalPerCourse:750});
  near(partner.caUsdPerBetterLife, s.caUsdPerBetterLife);
  assert.ok(partner.grossUsdPerBetterLife > partner.caUsdPerBetterLife);
  assert.ok(calculate({survivalYears:10}).healthYearsCA > s.healthYearsCA);
  near(calculate({jobYears:1}).jobEquivalentYearsAll, s.jobEquivalentYearsAll * 2);
  near(calculate({jobYears:1}).healthYearsCA, s.healthYearsCA);
  near(calculate({fatalShare:0}).mortalityYearsAll, 0);
});

test('Registry prices every scenario with health and resources once, retaining historical comparison and true timing', () => {
  const data = JSON.parse(readFileSync(new URL('../data/geography-reports.json', import.meta.url)));
  const report = data.reports.find(r => r.edition === 'california' && r.slug === 'youth-alive');
  for (const [id, overrides] of Object.entries(cases)) {
    const s = report.model.scenarios.find(s => s.id === id), v = calculate(overrides);
    assert.ok(s, id);
    near(s.editionQalys, v.healthYearsCA);
    near(s.allPopulationQalys, v.healthYearsAll);
    near(scenarioIncomeEquivalent(s), v.incomeEquivalentYearsCA + v.inducedBurdenYearsCA);
    near(s.editionQalys + scenarioIncomeEquivalent(s), v.combinedYearsCA);
  }
  near(reportPrice(report), calculate().caUsdPerBetterLife);
  near(expenseAverage(report), 7208761.333333333);
  const historical = report.model.scenarios.find(s => s.id === 'historical-prior-health-central');
  near(historical.editionQalys, .0365823609957567);
  assert.match(report.sections.cost, /476\.4M/);
  assert.doesNotMatch(report.sections.what, /withdrawn/);
  for (const id of ['7af4bb8a-833d-4c52-bc32-a8f73873750a', 'youth-root-source-check-20261001']) {
    const matches = data.sessions.filter(s => s.id === id);
    assert.equal(matches.length, 1);
    assert.ok(report.sessionIds.includes(id));
    assert.equal(matches[0].model.id, 'gpt-6.1-sol');
    assert.match(matches[0].model.evidence, /User-confirmed model assignment/);
  }
  assert.equal(data.reports.filter(r => r.edition === 'california').length, 25);
  assert.equal(data.reports.filter(r => r.edition === 'california' && r.stage === 'beta').length, 10);
});
