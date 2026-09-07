import type { Metadata } from 'next';
import CharityResearchReport, { type CharityReportContent } from '@/components/CharityResearchReport';
import review from '@/data/san-francisco/eviction-defense-collaborative-review-v1.json';
import model from '@/data/san-francisco/edc-full-scope-legal-defense-cea-v1.json';
import bridgeAudit from '@/data/san-francisco/edc-legal-defense-qaly-bridge-audit-v1.json';
import qaly from '@/data/san-francisco/edc-qaly-decision-v2.json';

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
  published: '7 September 2026',
  modelVersion: qaly.version,
  nutshell: {
    headline: 'Our narrow health estimate is expensive; legal protection has value beyond QALYs.',
    body: <>Our best guess for the narrow adult-health pathway is <strong>{compactMoney.format(qaly.publishedPriceUsd)} per better life (10 QALYs)</strong>, conditional on funding additional cases. This combines a historical public cost benchmark, a judgmental five-point legal effect and an explicitly subjective health bridge. We would not prioritize EDC on this QALY estimate alone. It does not capture the full value of legal protection, voice, financial security or preventing an unjust eviction. <a href="https://ai.rhyslindmark.com/donate/api/sf-edc-qaly-model">Inspect the model inputs and results →</a></>,
    whyItMayWork: 'An attorney can identify defenses, negotiate, litigate, obtain repairs or payment terms, and prevent a landlord from converting a disputed case into immediate loss of possession.',
    whyWeAreCautious: 'The positive New York randomized result, null Massachusetts full-versus-limited result, and San Francisco descriptive comparison measure different services and outcomes in different courts.',
    recommendationBlocker: 'EDC has not published an EDC-only full-scope cohort, linked housing follow-up, assignment rule, current marginal cost, public-funding displacement rule, or a dated private-gift expansion plan.',
  },
  summary: [
    { label: 'PUBLIC COST BENCHMARK', value: '$6,300', detail: 'FY2023–24 city team budget divided by a 50-case deliverable; not an EDC marginal price' },
    { label: 'OUR CONDITIONAL BEST GUESS', value: '$126,000', detail: 'per additional tenant household retaining possession because of full-scope representation' },
    { label: '$ PER 10 QALYS · ONE BETTER LIFE', value: compactMoney.format(qaly.publishedPriceUsd), detail: 'Very-low-confidence subjective adult-health bridge; positive effect and donor additionality assumed' },
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
  comparisonBridge: {
    headline: 'A best-guess health bridge—not a measured utility effect.',
    body: qaly.bottomLine + ' The earlier audit remains a record of evidence limitations, not a reason to withhold this explicitly assumption-based estimate.',
    equation: { label: 'DOLLARS PER 10 QALYS', expression: '$126,000 × 10 ÷ (1 adult × 25% × 0.04 utility × 1 year × 100% additionality)', result: '= $126 million per 10 QALYs' },
    inputs: qaly.judgments.map((j, i) => ({ key: String(i), label: j.label, confidence: 'Analyst assumption; not measured for EDC', best: j.best, range: j.range, basis: j.basis })),
    sensitivity: qaly.scenarios.map((s) => {
      const gain = s.affectedAdults * s.healthRelevantDisplacementShare * s.utilityGain * s.durationYears * s.donorAdditionality;
      return { case: s.name, headline: compactMoney.format(10 * s.costPerOutcomeUsd / gain) + ' per 10 QALYs', detail: s.costPerOutcomeUsd + ' dollars per legal outcome; ' + gain + ' incremental QALYs credited per outcome' };
    }),
    boundary: qaly.nullBoundary + ' The central native legal cost would require 12.6 QALYs per retained-possession household to reach $100K per 10 QALYs, versus our 0.01-QALY narrow health scenario.',
  },
  evidence: [...review.evidence, { key: 'memphis-2026', design: 'Randomized offer of legal assistance; July 2026 working-paper revision', population: '1,140 Memphis tenants seeking assistance', result: 'The instrumental-variable court-eviction effect was a 25-point reduction; it attenuated 86% after rental assistance expired. Ultimate residential stability did not measurably improve.', transfer: 'Do not import this large court effect while omitting complementary cash and its costs. Court judgments, moves and homelessness are different endpoints.' }],
  reservations: [...review.reservations, 'No eviction-specific preference-based utility estimate was found. The 25% health-relevant share and 0.04 utility gain are subjective judgments; adjacent housing studies include null utility results.', 'The July 2026 Memphis trial had imperfect address matching and survey follow-up. Its residential-stability null informs caution but is not proof that all legal assistance has zero housing benefit.'],
  excludedBenefits: [...model.excludedBenefits.slice(0, -1), 'Mortality, children and household spillovers, WELLBYs, and broader non-health value. The adult-health QALY bridge above is included, but is explicitly subjective.'],
  sources: [
    ...review.sources,
    ...bridgeAudit.sources.filter((source) => !review.sources.some((existing) => existing.url === source.url)),
    ...qaly.sources,
  ],
};

export default function EvictionDefenseCollaborativeResearchPage() {
  return <CharityResearchReport content={content} />;
}
