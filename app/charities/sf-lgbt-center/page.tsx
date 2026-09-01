import type { Metadata } from 'next';
import CharityResearchReport, { type CharityReportContent } from '@/components/CharityResearchReport';
import review from '@/data/san-francisco/sf-lgbt-center-employment-review-v1.json';
import model from '@/data/san-francisco/sf-lgbt-center-employment-cea-v1.json';
import bridge from '@/data/san-francisco/sf-lgbt-center-employment-qaly-bridge-audit-v1.json';

export const metadata: Metadata = {
  title: 'SF LGBT Center Employment Services — charity research | Market for Impact',
  description: 'Our evidence review and conditional cost-effectiveness scenarios for SF LGBT Center employment support.',
  openGraph: { title: 'SF LGBT Center Employment Services — charity research', description: 'A source-grounded employment review that separates reported placements, causal attribution, public funding, and current capacity.', images: [] },
  twitter: { card: 'summary', title: 'SF LGBT Center Employment Services — charity research', description: 'A conditional employment model with an explicit, very-low-confidence health-utility transfer.', images: [] },
};

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const compactMoney = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 });
const number = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });
const percent = new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 1 });
const qalyNumber = new Intl.NumberFormat('en-US', { maximumFractionDigits: 6 });
const expense = model.inputs.find((input) => input.key === 'fy2024_economic_development_expense_usd')!;
const placements = model.inputs.find((input) => input.key === 'reported_living_wage_placements')!;
const attribution = model.inputs.find((input) => input.key === 'conditional_center_attribution_share')!;
const formatInput = (value: number, unit: string) => unit === 'USD' ? money.format(value) : unit === 'proportion' ? percent.format(value) : unit === 'people_floor' ? `${number.format(value)}+ people` : unit === 'placements_floor' ? `${number.format(value)}+ placements` : `${number.format(value)} ${unit}`;

