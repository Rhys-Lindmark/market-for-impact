import type { Metadata } from 'next';
import CharityResearchReport, { type CharityReportContent } from '@/components/CharityResearchReport';
import review from '@/data/san-francisco/sf-lgbt-center-employment-review-v1.json';
import model from '@/data/san-francisco/sf-lgbt-center-employment-cea-v1.json';

export const metadata: Metadata = {
  title: 'SF LGBT Center Employment Services — charity research | Market for Impact',
  description: 'Our evidence review and conditional cost-effectiveness scenarios for SF LGBT Center employment support.',
  openGraph: { title: 'SF LGBT Center Employment Services — charity research', description: 'A source-grounded employment review that separates reported placements, causal attribution, public funding, and current capacity.', images: [] },
  twitter: { card: 'summary', title: 'SF LGBT Center Employment Services — charity research', description: 'A conditional employment model with an explicit null case and no invented QALY conversion.', images: [] },
};

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const compactMoney = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 });
const number = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });
const percent = new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 0 });
const expense = model.inputs.find((input) => input.key === 'fy2024_economic_development_expense_usd')!;
const placements = model.inputs.find((input) => input.key === 'reported_living_wage_placements')!;
const attribution = model.inputs.find((input) => input.key === 'conditional_center_attribution_share')!;
const formatInput = (value: number, unit: string) => unit === 'USD' ? money.format(value) : unit === 'proportion' ? percent.format(value) : unit === 'people_floor' ? `${number.format(value)}+ people` : unit === 'placements_floor' ? `${number.format(value)}+ placements` : `${number.format(value)} ${unit}`;

const content: CharityReportContent = {
  organization: 'SF LGBT Center',
  eyebrow: 'CHARITY RESEARCH · SAN FRANCISCO',
  program: 'Employment Services: drop-ins, coaching, career fairs, and employer partnerships',
  donationUrl: review.organization.donationUrl,
  published: '31 August 2026',
  modelVersion: model.version,
  nutshell: {
    headline: 'A trusted employment program with real placement reporting—and no causal denominator yet.',
    body: <>The Center reports supporting <strong>400+ LGBTQ+ job seekers</strong> and helping <strong>30+ people secure living-wage employment in 2024</strong>. Its audit assigns {compactMoney.format(expense.best)} to the broader Economic Development family. That produces a <strong>{money.format(model.bottomLine.reportedGrossCostPerPlacementBenchmarkUsd)} gross accounting benchmark per reported placement</strong>, not a causal price. If 25% of reported placements were additional because of the Center, the conditional midpoint would be <strong>about {money.format(model.bottomLine.conditionalMidpointCostPerAdditionalPlacementUsd)} per additional placement</strong>. A null effect remains plausible.</>,
    whyItMayWork: 'Affirming coaching, job-search support, career fairs, referrals, and employer partnerships may reduce information, network, confidence, and discrimination-related barriers for LGBTQ+ job seekers.',
    whyWeAreCautious: 'The published placement count lacks a comparison group, service-intensity reconciliation, wage definition, retention, and earnings follow-up; external employment-service effects are small and uncertain on average.',
    recommendationBlocker: 'The Center has not published an employment-specific budget, a dated marginal funding gap, unique participant cohorts, 6- and 12-month job retention and earnings, or evidence that a private gift adds services rather than replacing public or restricted funding.',
  },
  summary: [
    { label: 'GROSS REPORTED BENCHMARK', value: '≈ $42,900', detail: 'broad Economic Development allocation per reported 2024 living-wage placement; not causal' },
    { label: 'CONDITIONAL MIDPOINT', value: '≈ $172,000', detail: 'per additional placement if 25% of reported placements were Center-attributable' },
    { label: '10-QALY LIFE BETTERED', value: 'Not estimated', detail: 'employment duration, income, health pathway, and counterfactual are not measured' },
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
  evidence: review.evidence,
  reservations: review.reservations,
  excludedBenefits: model.excludedBenefits,
  sources: review.sources,
};

export default function SfLgbtCenterResearchPage() { return <CharityResearchReport content={content} />; }
