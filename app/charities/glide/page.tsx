import type { Metadata } from 'next';
import CharityResearchReport, { type CharityReportContent } from '@/components/CharityResearchReport';
import review from '@/data/san-francisco/glide-review-v1.json';
import model from '@/data/san-francisco/glide-rental-assistance-cea-v1.json';
import bridge from '@/data/san-francisco/glide-rental-assistance-qaly-bridge-audit-v1.json';

export const metadata: Metadata = {
  title: 'GLIDE rental assistance — charity research | Market for Impact',
  description: 'Our evidence review and exploratory cost-effectiveness model for GLIDE Welcome Center rental assistance.',
  openGraph: { title: 'GLIDE rental assistance — charity research', description: 'A source-grounded review and inspectable homelessness-prevention model.', images: [] },
  twitter: { card: 'summary', title: 'GLIDE rental assistance — charity research', description: 'A source-grounded review and inspectable homelessness-prevention model.', images: [] },
};

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const compactMoney = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 });
const bridgeMoney = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 2 });
const number = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });
const percent = new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 1 });
const cost = model.inputs.find((input) => input.key === 'marginal_cost_per_assistance_case_usd')!;
const effect = model.inputs.find((input) => input.key === 'causal_six_month_shelter_entry_reduction')!;
const evidenceKeys = new Set(['glide-rental-fy2025', 'glide-rental-current-program', 'homelessness-prevention-quasi-experiment']);
const formatInput = (value: number, unit: string) => {
  if (unit === 'USD') return money.format(value);
  if (unit === 'proportion') return percent.format(value);
  return `${number.format(value)} ${unit}`;
};