const content: CharityReportContent = {
  organization: 'SF LGBT Center',
  eyebrow: 'CHARITY RESEARCH · SAN FRANCISCO',
  program: 'Employment Services: drop-ins, coaching, career fairs, and employer partnerships',
  donationUrl: review.organization.donationUrl,
  published: '1 September 2026',
  modelVersion: model.version,
  nutshell: {
    headline: 'A trusted employment program with real placement reporting—and no causal denominator yet.',
    body: <>The Center reports supporting <strong>400+ LGBTQ+ job seekers</strong> and helping <strong>30+ people secure living-wage employment in 2024</strong>. Its audit assigns {compactMoney.format(expense.best)} to the broader Economic Development family. If 25% of reported placements were additional because of the Center, the conditional midpoint would be <strong>about {money.format(model.bottomLine.conditionalMidpointCostPerAdditionalPlacementUsd)} per additional placement</strong>. A separate, heavily discounted transfer from a randomized employment-and-utility trial produces a very-low-confidence central estimate of <strong>about {compactMoney.format(bridge.modeledBridge.bestCostPerTenQalysUsd)} per 10 QALYs</strong>. A null effect remains plausible.</>,
    whyItMayWork: 'Affirming coaching, job-search support, career fairs, referrals, and employer partnerships may reduce information, network, confidence, and discrimination-related barriers for LGBTQ+ job seekers.',
    whyWeAreCautious: 'The published placement count lacks a comparison group, service-intensity reconciliation, wage definition, retention, and earnings follow-up; external employment-service effects are small and uncertain on average.',
    recommendationBlocker: 'The Center has not published an employment-specific budget, a dated marginal funding gap, unique participant cohorts, 6- and 12-month job retention and earnings, or evidence that a private gift adds services rather than replacing public or restricted funding.',
  },
  summary: [
    { label: 'GROSS REPORTED BENCHMARK', value: '≈ $42,900', detail: 'broad Economic Development allocation per reported 2024 living-wage placement; not causal' },
    { label: 'CONDITIONAL MIDPOINT', value: '≈ $172,000', detail: 'per additional placement if 25% of reported placements were Center-attributable' },
    { label: 'COST PER BETTER LIFE', value: '≈ $168M', detail: 'per 10 QALYs; very-low-confidence employment and health-utility transfer' },
    { label: 'FUNDING ROOM', value: 'Not published', detail: 'individual coaching enrollment is currently paused' },
  ],
  programSection: {
    body: 'The modeled pathway is a defined cohort of LGBTQ+ job seekers receiving employment support during one reporting year. The Center currently offers weekly drop-ins, career fairs, employer partnership work, and a Trans Employment Program; enrollment for individualized coaching is paused. A recommendation-grade pathway would identify service intensity and follow every eligible participant, including people who do not obtain a placement.',
    steps: [
      { title: 'Enroll a defined cohort', detail: 'Record eligibility, baseline employment and earnings, service history, and whether the participant receives drop-in, workshop, career-fair, or individualized support.' },
      { title: 'Deliver a specified service dose', detail: 'Separate light-touch resume or interview help from ongoing coaching, referrals, training, and employer-facing work.' },
      { title: 'Observe employment', detail: 'Verify wage, hours, benefits, start date, occupation, and whether the role satisfies a pre-specified living-wage threshold.' },
      { title: 'Measure retention and earnings', detail: 'Follow every participant at 6 and 12 months and compare employment and earnings against a credible phased or matched counterfactual.' },
    ],
    boundary: 'The model covers employment support and one additional living-wage placement within the reporting year. It excludes financial counseling, homeownership, small-business services, youth programs, community events, employer culture change, and any unmeasured retention or earnings benefit.',
  },
  model: {
    headline: 'About $172,000 per additional placement in a 25%-attribution scenario—not an empirical effect estimate.',
    body: 'We divide the audited FY2024 Economic Development allocation by the 30-placement reporting floor, then vary the share of reported placements that might be additional because of the Center. The full allocation includes employment, financial, housing, and small-business work, so the $42,942 gross benchmark is only a reconciliation check. The 10%, 25%, and 50% attribution cases are explicit decision scenarios, not confidence bounds. Current program counters use a different, undated denominator and are not mixed into the model.',
    equation: { label: 'CONDITIONAL COST PER ADDITIONAL LIVING-WAGE PLACEMENT', expression: `${money.format(expense.best)} ÷ (${number.format(placements.best)} × ${percent.format(attribution.best)})`, result: `= ${money.format(model.bottomLine.conditionalMidpointCostPerAdditionalPlacementUsd)}` },
    inputColumnLabel: 'Point value / scenario',
    inputs: model.inputs.slice(1).map((input) => ({ key: input.key, label: input.label, confidence: input.confidence, best: formatInput(input.best, input.unit), range: `${formatInput(input.low, input.unit)}–${formatInput(input.high, input.unit)}`, basis: input.basis })),
    giftHeading: `What would ${money.format(model.bottomLine.giftUsd)} imply if the model were linear?`,
    sensitivity: model.sensitivity.map((row) => ({ case: row.case, headline: `${number.format(row.additionalPlacementsPer100k)} additional placements`, detail: `${percent.format(row.attributionShare)} of the reported cohort treated as additional · ${compactMoney.format(row.costPerAdditionalPlacementUsd)} per outcome` })),
    uncertaintyBoundary: model.nullEffectBoundary,
    fundingBoundary: model.fundingRoom.boundary,
  },
  comparisonBridge: {
    headline: 'Our current best estimate: about $168 million per better life (10 QALYs).',
    body: bridge.decision,
    equation: {
      label: 'EXPLORATORY COST PER 10 QALYS · ONE BETTER LIFE',
      expression: `${money.format(bridge.modeledBridge.conditionalCostPerAdditionalPlacementUsd.best)} ÷ ${qalyNumber.format(bridge.modeledBridge.qalyPerAdditionalPlacement.best)} QALY × 10`,
      result: `= ${compactMoney.format(bridge.modeledBridge.bestCostPerTenQalysUsd)}`,
    },
    inputs: [
      { key: 'placement_cost', label: 'Conditional cost per additional placement', confidence: 'very low as a causal or marginal price', best: money.format(bridge.modeledBridge.conditionalCostPerAdditionalPlacementUsd.best), range: `${money.format(bridge.modeledBridge.conditionalCostPerAdditionalPlacementUsd.low)}–${money.format(bridge.modeledBridge.conditionalCostPerAdditionalPlacementUsd.high)}`, basis: bridge.modeledBridge.conditionalCostPerAdditionalPlacementUsd.basis },
      { key: 'trial_employment', label: 'Trial absolute employment effect', confidence: 'moderate for the trial; very low for transfer', best: percent.format(bridge.sourceEvidence.absoluteEmploymentEffect), range: `${percent.format(bridge.sourceEvidence.employmentRateControl)} control → ${percent.format(bridge.sourceEvidence.employmentRateIps)} IPS`, basis: bridge.sourceEvidence.boundary },
      { key: 'trial_qaly', label: 'Trial incremental QALY per participant', confidence: 'low for the trial; very low for transfer', best: String(bridge.sourceEvidence.incrementalQalyPerParticipant.best), range: `${bridge.sourceEvidence.incrementalQalyPerParticipant.low}–${bridge.sourceEvidence.incrementalQalyPerParticipant.high}`, basis: `Measured over ${bridge.sourceEvidence.followUpYears} years. ${bridge.sourceEvidence.boundary}` },
      { key: 'implied_joint_ratio', label: 'Arithmetic QALY per additional job-start anchor', confidence: 'not a mediation estimate', best: number.format(bridge.modeledBridge.externalImpliedQalyPerAdditionalJobStart.best), range: `${number.format(bridge.modeledBridge.externalImpliedQalyPerAdditionalJobStart.low)}–${number.format(bridge.modeledBridge.externalImpliedQalyPerAdditionalJobStart.high)}`, basis: bridge.modeledBridge.externalImpliedQalyPerAdditionalJobStart.basis },
      { key: 'transfer_retention', label: 'Program, population, and mediation transfer retained', confidence: 'judgmental', best: percent.format(bridge.modeledBridge.retainedShareForProgramPopulationAndMediationTransfer.best), range: `${percent.format(bridge.modeledBridge.retainedShareForProgramPopulationAndMediationTransfer.low)}–${percent.format(bridge.modeledBridge.retainedShareForProgramPopulationAndMediationTransfer.high)}`, basis: bridge.modeledBridge.retainedShareForProgramPopulationAndMediationTransfer.basis },
      { key: 'durability', label: 'Placement durability retained', confidence: 'judgmental', best: percent.format(bridge.modeledBridge.retainedShareForPlacementDurability.best), range: `${percent.format(bridge.modeledBridge.retainedShareForPlacementDurability.low)}–${percent.format(bridge.modeledBridge.retainedShareForPlacementDurability.high)}`, basis: bridge.modeledBridge.retainedShareForPlacementDurability.basis },
    ],
    sensitivity: bridge.modeledBridge.sensitivity.map((row) => ({ case: row.case, headline: compactMoney.format(row.costPerTenQalysUsd), detail: `${money.format(row.costPerAdditionalPlacementUsd)} per additional placement · ${qalyNumber.format(row.qalyPerAdditionalPlacement)} QALY each` })),
    boundary: bridge.modeledBridge.nullBoundary,
  },
  evidence: review.evidence,
  reservations: review.reservations,
  excludedBenefits: [...new Set([...model.excludedBenefits.filter((benefit) => !/QALY|life-substantially-bettered/i.test(benefit)), ...bridge.excludedBenefits])],
  sources: [...review.sources, ...bridge.sources.filter((source) => !review.sources.some((existing) => existing.url === source.url))],
};

export default function SfLgbtCenterResearchPage() { return <CharityResearchReport content={content} />; }
