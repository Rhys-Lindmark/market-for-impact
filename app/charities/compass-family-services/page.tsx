import type { Metadata } from 'next';
import CharityResearchReport, { type CharityReportContent } from '@/components/CharityResearchReport';
import review from '@/data/san-francisco/compass-family-services-review-v1.json';
import model from '@/data/san-francisco/compass-c-rent-cea-v1.json';
import bridgeAudit from '@/data/san-francisco/compass-c-rent-qaly-bridge-audit-v1.json';

export const metadata: Metadata = {
  title: 'Compass C-Rent homelessness prevention — charity research | Market for Impact',
  description: 'Our evidence review and exploratory historical cost-effectiveness model for Compass Family Services C-Rent.',
  openGraph: { title: 'Compass Family Services — charity research', description: 'A source-grounded review and inspectable family-homelessness-prevention model.', images: [] },
  twitter: { card: 'summary', title: 'Compass Family Services — charity research', description: 'A source-grounded review and inspectable family-homelessness-prevention model.', images: [] },
};

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const compactMoney = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 });
const number = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });
const percent = new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 1 });
const cost = model.inputs.find((input) => input.key === 'gross_accounting_cost_per_reported_family_usd')!;
const effect = model.inputs.find((input) => input.key === 'causal_six_month_homelessness_reduction')!;
const evidenceKeys = new Set(['compass-c-rent-reporting', 'compass-c-rent-audit', 'santa-clara-prevention-rct', 'compass-prevention-public-contract']);
const formatInput = (value: number, unit: string) => {
  if (unit === 'USD') return money.format(value);
  if (unit === 'proportion') return percent.format(value);
  return `${number.format(value)} ${unit}`;
};