const content: CharityReportContent = {
  organization: 'GLIDE Foundation',
  eyebrow: 'CHARITY RESEARCH · SAN FRANCISCO',
  program: 'Welcome Center rental assistance for eviction, back-rent, move-in, and deposit crises',
  donationUrl: review.organization.donationUrl,
  published: '1 September 2026',
  modelVersion: model.version,
  nutshell: {
    headline: 'A concrete prevention tool. A credible outside study. A very uncertain GLIDE effect.',
    body: <>GLIDE reports that a historical <strong>$100,000 rental-assistance cohort served 39 households</strong> and that all assisted clients remained housed after three months. That is encouraging but uncontrolled. Our exploratory model transfers a heavily discounted effect from a 4,448-caller Chicago quasi-experiment and estimates <strong>about {money.format(model.bottomLine.costPerAdditionalShelterEntryAvertedUsd)} per additional shelter entry averted within six months</strong>. Our separate health-utility transfer produces a very-low-confidence central estimate of <strong>about {bridgeMoney.format(bridge.modeledBridge.bestCostPerTenQalysUsd)} per 10 QALYs</strong>. Conditional on a positive effect, both models have wide ranges; a null effect remains plausible.</>,
    whyItMayWork: 'Short-term rent, deposit, or move-in assistance can resolve a specific cash shortfall before it becomes a shelter entry, while GLIDE adds readiness workshops and case support.',
    whyWeAreCautious: 'GLIDE publishes no comparison group or six-month shelter linkage, and its household, person, funding-source, and assistance-type denominators change across reports.',
    recommendationBlocker: 'GLIDE has not published the current applicant funnel, source-specific program accounts, verified six- or twelve-month outcomes, or a dated plan showing that another private gift funds additional cases rather than replacing partner money.',
  },
  summary: [
    { label: 'OUR BEST GUESS', value: '≈ $154K', detail: 'per additional assistance case avoiding emergency-shelter entry within six months' },
    { label: 'POSITIVE-EFFECT SENSITIVITY', value: '$51K–$2.5M', detail: 'conditional on a positive causal effect; a null effect has no finite impact price' },
    { label: 'COST PER BETTER LIFE', value: '≈ $427K', detail: 'per 10 QALYs; very-low-confidence transfer from a VA housing model' },
    { label: 'FUNDING ROOM', value: 'Not published', detail: 'the $100,000 cohort is historical evidence, not a current marginal offer' },
  ],
  programSection: {
    body: 'GLIDE’s Welcome Center offers weekday rental assistance to San Francisco residents facing eviction, back rent, or move-in and deposit barriers. Applicants attend a housing-readiness workshop; financial help may be paired with landlord problem-solving, case management, and referrals to outside funders. The modeled pathway ends at six-month emergency-shelter entry because that is the outcome measured in the closest causal study.',
    steps: [
      { title: 'Screen the crisis', detail: 'A resident brings an eviction, arrears, deposit, or move-in need to the Welcome Center.' },
      { title: 'Prepare and verify', detail: 'Applicants attend a housing-readiness workshop and staff assess eligibility and the resolvable cash gap.' },
      { title: 'Fund or connect', detail: 'GLIDE distributes sponsor money or connects the case to public and nonprofit funding partners.' },
      { title: 'Track housing', detail: 'A recommendation-grade version would verify shelter entry and housing retention at 3, 6, 12, and 24 months.' },
    ],
    boundary: 'The model covers rental assistance only. It excludes GLIDE’s meals, benefits navigation, hygiene, legal services, behavioral health, family programs, advocacy, and church. It also keeps the 39-household sponsor cohort separate from the FY2025 headline of 317 people receiving $965,254.',
  },
  model: {
    headline: 'Our current model: roughly $154,000 per additional six-month shelter entry averted.',
    body: 'GLIDE’s historical sponsor example implies $2,564 per assisted household. We add 20% for screening, workshops, case management, and overhead, producing a $3,077 best-guess marginal cost. We then use a 2.0 percentage-point absolute shelter-entry reduction: close to the 1.6-point overall and 2.2-point low-income estimates in the Chicago quasi-experiment, but still an explicit MFI transfer judgment because GLIDE’s funded-case denominator differs from that study’s funding-availability denominator.',
    equation: { label: 'MODELED COST PER ADDITIONAL SHELTER ENTRY AVERTED', expression: `${money.format(cost.best)} ÷ ${percent.format(effect.best)}`, result: `= ${money.format(model.bottomLine.costPerAdditionalShelterEntryAvertedUsd)}` },
    inputs: model.inputs.slice(1).map((input) => ({ key: input.key, label: input.label, confidence: input.confidence, best: formatInput(input.best, input.unit), range: `${formatInput(input.low, input.unit)}–${formatInput(input.high, input.unit)}`, basis: input.basis })),
    giftHeading: `What would ${money.format(model.bottomLine.giftUsd)} buy?`,
    sensitivity: model.sensitivity.map((row) => ({ case: row.case, headline: `${number.format(row.additionalShelterEntriesAvertedPer100k)} additional shelter entries averted`, detail: `${number.format(row.assistanceCasesPer100k)} assistance cases · ${compactMoney.format(row.costPerAdditionalShelterEntryAvertedUsd)} each` })),
    uncertaintyBoundary: model.nullEffectBoundary,
    fundingBoundary: model.fundingRoom.boundary,
  },
  comparisonBridge: {
    headline: 'Our current best estimate: about $427,000 per better life (10 QALYs).',
    body: bridge.decision,
    equation: {
      label: 'EXPLORATORY COST PER 10 QALYS · ONE BETTER LIFE',
      expression: `${money.format(bridge.modeledBridge.modeledDonorCostPerAssistedHouseholdUsd.best)} ÷ ${bridge.modeledBridge.qalyPerAssistedHousehold.best} QALY × 10`,
      result: `= ${bridgeMoney.format(bridge.modeledBridge.bestCostPerTenQalysUsd)}`,
    },
    inputs: [
      { key: 'donor_cost', label: 'Modeled donor cost per assisted household', confidence: 'very low as a marginal price', best: money.format(bridge.modeledBridge.modeledDonorCostPerAssistedHouseholdUsd.best), range: `${money.format(bridge.modeledBridge.modeledDonorCostPerAssistedHouseholdUsd.low)}–${money.format(bridge.modeledBridge.modeledDonorCostPerAssistedHouseholdUsd.high)}`, basis: bridge.modeledBridge.modeledDonorCostPerAssistedHouseholdUsd.basis },
      { key: 'va_qaly', label: 'VA model QALYs per prevention recipient', confidence: 'moderate for model; indirect for GLIDE', best: String(bridge.sourceEvidence.incrementalQalysPerRecipient), range: 'Published point estimate', basis: 'A two-year VA simulation estimated 0.144 incremental QALYs and 90.7 additional stable-housing days per homelessness-prevention recipient receiving temporary financial assistance.' },
      { key: 'glide_qaly', label: 'QALYs per GLIDE-assisted household after transfer discount', confidence: 'very low transfer', best: String(bridge.modeledBridge.qalyPerAssistedHousehold.best), range: `${bridge.modeledBridge.qalyPerAssistedHousehold.low}–${bridge.modeledBridge.qalyPerAssistedHousehold.high}`, basis: bridge.sourceEvidence.glideQalysPerAssistedHousehold.basis },
    ],
    sensitivity: bridge.modeledBridge.sensitivity.map((row) => ({ case: row.case, headline: bridgeMoney.format(row.costPerTenQalysUsd), detail: `${money.format(row.donorCostPerHouseholdUsd)} per household · ${percent.format(row.retainedShareOfVaQalyEffect)} of VA QALY estimate retained` })),
    boundary: `${bridge.modeledBridge.nullBoundary} ${bridge.sourceEvidence.boundary}`,
  },
  evidence: review.evidence.filter((item) => evidenceKeys.has(item.key)),
  reservations: review.reservations,
  excludedBenefits: [...new Set([...model.excludedBenefits, ...bridge.excludedBenefits])],
  sources: [
    ...review.sources.filter((source) => model.sources.some((modelSource) => modelSource.url === source.url)),
    ...bridge.sources.filter((source) => !review.sources.some((existing) => existing.url === source.url)),
  ],
};

export default function GlideResearchPage() {
  return <CharityResearchReport content={content} />;
}
