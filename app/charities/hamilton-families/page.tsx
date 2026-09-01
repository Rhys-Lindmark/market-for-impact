import type { Metadata } from 'next';
import CharityResearchReport, { type CharityReportContent } from '@/components/CharityResearchReport';
import review from '@/data/san-francisco/hamilton-families-review-v1.json';
import model from '@/data/san-francisco/hamilton-prevention-cea-v1.json';
import bridgeAudit from '@/data/san-francisco/hamilton-prevention-qaly-bridge-audit-v1.json';

export const metadata: Metadata = {
  title: 'Hamilton Families homelessness prevention — charity research | Market for Impact',
  description: 'Our evidence review and exploratory cost-effectiveness model for Hamilton Families homelessness prevention.',
  openGraph: { title: 'Hamilton Families — charity research', description: 'A source-grounded review and inspectable family-homelessness-prevention model.', images: [] },
  twitter: { card: 'summary', title: 'Hamilton Families — charity research', description: 'A source-grounded review and inspectable family-homelessness-prevention model.', images: [] },
};

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const compactMoney = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 });
const number = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });
const percent = new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 1 });
const cost = model.inputs.find((input) => input.key === 'modeled_marginal_cost_per_family_usd')!;
const effect = model.inputs.find((input) => input.key === 'causal_six_month_homelessness_reduction')!;
const evidenceKeys = new Set(['hamilton-reporting', 'hamilton-prevention-program', 'santa-clara-prevention-rct']);
const formatInput = (value: number, unit: string) => {
  if (unit === 'USD') return money.format(value);
  if (unit === 'proportion') return percent.format(value);
  return `${number.format(value)} ${unit}`;
};

