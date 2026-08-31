import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { buildSfNonprofitDiligence, validateSfNonprofitDiligence } from './lib/sf-nonprofit-diligence.mjs';

const load = (path) => JSON.parse(fs.readFileSync(path, 'utf8'));
const config = load('data/san-francisco/nonprofit-diligence-config-v1.json');
const publicFunding = load('data/san-francisco/public-funding-v1.json');
const ledgers = { coefficient: load('data/coefficient/all-grants.json'), givewell: load('data/normalized/givewell-grants.json'), givingGreen: load('data/giving-green/recommendations-2025-2026.json'), renphil: load('data/renphil/ai-for-math-2025.json') };
const snapshot = buildSfNonprofitDiligence({ config, publicFunding, ledgers });

test('SF diligence cohort is reproducible and keeps conversions blocked', () => {
  validateSfNonprofitDiligence(snapshot);
  assert.equal(snapshot.candidates.length, 6);
  assert.equal(snapshot.summary.qalyBlockedCount, 6);
  assert.equal(snapshot.summary.candidatesWithPublishedMarginalGap, 0);
  assert.equal(snapshot.summary.evidenceDossierCount, 6);
});

test('public-contract aliases reconcile exact accounting totals', () => {
  const hamilton = snapshot.candidates.find((row) => row.key === 'hamilton-families');
  const foodBank = snapshot.candidates.find((row) => row.key === 'sf-marin-food-bank');
  const center = snapshot.candidates.find((row) => row.key === 'sf-lgbt-center');
  const glide = snapshot.candidates.find((row) => row.key === 'glide');
  assert.deepEqual([hamilton.publicFunding.contractCount, foodBank.publicFunding.contractCount, center.publicFunding.contractCount, glide.publicFunding.contractCount], [8, 8, 5, 14]);
  assert.equal(hamilton.publicFunding.awardUsd, 60051037);
  assert.equal(foodBank.publicFunding.awardUsd, 23938671);
  assert.equal(center.publicFunding.awardUsd, 14528741);
  assert.equal(glide.publicFunding.awardUsd, 50205192);
});

test('ratings never masquerade as impact evidence', () => {
  const hamilton = snapshot.candidates.find((row) => row.key === 'hamilton-families');
  const glide = snapshot.candidates.find((row) => row.key === 'glide');
  assert.equal(hamilton.charityNavigator.completedBeaconCount, 1);
  assert.match(hamilton.charityNavigator.note, /not an impact estimate/i);
  assert.equal(glide.charityNavigator.rating, null);
  assert.match(glide.charityNavigator.note, /not a negative impact finding/i);
});

test('accepted grant ledgers are cross-checked without fuzzy identity merging', () => {
  assert.equal(snapshot.summary.acceptedGrantLedgerMatchCount, 1);
  const hac = snapshot.candidates.find((row) => row.key === 'housing-action-coalition');
  assert.deepEqual(hac.acceptedGrantLedgerMatches, [{ publisher: 'Coefficient Giving', recordId: 'grants-36116-0', name: 'Housing Action Coalition' }]);
});

test('Hamilton dossier separates reported results from external evidence and unresolved donor questions', () => {
  const hamilton = snapshot.candidates.find((row) => row.key === 'hamilton-families');
  const dossier = hamilton.evidenceDossier;
  assert.match(dossier.decisionState, /blocked/);
  assert.equal(dossier.organizationReported.outcomes.length, 4);
  assert.equal(dossier.organizationReported.financials.revenueUsd, 17410740);
  assert.equal(dossier.organizationReported.financials.governmentRevenueUsd + dossier.organizationReported.financials.privateRevenueUsd + dossier.organizationReported.financials.investmentAndOtherRevenueUsd, dossier.organizationReported.financials.revenueUsd);
  assert.equal(dossier.organizationReported.financials.programExpensesUsd + dossier.organizationReported.financials.fundraisingExpensesUsd + dossier.organizationReported.financials.administrationExpensesUsd, dossier.organizationReported.financials.expensesUsd);
  assert.equal(dossier.evidenceLayers.length, 4);
  assert.match(dossier.evidenceLayers.find((layer) => layer.publisher === 'Urban Institute').transferLimit, /not an outcome impact evaluation/i);
  assert.equal(dossier.evidenceLayers.find((layer) => layer.publisher === 'Housing Solutions Lab').status, 'results pending');
  assert.match(dossier.evidenceLayers.find((layer) => layer.title === 'Family Options Study').transferLimit, /not Hamilton-specific/i);
  assert.ok(dossier.missingForRecommendation.some((gap) => /marginal plan/i.test(gap)));
});

