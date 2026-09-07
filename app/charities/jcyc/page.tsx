import type { Metadata } from 'next';
import CharityResearchReport, { type CharityReportContent } from '@/components/CharityResearchReport';
import model from '@/data/san-francisco/jcyc-myeep-cea-v1.json';
import { youthJobsDecisionModel } from '@/lib/youth-jobs-model.mjs';
export const metadata: Metadata = { title: 'JCYC MYEEP summer jobs | Market for Impact', description: 'An explicit mortality-only $24.8M per 10-QALY research estimate for an additional MYEEP summer placement.' };
const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 2 });
const scenarios = model.scenarios.map(s => ({ ...s, result: youthJobsDecisionModel(s) }));
const central = scenarios[1];
const content: CharityReportContent = {
  organization: 'JCYC', program: model.program,
  eyebrow: 'CHARITY RESEARCH · SAN FRANCISCO · EXPLORATORY',
  published: '7 September 2026', modelVersion: model.version,
  nutshell: {
    headline: 'Summer jobs have credible external safety evidence, but are not a cheap health intervention in our central model.',
    body: <>Our best guess is <strong>{usd.format(central.result.costPerTenQalys!)} per better life (10 QALYs)</strong> for a marginal summer placement, counting only a transferred mortality pathway. We would not prioritize this program for a health-only donor on this estimate. That is narrower than judging the value of youth wages, opportunity and community connection. <a href="https://ai.rhyslindmark.com/donate/api/sf-jcyc-model">Inspect the model and scenarios →</a></>,
    whyItMayWork: 'Structured paid work could reduce exposure to dangerous situations and improve connections to adults and services.',
    whyWeAreCautious: 'The selected experiment took place in older NYC cohorts, not SF. A local mortality effect and a privately funded additional summer slot are unverified.',
    recommendationBlocker: 'We have no current summer-specific marginal budget or causal local outcome estimate.',
  },
  summary: [
    { label: 'OUR BEST GUESS', value: usd.format(central.result.costPerTenQalys!), detail: 'per 10 QALYs; mortality-only analyst transfer' },
    { label: 'POSITIVE SCENARIOS', value: '$2.92M–$959M', detail: 'Not a confidence interval; null benefit remains possible' },
    { label: 'COST PER SLOT', value: '$5,100', detail: 'Bottom-up judgment, not a JCYC marginal quote' },
    { label: 'FUNDING ROOM', value: 'Unverified', detail: 'Existing public allocations are not private-gift capacity' },
  ],
  programSection: {
    body: 'MYEEP combines paid work with preparation and support. This review isolates a summer placement: the 2024 city design describes 140 employment hours plus 10 training hours. The current Workhub page posts $19.61 hourly pay but includes school-year content; applying it to a future summer slot is a modeling assumption.',
    steps: [
      { title: 'Prepare for work', detail: 'Training and support help youth enter a placement. Design hours are not observed completed hours.' },
      { title: 'Fund a summer placement', detail: 'Model an additional place with wages and delivery costs, not a donation replacing an existing public allocation.' },
      { title: 'Test the safety pathway', detail: 'Transfer a fraction of a cumulative experimental mortality effect, then model the healthy survival gained.' },
    ],
    boundary: 'The city presentation describes a $6.335M annual allocation and 900 annual youth across a wider program scope. Neither that ratio nor a later mixed-year budget is a summer-only unit cost.',
  },
  model: {
    headline: 'Our best estimate: ' + usd.format(central.result.costPerTenQalys!) + ' per 10 QALYs.',
    body: 'The external mortality reduction is 0.073 percentage points, or 0.00073 probability per participation. We retain 25% for local transfer, assume 75% funding additionality and credit 15 discounted QALYs per death prevented. The effect is cumulative—not annual—and already participation-scaled.',
    equation: { label: 'DOLLARS PER BETTER LIFE', expression: '10 × $5,100 ÷ (0.00073 × 25% × 75% × 15)', result: '≈ $24.84M per 10 QALYs' },
    inputs: model.judgments.map(j => ({ key: j.key, label: j.label, confidence: 'Explicit analyst assumption', best: String(central[j.key as keyof typeof central]), range: scenarios.map(s => String(s[j.key as keyof typeof s])).join(' / '), basis: j.basis })),
    inputColumnLabel: 'Optimistic / central / pessimistic inputs',
    giftHeading: 'Illustrative $100,000: 19.6 funded slots and 0.0403 additional QALYs',
    sensitivity: scenarios.map(s => ({ case: s.name, headline: usd.format(s.result.costPerTenQalys!) + ' per 10 QALYs', detail: s.result.additionalQalys.toFixed(4) + ' additional QALYs per $100,000; positive scenario, not verified funding room' })),
    uncertaintyBoundary: model.nullBoundary,
    fundingBoundary: 'Cost includes an assumed donor wage bill and delivery allowance. No public-payer savings or earnings offsets are subtracted. A general JCYC gift is not automatically an additional MYEEP summer slot. We did not directly retrieve the later FY2024–25 grantee report, and do not use its indexed expenditure figures in this model.',
  },
  comparisonBridge: {
    headline: 'Why this does not currently pass the $100K test',
    body: 'At $5,100 per slot, reaching $100K per 10 QALYs requires 0.51 QALY per slot. The central mortality pathway supplies only 0.00205. Even retaining the entire external mortality effect and crediting 25 QALYs yields 0.01825 per slot, before funding displacement.',
    equation: { label: 'REQUIRED VS CENTRAL BENEFIT', expression: '$5,100 ÷ $10,000 per QALY', result: '0.51 QALY needed per slot versus 0.00205 modeled' },
    inputs: [], sensitivity: [],
    boundary: 'This is not a total social-benefit comparison. Income, nonfatal safety and incarceration pathways need separate defensible models rather than being assumed to close the gap.',
  },
  evidence: [
    { key: 'nyc', design: 'Randomized lottery with instrumental-variable participation estimates', population: 'NYC summer-employment cohorts, 2005–08', result: 'The selected paper reports lower cumulative mortality through 2014; subsequent earnings did not improve and college enrollment was unchanged.', transfer: 'Different city, age mix, risk environment and program vintage. The full-sample mortality effect is used once, not annualized or adjusted twice for take-up.' },
    { key: 'local', design: 'Official design and current program description', population: 'SF MYEEP', result: 'Design dosage and posted wage establish a plausible program and bottom-up cost anchor.', transfer: 'No local experimental mortality coefficient, summer-only marginal quote or additional capacity is established.' },
  ],
  reservations: [
    'The survival horizon and timing are judgments. An early mortality difference may attenuate rather than create the assumed long-term healthy survival.',
    'The transferred absolute effect may be much smaller in a different-risk cohort. The positive range does not exclude no effect or harm.',
    'Summertime placements and school-year programming must not share an effect estimate automatically.',
    'Youth wages and opportunities matter beyond health utility. Excluding them makes this a narrow health comparison, not a claim that the program has no value.',
  ],
  excludedBenefits: model.excluded, sources: model.sources,
};
export default function JCYCReport() { return <CharityResearchReport content={content} />; }
