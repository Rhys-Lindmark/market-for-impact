import type { Metadata } from 'next';
import CharityResearchReport, { type CharityReportContent } from '@/components/CharityResearchReport';
import review from '@/data/san-francisco/eviction-defense-collaborative-review-v1.json';
import model from '@/data/san-francisco/edc-full-scope-legal-defense-cea-v1.json';
import bridgeAudit from '@/data/san-francisco/edc-legal-defense-qaly-bridge-audit-v1.json';

export const metadata: Metadata = {
  title: 'Eviction Defense Collaborative legal defense — charity research | Market for Impact',
  description: 'Our evidence review and exploratory public-cost model for full-scope eviction defense in San Francisco.',
  openGraph: { title: 'Eviction Defense Collaborative — charity research', description: 'A source-grounded review with conflicting randomized evidence and an inspectable legal-defense model.', images: [] },
  twitter: { card: 'summary', title: 'Eviction Defense Collaborative — charity research', description: 'A source-grounded review with conflicting randomized evidence and an inspectable legal-defense model.', images: [] },
};

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const compactMoney = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 });
const number = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });
const percent = new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 0 });
const cost = model.inputs.find((input) => input.key === 'historical_cost_per_full_scope_case_usd')!;
const effect = model.inputs.find((input) => input.key === 'causal_retained_possession_effect')!;
const formatInput = (value: number, unit: string) => {
  if (unit === 'USD') return money.format(value);
  if (unit === 'proportion') return percent.format(value);
  return `${number.format(value)} ${unit}`;
};

