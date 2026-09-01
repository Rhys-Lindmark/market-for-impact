import type { Metadata } from 'next';
import CharityResearchReport, { type CharityReportContent } from '@/components/CharityResearchReport';
import review from '@/data/san-francisco/curry-senior-center-review-v1.json';
import model from '@/data/san-francisco/curry-senior-center-cea-v1.json';
import bridgeAudit from '@/data/san-francisco/curry-senior-center-qaly-bridge-audit-v1.json';

export const metadata: Metadata = {
  title: 'Curry Senior Center — charity research | Market for Impact',
  description: 'Our evidence review and exploratory cost-effectiveness model for Curry Senior Center’s Senior Vitality program.',
  openGraph: { title: 'Curry Senior Center — charity research', description: 'A source-grounded review and inspectable Senior Vitality cost-effectiveness model.', images: [] },
  twitter: { card: 'summary', title: 'Curry Senior Center — charity research', description: 'A source-grounded review and inspectable Senior Vitality cost-effectiveness model.', images: [] },
};

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const compactMoney = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 });
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
  published: '31 August 2026',
  modelVersion: model.version,
  nutshell: {
    headline: 'A rich one-year program. Encouraging local change. Very uncertain causal value.',
    body: <>Curry’s Senior Vitality program gives low-income older adults equipment, first-year internet, group instruction, tutoring, and health coaching. Among 90 followed participants, loneliness improved by 0.24 standard deviations over 12 months, but the study had no comparison group. Our exploratory model estimates <strong>about {money.format(model.bottomLine.costPerAdditionalMeaningfulImprovementUsd)} per additional participant crossing a modeled 0.5 SD loneliness-improvement threshold</strong>. Conditional on a positive effect, the range is <strong>{compactMoney.format(model.bottomLine.conditionalPositiveEffectRangeUsd.low)}–{compactMoney.format(model.bottomLine.conditionalPositiveEffectRangeUsd.high)}</strong>; a null or harmful effect remains plausible.</>,
    whyItMayWork: 'The program removes device and connectivity barriers while combining repeated instruction, peer contact, tutoring, and health coaching over a full year.',
    whyWeAreCautious: 'The local study is uncontrolled, 16 of 106 baseline participants lacked follow-up, delivery overlaps the pandemic, and external randomized evidence is heterogeneous.',
    recommendationBlocker: 'Curry has not published current Senior Vitality program accounts, a causal responder estimate, or a time-bounded plan showing that private money adds cohort slots rather than replacing public funding.',
  },
  summary: [
    { label: 'OUR BEST GUESS', value: '≈ $170K', detail: 'per additional participant crossing a modeled 0.5 SD loneliness-improvement threshold at 12 months' },
    { label: 'POSITIVE-EFFECT SENSITIVITY', value: '$38K–$2.3M', detail: 'conditional on a positive causal effect; null or harm remains plausible' },
    { label: '$ PER 10 QALYS · ONE BETTER LIFE', value: 'Not yet convertible', detail: 'six explicit evidence gates fail; the native loneliness model remains visible below' },
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
  comparisonAudit: {
    headline: 'Not yet convertible to $ per 10 QALYs—and the native outcome is itself modeled.',
    body: bridgeAudit.decision,
    candidate: {
      label: 'BEST CANDIDATE HEALTH-UTILITY EVIDENCE',
      value: '0.04 utility gap / year',
      detail: 'Two observational chronic-condition studies reported a 0.04 gap between lonely and not-lonely groups. That association cannot be substituted for Curry’s modeled 0.5-SD threshold crossing.',
    },
    failedGates: bridgeAudit.failedGates.map((gate) => ({ key: gate.key, label: gate.label, why: gate.why })),
    illustrative: {
      expression: bridgeAudit.illustrativeCounterfactual.arithmetic,
      result: `= ${compactMoney.format(bridgeAudit.illustrativeCounterfactual.resultUsd)}`,
      boundary: bridgeAudit.illustrativeCounterfactual.publicationBoundary,
    },
    requiredEvidence: bridgeAudit.requiredEvidence,
  },
  evidence: review.evidence,
  reservations: review.reservations,
  excludedBenefits: model.excludedBenefits,
  sources: [...review.sources, ...bridgeAudit.sources.filter((source) => !review.sources.some((existing) => existing.url === source.url))],
};

export default function CurrySeniorCenterResearchPage() {
  return <CharityResearchReport content={content} />;
}
