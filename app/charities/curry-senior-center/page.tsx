import type { Metadata } from 'next';
import CharityResearchReport, { type CharityReportContent } from '@/components/CharityResearchReport';
import review from '@/data/san-francisco/curry-senior-center-review-v1.json';
import model from '@/data/san-francisco/curry-senior-center-cea-v1.json';
import bridge from '@/data/san-francisco/curry-senior-center-qaly-bridge-audit-v1.json';

export const metadata: Metadata = {
  title: 'Curry Senior Center — charity research | Market for Impact',
  description: 'Our evidence review and exploratory cost-effectiveness model for Curry Senior Center’s Senior Vitality program.',
  openGraph: { title: 'Curry Senior Center — charity research', description: 'A source-grounded review and inspectable Senior Vitality cost-effectiveness model.', images: [] },
  twitter: { card: 'summary', title: 'Curry Senior Center — charity research', description: 'A source-grounded review and inspectable Senior Vitality cost-effectiveness model.', images: [] },
};

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const compactMoney = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 });
const bridgeMoney = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 2 });
const number = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });
const percent = new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 1 });
const cost = model.inputs.find((input) => input.key === 'marginal_cost_per_participant_usd')!;
const response = model.inputs.find((input) => input.key === 'incremental_meaningful_improvement_probability')!;
const formatInput = (value: number, unit: string) => {
  if (unit === 'USD') return money.format(value);
  if (unit === 'proportion') return percent.format(value);
  return `${number.format(value)} ${unit}`;
};