test('Food Bank dossier separates distributed volume, monitored reporting, and transferable causal evidence', () => {
  const foodBank = snapshot.candidates.find((row) => row.key === 'sf-marin-food-bank');
  const dossier = foodBank.evidenceDossier;
  const finances = dossier.organizationReported.financials;
  assert.match(dossier.decisionState, /blocked/);
  assert.equal(dossier.organizationReported.outcomes.length, 4);
  assert.equal(finances.donatedFoodAndInKindRevenueUsd + finances.governmentFoodCommoditiesUsd + finances.governmentGrantsUsd + finances.privateRevenueUsd + finances.otherRevenueUsd, finances.revenueUsd);
  assert.equal(finances.programExpensesUsd + finances.fundraisingExpensesUsd + finances.administrationExpensesUsd, finances.expensesUsd);
  assert.match(finances.boundary, /cash cost per household/i);
  assert.equal(dossier.evidenceLayers.length, 4);
  assert.match(dossier.evidenceLayers.find((layer) => layer.publisher === 'City and County of San Francisco').transferLimit, /no comparison group/i);
  assert.match(dossier.evidenceLayers.find((layer) => layer.publisher === 'Public Health Nutrition').transferLimit, /heterogeneous for meta-analysis/i);
  assert.match(dossier.evidenceLayers.find((layer) => layer.publisher === 'American Journal of Preventive Medicine').design, /randomized trial/i);
  assert.ok(dossier.missingForRecommendation.some((gap) => /\$100,000.*\$1 million.*\$10 million/i.test(gap)));
});

test('SF LGBT Center dossier separates reported reach, audited allocation, and transferable evidence', () => {
  const center = snapshot.candidates.find((row) => row.key === 'sf-lgbt-center');
  const dossier = center.evidenceDossier;
  const finances = dossier.organizationReported.financials;
  assert.match(dossier.decisionState, /blocked/);
  assert.equal(dossier.organizationReported.outcomes.length, 4);
  assert.equal(finances.governmentGrantsUsd + finances.donationsUsd + finances.foundationAndCorporateUsd + finances.fundraisingEventsUsd + finances.facilityRentalUsd + finances.programRevenueUsd, finances.revenueUsd);
  assert.equal(finances.programExpensesUsd + finances.fundraisingExpensesUsd + finances.administrationExpensesUsd, finances.expensesUsd);
  assert.equal(finances.economicDevelopmentExpensesUsd + finances.communityProgramExpensesUsd + finances.buildingServicesExpensesUsd + finances.youthProgramExpensesUsd, finances.programExpensesUsd);
  assert.match(finances.boundary, /retained job/i);
  assert.equal(dossier.evidenceLayers.length, 4);
  assert.match(dossier.evidenceLayers.find((layer) => layer.publisher === 'SF LGBT Center and Intention 2 Impact').design, /248 community members/i);
  assert.match(dossier.evidenceLayers.find((layer) => layer.publisher === 'Campbell Collaboration').finding, /small average gains/i);
  assert.match(dossier.evidenceLayers.find((layer) => layer.publisher === 'Research on Social Work Practice').transferLimit, /gender and sexual minority youth/i);
  assert.ok(dossier.missingForRecommendation.some((gap) => /\$100,000.*\$1 million.*\$10 million/i.test(gap)));
});

test('GLIDE dossier separates multi-service scale, public funding, and program evidence', () => {
  const glide = snapshot.candidates.find((row) => row.key === 'glide');
  const dossier = glide.evidenceDossier;
  const finances = dossier.organizationReported.financials;
  assert.match(dossier.decisionState, /blocked/);
  assert.equal(dossier.organizationReported.outcomes.length, 4);
  assert.equal(finances.contributionsGrantsAndSupportUsd + finances.contractRevenueUsd + finances.specialEventsNetUsd + finances.donatedGoodsAndServicesUsd + finances.otherIncomeUsd + finances.interestAndInvestmentIncomeUsd, finances.revenueUsd);
  assert.equal(finances.programExpensesUsd + finances.churchExpensesUsd + finances.administrationExpensesUsd + finances.fundraisingExpensesUsd, finances.expensesUsd);
  assert.match(finances.boundary, /consolidate the Foundation.*Church.*real-estate/i);
  assert.equal(dossier.evidenceLayers.length, 4);
  assert.match(dossier.evidenceLayers.find((layer) => layer.publisher === 'City and County of San Francisco').finding, /\$14\.12 million/i);
  assert.match(dossier.evidenceLayers.find((layer) => layer.publisher === 'JAMA Health Forum').transferLimit, /does not estimate the effect of GLIDE/i);
  assert.match(dossier.evidenceLayers.find((layer) => layer.publisher === 'Campbell Systematic Reviews').finding, /did not improve mental health/i);
  assert.match(dossier.evidenceLayers.find((layer) => layer.publisher === 'JAMA Psychiatry').design, /74 randomized clinical trials/i);
  assert.ok(dossier.missingForRecommendation.some((gap) => /\$100,000.*\$1 million.*\$10 million/i.test(gap)));
});