const content: CharityReportContent = {
  organization: 'Hamilton Families',
  eyebrow: 'CHARITY RESEARCH · SAN FRANCISCO',
  program: 'Temporary financial assistance, income planning, legal referrals, and case management for families at imminent risk of homelessness',
  donationUrl: review.organization.donationUrl,
  published: '31 August 2026',
  modelVersion: model.version,
  nutshell: {
    headline: 'Strong evidence for the intervention. Weak evidence for Hamilton’s next dollar.',
    body: <>A randomized trial in high-rent Santa Clara County found that offering temporary financial assistance reduced recorded homelessness by <strong>3.8 percentage points within six months</strong>. Hamilton’s program is similar in broad outline, but it does not publish its average prevention award, applicant funnel, or linked outcome. Our discounted exploratory model estimates <strong>about {money.format(model.bottomLine.costPerAdditionalHomelessnessEpisodeAvertedUsd)} per additional six-month homelessness episode averted</strong>. Conditional on a positive effect, the range is <strong>{compactMoney.format(model.bottomLine.conditionalPositiveEffectRangeUsd.low)}–{compactMoney.format(model.bottomLine.conditionalPositiveEffectRangeUsd.high)}</strong>; a null effect remains plausible.</>,
    whyItMayWork: 'A short cash gap can trigger eviction and shelter entry even when a family could sustain rent afterward. Hamilton can combine direct payment with income planning, legal referrals, and case management.',
    whyWeAreCautious: 'Hamilton’s “avoided homelessness” count has no comparison or common follow-up, its prevention cost is not separated from broader housing services, and the closest randomized study found smaller effects for households with children.',
    recommendationBlocker: 'Hamilton has not published prevention-only accounts, average awards, current eligible-but-unfunded families, HMIS-linked outcomes, or a dated marginal plan showing that a new private gift adds rather than displaces assistance.',
  },
  summary: [
    { label: 'OUR BEST GUESS', value: '≈ $500K', detail: 'per additional eligible family avoiding recorded homelessness within six months' },
    { label: 'POSITIVE-EFFECT SENSITIVITY', value: '$100K–$12.5M', detail: 'conditional on a positive causal effect; a null effect has no finite impact price' },
    { label: 'COST PER BETTER LIFE', value: '≈ $1.4M', detail: 'per 10 QALYs; very-low-confidence transfer from a VA housing model' },
    { label: 'FUNDING ROOM', value: 'Not published', detail: 'the $100,000 gift is a scenario, not a current marginal offer' },
  ],
  programSection: {
    body: 'Hamilton describes a prevention pathway for currently housed families at risk of eviction. Qualifying families may receive up to three months of back rent plus three months of future rent, income planning, legal referrals, and case management. The model ends at six-month recorded homelessness because that is the primary horizon in the closest randomized trial.',
    steps: [
      { title: 'Identify imminent risk', detail: 'A housed family applies while facing arrears, eviction, or another resolvable housing crisis.' },
      { title: 'Assess sustainability', detail: 'Hamilton reviews eligibility, the cash gap, income plan, and other available public or private assistance.' },
      { title: 'Pay and support', detail: 'The program may pay rent and pair it with legal referrals, income planning, and case management.' },
      { title: 'Verify housing stability', detail: 'A recommendation-grade version would link every eligible applicant to HMIS and verify housing at 3, 6, 12, and 24 months.' },
    ],
    boundary: 'The model covers Hamilton’s prevention assistance only. It excludes emergency shelter, rapid rehousing, long-term subsidies, transitional housing, education services, and the separate cash-after-rapid-rehousing trial. The 127 reported FY2025 families remain an output, not a causal denominator.',
  },
  model: {
    headline: 'Our current model: roughly $500,000 per additional six-month homelessness episode averted.',
    body: 'Hamilton does not publish an average prevention payment or delivery cost. We use $10,000 per assisted family as a deliberately uncertain San Francisco estimate, with a $5,000–$25,000 range. We then discount the Santa Clara randomized 3.8-point offer effect to a 2.0-point Hamilton best guess because the populations, targeting, take-up, assistance amount, and outcome systems differ.',
    equation: { label: 'MODELED COST PER ADDITIONAL HOMELESSNESS EPISODE AVERTED', expression: `${money.format(cost.best)} ÷ ${percent.format(effect.best)}`, result: `= ${money.format(model.bottomLine.costPerAdditionalHomelessnessEpisodeAvertedUsd)}` },
    inputs: model.inputs.slice(1).map((input) => ({ key: input.key, label: input.label, confidence: input.confidence, best: formatInput(input.best, input.unit), range: `${formatInput(input.low, input.unit)}–${formatInput(input.high, input.unit)}`, basis: input.basis })),
    giftHeading: `What would ${money.format(model.bottomLine.giftUsd)} buy?`,
    sensitivity: model.sensitivity.map((row) => ({ case: row.case, headline: `${number.format(row.additionalHomelessnessEpisodesAvertedPer100k)} additional homelessness episodes averted`, detail: `${number.format(row.assistanceCasesPer100k)} assistance cases · ${compactMoney.format(row.costPerAdditionalHomelessnessEpisodeAvertedUsd)} each` })),
    uncertaintyBoundary: model.nullEffectBoundary,
    fundingBoundary: model.fundingRoom.boundary,
  },
  comparisonBridge: {
    headline: 'Our current best estimate: about $1.4 million per better life (10 QALYs).',
    body: bridgeAudit.decision,
    equation: {
      label: 'EXPLORATORY COST PER 10 QALYS · ONE BETTER LIFE',
      expression: `${money.format(bridgeAudit.modeledBridge.modeledDonorCostPerAssistedFamilyUsd.best)} ÷ ${bridgeAudit.modeledBridge.qalyPerAssistedFamily.best} QALY × 10`,
      result: `= ${compactMoney.format(bridgeAudit.modeledBridge.bestCostPerTenQalysUsd)}`,
    },
    inputs: [
      { key: 'donor_cost', label: 'Modeled donor cost per assisted family', confidence: 'very low', best: money.format(bridgeAudit.modeledBridge.modeledDonorCostPerAssistedFamilyUsd.best), range: `${money.format(bridgeAudit.modeledBridge.modeledDonorCostPerAssistedFamilyUsd.low)}–${money.format(bridgeAudit.modeledBridge.modeledDonorCostPerAssistedFamilyUsd.high)}`, basis: bridgeAudit.modeledBridge.modeledDonorCostPerAssistedFamilyUsd.basis },
      { key: 'va_qaly', label: 'VA model QALYs per prevention recipient', confidence: 'moderate for model; indirect for Hamilton', best: String(bridgeAudit.sourceEvidence.incrementalQalysPerRecipient), range: 'Published point estimate', basis: 'A two-year VA simulation estimated 0.144 incremental QALYs and 90.7 additional stable-housing days per homelessness-prevention recipient receiving temporary financial assistance.' },
      { key: 'hamilton_qaly', label: 'QALYs per Hamilton assisted family after transfer discount', confidence: 'very low transfer', best: String(bridgeAudit.modeledBridge.qalyPerAssistedFamily.best), range: `${bridgeAudit.modeledBridge.qalyPerAssistedFamily.low}–${bridgeAudit.modeledBridge.qalyPerAssistedFamily.high}`, basis: bridgeAudit.sourceEvidence.hamiltonQalysPerAssistedFamily.basis },
    ],
    sensitivity: bridgeAudit.modeledBridge.sensitivity.map((row) => ({ case: row.case, headline: compactMoney.format(row.costPerTenQalysUsd), detail: `${money.format(row.donorCostPerFamilyUsd)} per family · ${percent.format(row.retainedShareOfVaQalyEffect)} of VA QALY estimate retained` })),
    boundary: `${bridgeAudit.modeledBridge.nullBoundary} ${bridgeAudit.sourceEvidence.boundary}`,
  },
  evidence: review.evidence.filter((item) => evidenceKeys.has(item.key)),
  reservations: review.reservations,
  excludedBenefits: [...new Set([...model.excludedBenefits, ...bridgeAudit.excludedBenefits])],
  sources: [
    ...review.sources.filter((source) => model.sources.some((modelSource) => modelSource.url === source.url)),
    ...bridgeAudit.sources.filter((source) => !review.sources.some((existing) => existing.url === source.url)),
  ],
};

export default function HamiltonFamiliesResearchPage() {
  return <CharityResearchReport content={content} />;
}
