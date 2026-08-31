import type { Metadata } from 'next';
import CharityResearchReport, { type CharityReportContent } from '@/components/CharityResearchReport';
import review from '@/data/san-francisco/institute-on-aging-review-v1.json';
import model from '@/data/san-francisco/institute-on-aging-cea-v1.json';

export const metadata: Metadata = {
  title: 'Institute on Aging — charity research | Market for Impact',
  description: 'Our evidence review and exploratory cost-effectiveness model for Institute on Aging’s Friendship Line.',
  openGraph: { title: 'Institute on Aging — charity research', description: 'A source-grounded review and inspectable Friendship Line cost-effectiveness model.', images: [] },
  twitter: { card: 'summary', title: 'Institute on Aging — charity research', description: 'A source-grounded review and inspectable Friendship Line cost-effectiveness model.', images: [] },
};

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const number = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });
const percent = new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 0 });
const formatInput = (value: number, unit: string) => unit.includes('proportion') || unit.includes('remissions') ? percent.format(value) : `${number.format(value)} ${unit}`;
const marginalCost = model.inputs.find((input) => input.key === 'marginal_cost_per_participant_usd')!;
const causalEffect = model.inputs.find((input) => input.key === 'causal_six_month_remission_probability')!;

const content: CharityReportContent = {
  organization: 'Institute on Aging',
  eyebrow: 'CHARITY RESEARCH · SAN FRANCISCO / CALIFORNIA',
  program: 'Friendship Line proactive outbound calls for older adults experiencing loneliness',
  donationUrl: review.organization.donationUrl,
  published: '31 August 2026',
  modelVersion: model.version,
  nutshell: {
    headline: 'Promising human connection. A weak causal record. Not yet a funding recommendation.',
    body: <>Institute on Aging runs a free, multilingual 24/7 support line for older adults, adults with disabilities, and caregivers. A six-month pilot reported a substantial decline in loneliness among 121 enrolled health-plan members, but it had no control group. Our exploratory model estimates <strong>about {money.format(model.bottomLine.costPerAdditionalSixMonthRemissionUsd)} per additional six-month loneliness remission</strong>, with a deliberately wide <strong>{money.format(model.bottomLine.plausibleRangeUsd.low)}–{money.format(model.bottomLine.plausibleRangeUsd.high)}</strong> range.</>,
    whyItMayWork: 'Proactive, repeated human contact directly targets loneliness and removes access barriers.',
    whyWeAreCautious: 'The observed 18-point decline may partly reflect selection, regression to the mean, pandemic-era change, or follow-up bias.',
    recommendationBlocker: 'IOA has not published program accounts, a marginal capacity plan, or evidence that a private gift adds calls rather than replacing public funding.',
  },
  summary: [
    { label: 'OUR BEST GUESS', value: money.format(model.bottomLine.costPerAdditionalSixMonthRemissionUsd), detail: 'per additional participant below the study’s loneliness threshold at six months' },
    { label: 'PLAUSIBLE RANGE', value: `${money.format(model.bottomLine.plausibleRangeUsd.low)}–${money.format(model.bottomLine.plausibleRangeUsd.high)}`, detail: 'driven by unknown program cost and an uncontrolled effect estimate' },
    { label: 'EVIDENCE', value: 'Suggestive', detail: 'one relevant single-group pilot; no randomized or concurrent comparison' },
    { label: 'FUNDING ROOM', value: 'Not published', detail: `the modeled ${money.format(model.bottomLine.giftUsd)} is illustrative, not verified room` },
  ],
  programSection: {
    body: 'The Friendship Line combines inbound emotional support and crisis intervention with outbound check-ins. For the specific pathway we model, staff or trained volunteers proactively call an enrolled older adult over six months. The intended mechanism is simple: reliable conversation and active listening may reduce acute isolation, create an ongoing relationship, and connect a caller to additional support.',
    steps: [
      { title: 'Identify', detail: 'An older adult is referred or opts into proactive calls.' },
      { title: 'Connect', detail: 'Trained staff or volunteers make repeated outbound calls.' },
      { title: 'Support', detail: 'Conversation, listening, crisis response, and referral address immediate needs.' },
      { title: 'Measure', detail: 'Loneliness and mental-health outcomes are followed over time.' },
    ],
    boundary: 'IOA reports more than 11,000 inbound and outbound calls per month. Calls are not unique participants, a standardized dose, resolved crises, or additional outcomes. This model covers only a hypothetical six-month proactive-call cohort.',
  },
  model: {
    headline: 'Our current model: roughly $15,000 per six-month loneliness remission.',
    body: 'We start with the observed fall in loneliness from 46% to 28%, then heavily discount it because the study had no control group. We separately build a bottom-up participant cost because IOA does not publish Friendship Line program accounts. Every number below should be replaced when IOA provides better data.',
    equation: { label: 'MODELED COST PER ADDITIONAL REMISSION', expression: `${money.format(marginalCost.best)} ÷ ${percent.format(causalEffect.best)}`, result: `= ${money.format(model.bottomLine.costPerAdditionalSixMonthRemissionUsd)}` },
    inputs: model.inputs.slice(1).map((input) => ({ key: input.key, label: input.label, confidence: input.confidence, best: formatInput(input.best, input.unit), range: `${formatInput(input.low, input.unit)}–${formatInput(input.high, input.unit)}`, basis: input.basis })),
    giftHeading: `What would ${money.format(model.bottomLine.giftUsd)} buy?`,
    sensitivity: model.sensitivity.map((row) => ({ case: row.case, headline: `${number.format(row.additionalRemissionsPer100k)} additional remissions`, detail: `${number.format(row.participantsPer100k)} participants · ${money.format(row.costPerAdditionalRemissionUsd)} each` })),
    fundingBoundary: model.fundingRoom.boundary,
  },
  evidence: review.evidence,
  reservations: review.reservations,
  excludedBenefits: model.excludedBenefits,
  sources: review.sources,
};

export default function InstituteOnAgingResearchPage() {
  return <CharityResearchReport content={content} />;
}