const content: CharityReportContent = {
  organization: 'Compass Family Services',
  eyebrow: 'CHARITY RESEARCH · SAN FRANCISCO',
  program: 'C-Rent back-rent and move-in assistance, case management, and problem-solving for families at risk of homelessness',
  donationUrl: review.organization.donationUrl,
  published: '31 August 2026',
  modelVersion: model.version,
  nutshell: {
    headline: 'A concrete prevention pathway. Strong transferred evidence. No Compass counterfactual.',
    body: <>Compass reports that financial support prevented homelessness for <strong>207 at-risk families</strong> in FY2025. Its audit assigns <strong>{money.format(model.inputs.find((input) => input.key === 'audited_c_rent_program_expense_usd')!.best)}</strong> to C-Rent, or <strong>about {money.format(cost.best)} per reported family</strong>. Applying a discounted 2.0-point effect from a geographically relevant randomized trial gives a conditional estimate of <strong>about {money.format(model.bottomLine.costPerAdditionalHomelessnessEpisodeAvertedUsd)} per additional six-month homelessness episode averted</strong>. A null effect remains plausible.</>,
    whyItMayWork: 'A temporary rent or move-in cash gap can trigger eviction and shelter entry even when a family could otherwise sustain housing. C-Rent pairs direct assistance with case management and problem-solving.',
    whyWeAreCautious: 'The 207-family count is an administrative classification without a comparison or published follow-up, and the closest randomized study found stronger effects for households without children.',
    recommendationBlocker: 'Compass has not published C-Rent’s applicant funnel, unique-household reconciliation, HMIS-linked outcomes, source-specific assistance ledger, or a dated marginal plan showing that a new private gift adds rather than displaces aid.',
  },
  summary: [
    { label: 'REPORTED COST BENCHMARK', value: '≈ $9,700', detail: 'FY2025 audited C-Rent expense per reported prevention-classified family; not a causal impact price' },
    { label: 'OUR CONDITIONAL BEST GUESS', value: '≈ $485K', detail: 'per additional family avoiding recorded homelessness within six months' },
    { label: '$ PER 10 QALYS · ONE BETTER LIFE', value: 'Not yet convertible', detail: 'eight explicit evidence gates fail; the native family-housing model remains visible below' },
    { label: 'FUNDING ROOM', value: 'Not published', detail: 'the $100,000 gift is a scenario, not a current marginal offer' },
  ],
  programSection: {
    body: 'Compass describes C-Rent as homelessness prevention for families facing a housing crisis. It can provide back-rent or move-in financial assistance, case management, and problem-solving. Our model ends at six-month recorded homelessness because that is the outcome and horizon in the closest randomized study.',
    steps: [
      { title: 'Identify imminent risk', detail: 'A San Francisco family with at least one minor child seeks help while facing arrears, eviction, or a move-in barrier.' },
      { title: 'Assess the cash gap', detail: 'Staff review eligibility, household circumstances, available aid, and whether a bounded payment can resolve the crisis.' },
      { title: 'Pay and support', detail: 'C-Rent may pay back rent or move-in costs and pair the transfer with case management and problem-solving.' },
      { title: 'Verify housing stability', detail: 'A recommendation-grade model would link all eligible applicants to HMIS and verify housing at 3, 6, 12, and 24 months.' },
    ],
    boundary: 'This model covers C-Rent prevention only. It excludes Compass shelter, rapid rehousing, permanent subsidies, housing navigation, childcare, behavioral health, and the separate cash-after-rapid-rehousing trial. The 207 reported families are not assumed to be 207 additional outcomes.',
  },
  model: {
    headline: 'Our current model: roughly $485,000 per additional six-month homelessness episode averted.',
    body: 'Unlike a guessed marginal price, the cost anchor comes from audited FY2025 C-Rent accounts: $2,008,658 divided by 207 reported prevention-classified families. We then discount the Santa Clara randomized 3.8-point offer effect to a 2.0-point Compass best guess because the family population, targeting, take-up, assistance rules, and outcome systems differ.',
    equation: { label: 'CONDITIONAL COST PER ADDITIONAL HOMELESSNESS EPISODE AVERTED', expression: `${money.format(cost.best)} ÷ ${percent.format(effect.best)}`, result: `= ${money.format(model.bottomLine.costPerAdditionalHomelessnessEpisodeAvertedUsd)}` },
    inputColumnLabel: 'Historical value / best guess',
    inputs: model.inputs.slice(1).map((input) => ({ key: input.key, label: input.label, confidence: input.confidence, best: formatInput(input.best, input.unit), range: input.low === input.high ? 'Fixed historical value' : `${formatInput(input.low, input.unit)}–${formatInput(input.high, input.unit)}`, basis: input.basis })),
    giftHeading: `What would ${money.format(model.bottomLine.giftUsd)} buy at FY2025 accounting cost?`,
    sensitivity: model.sensitivity.map((row) => ({ case: row.case, headline: `${number.format(row.additionalHomelessnessEpisodesAvertedPer100k)} additional homelessness episodes averted`, detail: `${number.format(row.historicalEquivalentFamilyCasesPer100k)} historical-equivalent family cases · ${compactMoney.format(row.costPerAdditionalHomelessnessEpisodeAvertedUsd)} each` })),
    uncertaintyBoundary: model.nullEffectBoundary,
    fundingBoundary: model.fundingRoom.boundary,
  },
  comparisonAudit: {
    headline: 'Not yet convertible to $ per 10 QALYs—and a prevention classification is not a measured health-utility unit.',
    body: bridgeAudit.decision,
    candidate: {
      label: 'EXTERNAL STUDY · NOT COMPASS',
      value: '≈ $298K / 10 QALYs',
      detail: 'A 2024 VA-payer model estimated $29,751 per QALY for SSVF homelessness prevention. Veteran housing trajectories, mortality, healthcare costs, and assumed utility weights do not establish Compass’s donor cost or QALYs.',
    },
    failedGates: bridgeAudit.failedGates.map((gate) => ({ key: gate.key, label: gate.label, why: gate.why })),
    illustrative: {
      expression: bridgeAudit.illustrativeCounterfactual.arithmetic,
      result: '= Withheld',
      boundary: bridgeAudit.illustrativeCounterfactual.publicationBoundary,
    },
    requiredEvidence: bridgeAudit.requiredEvidence,
  },
  evidence: review.evidence.filter((item) => evidenceKeys.has(item.key)),
  reservations: review.reservations,
  excludedBenefits: model.excludedBenefits,
  sources: [
    ...review.sources.filter((source) => model.sources.some((modelSource) => modelSource.url === source.url)),
    ...bridgeAudit.sources.filter((source) => !review.sources.some((existing) => existing.url === source.url)),
  ],
};

export default function CompassFamilyServicesResearchPage() {
  return <CharityResearchReport content={content} />;
}