const content: CharityReportContent = {
  organization: 'Eviction Defense Collaborative',
  eyebrow: 'CHARITY RESEARCH · SAN FRANCISCO',
  program: 'Full-scope legal defense for tenants facing eviction through San Francisco’s Tenant Right to Counsel system',
  donationUrl: review.organization.donationUrl,
  published: '31 August 2026',
  modelVersion: model.version,
  nutshell: {
    headline: 'A plausible housing-retention pathway. Conflicting randomized evidence. No verified marginal offer.',
    body: <>San Francisco budgeted <strong>{money.format(model.inputs.find((input) => input.key === 'city_fully_loaded_team_cost_usd')!.best)}</strong> for a fully loaded legal-defense team with a <strong>50-case deliverable</strong>, or <strong>{money.format(cost.best)} per historical full-scope case</strong>. Applying our judgmental 5-point retained-possession effect gives a conditional estimate of <strong>{money.format(model.bottomLine.costPerAdditionalRetainedPossessionOutcomeUsd)} per additional household retaining possession</strong>. The effect could be null because a Massachusetts experiment found no advantage over limited assistance.</>,
    whyItMayWork: 'An attorney can identify defenses, negotiate, litigate, obtain repairs or payment terms, and prevent a landlord from converting a disputed case into immediate loss of possession.',
    whyWeAreCautious: 'The positive New York randomized result, null Massachusetts full-versus-limited result, and San Francisco descriptive comparison measure different services and outcomes in different courts.',
    recommendationBlocker: 'EDC has not published an EDC-only full-scope cohort, linked housing follow-up, assignment rule, current marginal cost, public-funding displacement rule, or a dated private-gift expansion plan.',
  },
  summary: [
    { label: 'PUBLIC COST BENCHMARK', value: '$6,300', detail: 'FY2023–24 city team budget divided by a 50-case deliverable; not an EDC marginal price' },
    { label: 'OUR CONDITIONAL BEST GUESS', value: '$126,000', detail: 'per additional tenant household retaining possession because of full-scope representation' },
    { label: '$ PER 10 QALYS · ONE BETTER LIFE', value: 'Not yet convertible', detail: 'eight explicit evidence gates fail; the native legal-outcome model remains visible below' },
    { label: 'FUNDING ROOM', value: 'Not published', detail: 'the $100,000 gift is a scenario, not a current marginal offer' },
  ],
  programSection: {
    body: 'EDC is the lead agency for San Francisco’s multi-provider Tenant Right to Counsel system. Its clinic handles intake, pro per assistance, referral, and rental assistance; eligible higher-vulnerability tenants may receive full-scope representation from EDC or a partner. This model isolates full-scope legal defense and stops at retained possession.',
    steps: [
      { title: 'Tenant enters the system', detail: 'A tenant served with a notice terminating tenancy or eviction papers reaches EDC’s intake and referral clinic.' },
      { title: 'Case and vulnerability are assessed', detail: 'All tenants can receive pro per help or referral; full-scope places are allocated using vulnerability scoring when capacity is constrained.' },
      { title: 'A legal team represents the tenant', detail: 'An attorney and supporting staff investigate, negotiate, prepare filings, litigate, and coordinate with social-service or rental-assistance supports.' },
      { title: 'Housing outcomes are verified', detail: 'A recommendation-grade evaluation would track retained possession, negotiated moves, homelessness, repeat filings, and housing status at 3, 6, 12, and 24 months.' },
    ],
    boundary: 'The model covers full-scope representation only. It excludes limited-scope help, self-help intake, rental assistance, subsidies, shelter advocacy, partner-delivered cases, and broader system coordination. “Retained possession” is narrower than “avoided homelessness” and does not establish how long the household remains housed.',
  },
  model: {
    headline: 'Our current model: $126,000 per additional retained-possession outcome—conditional on a positive effect.',
    body: 'The cost anchor is public, recent, and program-specific: $315,000 for a fully loaded team divided by a 50-case deliverable. The causal input is much weaker. We use 5 points—well below the older New York 29-point adverse-judgment result and San Francisco’s unadjusted 18-point stayed-home difference—because full representation produced no retained-possession gain over limited assistance in one Massachusetts Housing Court experiment.',
    equation: { label: 'CONDITIONAL COST PER ADDITIONAL RETAINED-POSSESSION OUTCOME', expression: `${money.format(cost.best)} ÷ ${percent.format(effect.best)}`, result: `= ${money.format(model.bottomLine.costPerAdditionalRetainedPossessionOutcomeUsd)}` },
    inputColumnLabel: 'Published value / best guess',
    inputs: model.inputs.slice(1).map((input) => ({ key: input.key, label: input.label, confidence: input.confidence, best: formatInput(input.best, input.unit), range: input.low === input.high ? 'Fixed published value' : `${formatInput(input.low, input.unit)}–${formatInput(input.high, input.unit)}`, basis: input.basis })),
    giftHeading: `What would ${money.format(model.bottomLine.giftUsd)} buy at the public cost benchmark?`,
    sensitivity: model.sensitivity.map((row) => ({ case: row.case, headline: `${number.format(row.additionalRetainedPossessionOutcomesPer100k)} additional retained-possession outcomes`, detail: `${number.format(row.historicalEquivalentCasesPer100k)} historical-equivalent full-scope cases · ${compactMoney.format(row.costPerAdditionalRetainedPossessionOutcomeUsd)} each` })),
    uncertaintyBoundary: model.nullEffectBoundary,
    fundingBoundary: model.fundingRoom.boundary,
  },
  comparisonAudit: {
    headline: 'Not yet convertible to $ per 10 QALYs—and retaining possession is not a measured health-utility unit.',
    body: bridgeAudit.decision,
    candidate: {
      label: 'NEAREST HEALTH EVIDENCE · NOT AN EDC COEFFICIENT',
      value: 'No $ / QALY estimate',
      detail: 'Systematic reviews find plausible health pathways but mixed or observational evidence. The Washington counsel study measures perceived stress and descriptive case outcomes, not causal preference-based utility.',
    },
    failedGates: bridgeAudit.failedGates.map((gate) => ({ key: gate.key, label: gate.label, why: gate.why })),
    illustrative: {
      expression: bridgeAudit.illustrativeCounterfactual.arithmetic,
      result: '= Withheld',
      boundary: bridgeAudit.illustrativeCounterfactual.publicationBoundary,
    },
    requiredEvidence: bridgeAudit.requiredEvidence,
  },
  evidence: review.evidence,
  reservations: review.reservations,
  excludedBenefits: model.excludedBenefits,
  sources: [
    ...review.sources,
    ...bridgeAudit.sources.filter((source) => !review.sources.some((existing) => existing.url === source.url)),
  ],
};

export default function EvictionDefenseCollaborativeResearchPage() {
  return <CharityResearchReport content={content} />;
}
