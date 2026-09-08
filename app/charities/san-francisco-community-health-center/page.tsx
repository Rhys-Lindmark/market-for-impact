import type { Metadata } from 'next';
import CharityResearchReport, { type CharityReportContent } from '@/components/CharityResearchReport';
import model from '@/data/san-francisco/sfchc-hcv-cea-v1.json';
import { hcvAccessModel } from '@/lib/hcv-access-model.mjs';

export const metadata: Metadata = { title: 'SF Community Health Center: HCV cost-effectiveness | Market for Impact', description: 'A best-guess integrated hepatitis C access model, with later treatment, reinfection, costs and funding uncertainty.' };
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const num = new Intl.NumberFormat('en-US', { maximumSignificantDigits: 3 });
const scenarios = model.scenarios.map(s => ({ ...s, result: hcvAccessModel(s) }));
const central = scenarios.find(s => /central/i.test(s.name))!;
const r = central.result;
const price = (v: number | null) => v === null ? 'No finite positive price' : money.format(v) + ' per 10 QALYs';
const content: CharityReportContent = {
  organization: model.organization, program: model.program, eyebrow: 'SAN FRANCISCO · MECHANISM-FIRST BET 3 · EXPLORATORY',
  published: '7 September 2026', modelVersion: model.version,
  nutshell: {
    headline: 'Curing hepatitis C is valuable. The donor question is which cures would not happen anyway.',
    body: <>Our best guess is <strong>{money.format(r.costPerTenQalys!)} per better life: 10 additional QALYs</strong> for an integrated clinical-access expansion. A favorable scenario reaches about $36,500, but depends on durable additional cures and inexpensive delivery. We would investigate a tightly priced expansion, not recommend an unrestricted gift on this estimate alone. <a href="/api/sf-hcv-model">Inspect the model →</a></>,
    whyItMayWork: 'Flexible on-site treatment can reach people who do not complete referrals, preventing future liver disease.',
    whyWeAreCautious: 'The center already provides integrated care. Extra navigation may add little, and many patients may get treatment later without this gift.',
    recommendationBlocker: 'No HCV-specific priced expansion, verified funding gap or current incremental cure results were found.',
  },
  summary: [
    { label: 'OUR BEST GUESS', value: money.format(r.costPerTenQalys!), detail: 'per 10 QALYs; hypothetical integrated-access expansion' },
    { label: 'POSITIVE SCENARIOS', value: '$36.5K–$309M', detail: 'Joint analyst cases, not confidence bounds; null/harm possible' },
    { label: 'EVIDENCE', value: 'Very low for local price', detail: 'External randomized cure effect; uncertain lifetime-health transfer' },
    { label: 'FUNDING ROOM', value: 'Unverified', detail: 'Existing public services are not an additional funding offer' },
  ],
  programSection: {
    body: 'SFCHC’s Wellness Clinic provides hepatitis C testing, counseling and treatment. Its donation identity is Asian and Pacific Islander Wellness Center, Inc., EIN 94-3096109. This review tests expanding integrated clinical access for people otherwise facing referral-only care, not the whole organization or a confirmed new project.',
    steps: [
      { title: 'Reach otherwise unserved patients', detail: 'Establish a real barrier to getting clinical treatment, beyond a referral or test.' },
      { title: 'Deliver and confirm treatment', detail: 'Flexible prescribing, medication access and follow-up lead to confirmed sustained viral response 12 weeks after treatment, not merely an appointment.' },
      { title: 'Count additional durable health', detail: 'Subtract usual-care cures, discount later treatment and reinfection, and separate the gift from publicly financed medication.' },
    ],
    boundary: 'City contract objectives list 96 enrollments, 60 initial visits, 48 starts, 40 completed courses and 32 SVR4 results. These are targets, not actual outcomes. SVR4 is not the modeled SVR12 endpoint; the FY2025–26 file contains stale internal headers. No corresponding marginal dollar quote was verified.',
  },
  model: {
    headline: 'Our best estimate: ' + price(r.costPerTenQalys),
    body: 'The external trial’s cure difference is 55/82 minus 19/83, or 44.2 percentage points. Retaining half locally and assigning half the expansion to the gift gives 0.110 additional one-year cures per eligible enrollee. Our uncertain health bridge retains 0.476 QALY per added cure, yielding 0.0526 QALY per enrollee. Clinical cost is $10,504: published 2020 costs, half physician downtime, eligibility-denominator reconciliation, startup spread over 100 people and a judgmental 1.35 cost multiplier. No usual-care clinical cost offsets or reimbursement are deducted.',
    equation: { label: 'DOLLARS PER BETTER LIFE', expression: '10 × donor cost ÷ [(55/82 − 19/83) × access transfer × funding additionality × net QALYs/cure − harms]', result: price(r.costPerTenQalys) },
    inputs: model.assumptions.map(a => ({ key: a.key, label: a.label, confidence: 'Calibration or explicit analyst judgment; see basis', best: String(central[a.key as keyof typeof central]), range: scenarios.map(s => String(s[a.key as keyof typeof s])).join(' / '), basis: a.basis })),
    inputColumnLabel: 'Optimistic / central / pessimistic',
    giftHeading: 'Illustrative $100,000: ' + num.format(r.qalysPer100k) + ' QALYs; not available funding room',
    sensitivity: scenarios.map(s => ({ case: s.name, headline: price(s.result.costPerTenQalys), detail: num.format(s.result.addedCures) + ' additional cures and ' + num.format(s.result.netQalys) + ' net QALYs per eligible enrollee.' })),
    uncertaintyBoundary: model.nullBoundary,
    fundingBoundary: model.costPerspective + ' Adding $15,000 per incremental medication start as a cost assumption produces ' + price(r.resourceCostPerTenQalys) + '. This is not a verified drug price and excludes later healthcare, patient time and retreatment.',
  },
  comparisonBridge: {
    headline: 'Why not assign every cure its full lifetime benefit?',
    body: 'A UK lifetime model implies 2.3–6.4 discounted QALYs per extra cure at age 40 across fibrosis stages; we choose 4 before adjustments. This is not a San Francisco measurement. To test timing, we allocate that already-discounted total across 20 years using weights t/(1.035^t). We then reduce each year for reinfection, excess competing mortality and counterfactual cure: 70% are assumed cured elsewhere after three years. Retained weight is 11.9%, leaving 0.476 QALY. The annual allocation is a heuristic, not a reproduced disease-state model.',
    equation: { label: 'HEALTH RETAINED', expression: '4 × Σ[w(t) × exp(−(0.069 + 0.03)t) × (t ≤ 3 ? 1 : 0.30)] ÷ Σw(t)', result: num.format(r.netQalysPerCure) + ' QALYs per additional one-year cure' },
    inputs: [],
    sensitivity: [
      { case: 'No reinfection, excess mortality or later cure', headline: price(hcvAccessModel({ ...central, reinfectionHazard: 0, excessMortalityHazard: 0, laterCureProbability: 0 }).costPerTenQalys), detail: 'Keeps central costs and access assumptions but credits the full external 4-QALY anchor. This is deliberately favorable, not our estimate.' },
      { case: 'Immediate universal counterfactual cure', headline: price(hcvAccessModel({ ...central, laterCureProbability: 1, laterCureYears: 0 }).costPerTenQalys), detail: 'If the same patients are cured just as soon elsewhere, the proposed access expansion adds no modeled health.' },
      { case: 'Maximum donor cost at central health effect', headline: money.format(r.maximumDonorCostFor100k!), detail: 'Per eligible enrollee to beat $100K/10 QALYs. A threshold, not an available $526 offer; cutting services may also cut the effect.' },
    ],
    boundary: 'The source already discounts health at 3.5%; normalizing weights preserves that total instead of discounting it twice. Timing is allocated from cure, without an extra delay from donation to cure. General mortality is already embedded; the 3% hazard is additional. Reinfection removes later credited benefit without retreatment. We give no credit after counterfactual cure and assume no additional harm thereafter; this approximation can miss both irreversible prevention and adverse differences.',
  },
  evidence: [
    { key: 'navigation', design: 'Navigation-focused randomized counterweight', population: 'CTN-0064; HCV RNA-positive subgroup', result: 'SVR12 occurred in 6/41 care-facilitation patients versus 5/53 controls.', transfer: 'Small, uncertain secondary cure results despite better care-cascade progression. This does not justify borrowing a 44-point integrated-care effect for navigation alone.' },
    { key: 'trial', design: 'Randomized trial, New York', population: '165 eligible adults with recent injection drug use; follow-up one year', result: 'SVR12: 55/82 integrated care versus 19/83 facilitated referral. The comparator already included navigation.', transfer: 'Not a navigation-only effect or a local measurement. Our expansion must reach people outside equivalent existing care.' },
    { key: 'cost', design: 'Primary trial microcosting', population: '84 intervention enrollees; national 2020 prices', result: '$6,035 per enrollee, plus $3,030 physician downtime if charged and $4,677 program startup; drugs excluded.', transfer: 'We retain costs of two excluded enrollees using 84/82. Full-package costs are not a marginal SF quote or an incremental societal ICER.' },
    { key: 'health', design: 'Lifetime disease simulation', population: 'UK reference patients; age and fibrosis scenarios', result: 'Age-40 discounted marginal cure gains imply 2.3–6.4 QALYs.', transfer: 'Current local disease mix, later care and competing mortality are unknown. Our timing adjustments are explicit analyst approximations.' },
  ],
  reservations: [model.overlap, 'The 20-year timing curve, 70% later cure and excess mortality are judgment calls, not fitted local parameters. They drive the difference between a promising scenario and our central estimate.', 'The trial reinfection rate comes from only four events over 57.9 person-years. It does not establish a permanent local risk or predict reinfection for every patient.', 'Actual incremental drug starts and costs could differ from the transferred trial effect. Treating publicly financed drugs as zero resource cost would overstate cost-effectiveness.', 'A favorable $36.5K scenario is not the ranking estimate or proof of an available opportunity. Donation restrictions, capacity and patient outcomes require provider diligence.'],
  excludedBenefits: ['Reduced onward transmission', 'Avoided future healthcare expenditure', 'Family welfare and income', 'Retreatment benefits and costs', 'Irreversible disease prevented before later usual-care cure'],
  sources: model.sources,
};
export default function SfchcResearchPage() { return <CharityResearchReport content={content} />; }