test('Housing Action Coalition dossier separates contribution evidence from attribution and downstream housing effects', () => {
  const hac = snapshot.candidates.find((row) => row.key === 'housing-action-coalition');
  const dossier = hac.evidenceDossier;
  const finances = dossier.organizationReported.financials;
  assert.match(dossier.decisionState, /blocked/);
  assert.equal(dossier.organizationReported.outcomes.length, 4);
  assert.equal(finances.membershipDuesUsd + finances.fundraisingEventContributionsUsd + finances.relatedOrganizationContributionsUsd + finances.otherContributionsUsd + finances.netFundraisingEventLossUsd + finances.otherRevenueUsd, finances.revenueUsd);
  assert.equal(finances.programExpensesUsd + finances.administrationExpensesUsd + finances.fundraisingExpensesUsd, finances.expensesUsd);
  assert.equal(finances.assetsUsd - finances.liabilitiesUsd, finances.netAssetsUsd);
  assert.match(finances.boundary, /501\(c\)\(3\).*not the 501\(c\)\(4\)/i);
  assert.equal(dossier.evidenceLayers.length, 4);
  assert.match(dossier.evidenceLayers.find((layer) => layer.publisher === 'California Legislative Information').transferLimit, /does not identify HAC's contribution/i);
  assert.match(dossier.evidenceLayers.find((layer) => layer.publisher === 'Coefficient Giving').finding, /\$120,000/i);
  assert.match(dossier.evidenceLayers.find((layer) => layer.publisher === 'UC Berkeley').transferLimit, /cannot convert 4,500 legally feasible units/i);
  assert.match(dossier.evidenceLayers.find((layer) => layer.publisher === 'Journal of Planning Literature').finding, /mixed results/i);
  assert.ok(dossier.missingForRecommendation.some((gap) => /causal share/i.test(gap)));
  assert.ok(dossier.missingForRecommendation.some((gap) => /\$100,000.*\$1 million.*\$10 million/i.test(gap)));
});

test('GrowSF dossier separates electoral reach, aligned results, causal attribution, and downstream outcomes', () => {
  const growsf = snapshot.candidates.find((row) => row.key === 'growsf');
  const dossier = growsf.evidenceDossier;
  const finances = dossier.organizationReported.financials;
  assert.equal(growsf.ein, '85-2716857');
  assert.match(dossier.decisionState, /blocked/);
  assert.equal(dossier.organizationReported.outcomes.length, 4);
  assert.equal(finances.contributionsUsd + finances.investmentIncomeUsd, finances.revenueUsd);
  assert.equal(finances.assetsUsd - finances.liabilitiesUsd, finances.netAssetsUsd);
  assert.match(finances.boundary, /not deductible.*federal income-tax/i);
  assert.equal(dossier.evidenceLayers.length, 4);
  assert.match(dossier.evidenceLayers.find((layer) => layer.publisher === 'San Francisco Department of Elections').transferLimit, /does not identify GrowSF exposure/i);
  assert.match(dossier.evidenceLayers.find((layer) => layer.publisher === 'San Francisco Ethics Commission').finding, /\$274,429\.61/i);
  assert.match(dossier.evidenceLayers.find((layer) => layer.publisher === 'American Political Science Review').finding, /average persuasive effect of zero/i);
  assert.match(dossier.evidenceLayers.find((layer) => layer.publisher === 'Political Behavior').transferLimit, /not an endorsing San Francisco guide/i);
  assert.ok(dossier.missingForRecommendation.some((gap) => /\$100,000.*\$1 million.*\$10 million/i.test(gap)));
  assert.ok(dossier.missingForRecommendation.some((gap) => /QALY.*WELLBY.*life-substantially-bettered/i.test(gap)));
});