const content: CharityReportContent = {
  organization: 'Curry Senior Center',
  eyebrow: 'CHARITY RESEARCH · SAN FRANCISCO',
  program: 'Senior Vitality technology access, digital literacy, social connection, and health coaching',
  donationUrl: review.organization.donationUrl,
  published: '1 September 2026',
  modelVersion: model.version,
  nutshell: {
    headline: 'A rich one-year program. Encouraging local change. Very uncertain causal value.',
    body: <>Curry’s Senior Vitality program gives low-income older adults equipment, first-year internet, group instruction, tutoring, and health coaching. Among 90 followed participants, loneliness improved by 0.24 standard deviations over 12 months, but the study had no comparison group. Our native model estimates <strong>about {money.format(model.bottomLine.costPerAdditionalMeaningfulImprovementUsd)} per additional participant crossing a modeled 0.5 SD loneliness-improvement threshold</strong>. A separate participant-level health-utility transfer produces a very-low-confidence central estimate of <strong>about {bridgeMoney.format(bridge.modeledBridge.bestCostPerTenQalysUsd)} per 10 QALYs</strong>. Both models have wide positive-effect ranges, and a null or harmful effect remains plausible.</>,
    whyItMayWork: 'The program removes device and connectivity barriers while combining repeated instruction, peer contact, tutoring, and health coaching over a full year.',
    whyWeAreCautious: 'The local study is uncontrolled, 16 of 106 baseline participants lacked follow-up, delivery overlaps the pandemic, and external randomized evidence is heterogeneous.',
    recommendationBlocker: 'Curry has not published current Senior Vitality program accounts, a causal responder estimate, or a time-bounded plan showing that private money adds cohort slots rather than replacing public funding.',
  },
  summary: [
    { label: 'OUR BEST GUESS', value: '≈ $170K', detail: 'per additional participant crossing a modeled 0.5 SD loneliness-improvement threshold at 12 months' },
    { label: 'POSITIVE-EFFECT SENSITIVITY', value: '$38K–$2.3M', detail: 'conditional on a positive causal effect; null or harm remains plausible' },
    { label: 'COST PER BETTER LIFE', value: '≈ $30M', detail: 'per 10 QALYs; very-low-confidence loneliness/utility transfer' },
    { label: 'FUNDING ROOM', value: 'Not published', detail: 'the modeled $100,000 is illustrative, not verified cohort capacity' },
  ],
  programSection: {
    body: 'Senior Vitality is currently described as a one- to two-year program. The one-year pathway modeled here enrolls cohorts of up to 15 older adults, supplies an iPad, Fitbit, scale, and home internet, then combines technology classes, individual support, social connection, and health coaching. The intended mechanism is both instrumental and social: access plus confidence may help participants connect with people, information, and healthcare while the cohort itself creates repeated contact.',
    steps: [
      { title: 'Enroll', detail: 'Staff screen referred older adults and organize language-accessible cohorts of up to 15.' },
      { title: 'Equip', detail: 'Participants receive an iPad, Fitbit, scale, setup help, and first-year home internet.' },
      { title: 'Learn and connect', detail: 'Group classes, tutoring, technical support, and health coaching run over the modeled year.' },
      { title: 'Measure', detail: 'Loneliness and related outcomes are assessed at baseline and 12 months.' },
    ],
    boundary: 'The model covers the studied year-one Senior Vitality bundle only. It does not price Curry’s meals, clinic, housing, groceries, outreach, behavioral health, Drop-In Center, or the later Maintenance Program. FY2025 technology-support hours are not equivalent to participants completing this pathway.',
  },
  model: {
    headline: 'Our current model: roughly $170,000 per additional meaningful loneliness improvement.',
    body: 'We first build a $4,800 judgmental marginal cost for one year of equipment, connectivity, instruction, tutoring, coaching, partner resources, and overhead. We then attribute one-third of the observed 0.24 SD within-person change to the program, giving a best-guess causal mean shift of 0.08 SD. A normal-shift approximation converts that mean shift into a 2.9% incremental chance of crossing a 0.5 SD participant-level improvement threshold. Every modeled input is visible and replaceable.',
    equation: { label: 'MODELED COST PER ADDITIONAL 0.5 SD IMPROVER', expression: `${money.format(cost.best)} ÷ ${percent.format(response.best)}`, result: `= ${money.format(model.bottomLine.costPerAdditionalMeaningfulImprovementUsd)}` },
    inputs: model.inputs.slice(1).map((input) => ({ key: input.key, label: input.label, confidence: input.confidence, best: formatInput(input.best, input.unit), range: `${formatInput(input.low, input.unit)}–${formatInput(input.high, input.unit)}`, basis: input.basis })),
    giftHeading: `What would ${money.format(model.bottomLine.giftUsd)} buy?`,
    sensitivity: model.sensitivity.map((row) => ({ case: row.case, headline: `${number.format(row.additionalMeaningfulImprovementsPer100k)} additional threshold improvements`, detail: `${number.format(row.participantsPer100k)} participants · ${compactMoney.format(row.costPerAdditionalMeaningfulImprovementUsd)} each` })),
    uncertaintyBoundary: model.nullEffectBoundary,
    fundingBoundary: model.fundingRoom.boundary,
  },
  comparisonBridge: {
    headline: 'Our current best estimate: about $30 million per better life (10 QALYs).',
    body: bridge.decision,
    equation: {
      label: 'EXPLORATORY COST PER 10 QALYS · ONE BETTER LIFE',
      expression: `${money.format(bridge.modeledBridge.modeledDonorCostPerParticipantUsd.best)} ÷ ${bridge.modeledBridge.qalyPerParticipant.best} QALY × 10`,
      result: `= ${bridgeMoney.format(bridge.modeledBridge.bestCostPerTenQalysUsd)}`,
    },
    inputs: [
      { key: 'donor_cost', label: 'Modeled donor cost per participant', confidence: 'very low as a marginal price', best: money.format(bridge.modeledBridge.modeledDonorCostPerParticipantUsd.best), range: `${money.format(bridge.modeledBridge.modeledDonorCostPerParticipantUsd.low)}–${money.format(bridge.modeledBridge.modeledDonorCostPerParticipantUsd.high)}`, basis: bridge.modeledBridge.modeledDonorCostPerParticipantUsd.basis },
      { key: 'utility_gap', label: 'Observed annual lonely-versus-not-lonely utility gap', confidence: 'very low as a causal transfer', best: String(bridge.sourceEvidence.annualLonelyVsNotLonelyUtilityGap), range: 'Published contrast used as point anchor', basis: bridge.sourceEvidence.utilityGapBasis },
      { key: 'causal_shift', label: 'Causal loneliness mean shift', confidence: 'very low', best: `${bridge.modeledBridge.causalLonelinessMeanShiftSd.best} SD`, range: `${bridge.modeledBridge.causalLonelinessMeanShiftSd.low}–${bridge.modeledBridge.causalLonelinessMeanShiftSd.high} SD`, basis: bridge.modeledBridge.causalLonelinessMeanShiftSd.basis },
      { key: 'transition', label: 'Full lonely-to-not-lonely transition', confidence: 'judgmental mapping', best: `${bridge.modeledBridge.fullLonelinessTransitionSd.best} SD`, range: 'Fixed decision anchor', basis: bridge.modeledBridge.fullLonelinessTransitionSd.basis },
      { key: 'retention', label: 'Share of observational utility gap retained', confidence: 'judgmental transfer', best: percent.format(bridge.modeledBridge.retainedShareOfObservedUtilityGap.best), range: `${percent.format(bridge.modeledBridge.retainedShareOfObservedUtilityGap.low)}–${percent.format(bridge.modeledBridge.retainedShareOfObservedUtilityGap.high)}`, basis: bridge.modeledBridge.retainedShareOfObservedUtilityGap.basis },
      { key: 'duration', label: 'Effective utility duration', confidence: 'judgmental', best: `${bridge.modeledBridge.effectiveDurationYears.best} year`, range: `${bridge.modeledBridge.effectiveDurationYears.low}–${bridge.modeledBridge.effectiveDurationYears.high} year`, basis: bridge.modeledBridge.effectiveDurationYears.basis },
    ],
    sensitivity: bridge.modeledBridge.sensitivity.map((row) => ({ case: row.case, headline: bridgeMoney.format(row.costPerTenQalysUsd), detail: `${money.format(row.donorCostPerParticipantUsd)} per participant · ${row.qalyPerParticipant} QALY each` })),
    boundary: `${bridge.modeledBridge.nullBoundary} ${bridge.sourceEvidence.boundary}`,
  },
  evidence: review.evidence,
  reservations: review.reservations,
  excludedBenefits: [...new Set([...model.excludedBenefits, ...bridge.excludedBenefits])],
  sources: [...review.sources, ...bridge.sources.filter((source) => !review.sources.some((existing) => existing.url === source.url))],
};

export default function CurrySeniorCenterResearchPage() {
  return <CharityResearchReport content={content} />;
}
