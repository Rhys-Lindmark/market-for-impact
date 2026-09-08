import type { Metadata } from 'next';
import CharityResearchReport, { type CharityReportContent } from '@/components/CharityResearchReport';
import model from '@/data/san-francisco/healthright-moud-cea-v1.json';
import { moudAccessModel } from '@/lib/moud-access-model.mjs';

export const metadata: Metadata = { title: 'HealthRIGHT 360: cost-effectiveness | Market for Impact', description: 'Additional medication-access capacity: an explicit best estimate, trial transfer, funding boundaries and sensitivity analysis.' };
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const num = new Intl.NumberFormat('en-US', { maximumSignificantDigits: 3 });
const scenarios = model.scenarios.map(s => ({ ...s, result: moudAccessModel(s) }));
const central = scenarios.find(s => /central/i.test(s.name))!;
const r = central.result;
const price = (v: number | null) => v === null ? 'No finite positive price' : money.format(v) + ' per 10 QALYs';
const content: CharityReportContent = {
  organization: model.organization, program: model.program, eyebrow: 'SAN FRANCISCO · MECHANISM-FIRST BET 2 · EXPLORATORY',
  published: '7 September 2026', modelVersion: model.version,
  nutshell: {
    headline: 'Effective medication does not automatically make a full new clinical team a cheap philanthropic bet.',
    body: <>Our best guess is <strong>{money.format(r.costPerTenQalys!)} per better life: 10 incremental QALYs</strong> for a hypothetical two-year nurse-led access expansion. We would not prioritize this full-capacity package for a donor seeking under $100,000 per better life. A much cheaper, genuinely binding access bottleneck could change our view, but cannot inherit the whole clinical team’s effect. <a href="/api/sf-healthright-model">Inspect the model →</a></>,
    whyItMayWork: 'More medication-covered time can reduce mortality and improve health for people otherwise unable to obtain effective treatment.',
    whyWeAreCautious: 'Added staffing is expensive and much observed care would happen anyway. Our local effect, mortality transfer and funding assumptions are highly uncertain.',
    recommendationBlocker: 'No priced, unfunded ICC expansion or current incremental treatment-time outcome has been verified.',
  },
  summary: [
    { label: 'OUR BEST GUESS', value: money.format(r.costPerTenQalys!), detail: 'per 10 QALYs; hypothetical two-year capacity package' },
    { label: 'POSITIVE SCENARIOS', value: '$261K–$10.3B', detail: 'Joint analyst cases, not confidence bounds; null/harm possible' },
    { label: 'EVIDENCE', value: 'Very low for price', detail: 'External access trial; observational mortality; local transfer judgment' },
    { label: 'FUNDING ROOM', value: 'Unverified', detail: 'Existing services are not a marginal funding offer' },
  ],
  programSection: {
    body: 'HealthRIGHT 360’s Integrated Care Center at 1563 Mission lists medication-assisted treatment alongside primary, dental and mental-health care. This review considers additional nurse-led outpatient access, not residential treatment, the whole organization or a confirmed proposed project.',
    steps: [
      { title: 'Find a binding capacity gap', detail: 'Establish whether nursing, prescribing, appointments or another obstacle prevents treatment that would not be obtained elsewhere.' },
      { title: 'Measure additional covered time', detail: 'Count medication-covered person-years beyond usual care. Offers, appointments and starts are intermediate steps, not independent benefits.' },
      { title: 'Translate to health', detail: 'Apply an explicitly uncertain mortality bridge and a small subjective nonfatal utility gain; reconcile public funding and shared patients.' },
    ],
    boundary: 'Program availability does not establish same-day prescribing, an open slot or an unfunded expansion. A nonclinical navigator is a different intervention and cannot simply borrow a nurse-team trial effect.',
  },
  model: {
    headline: 'Our best estimate: ' + price(r.costPerTenQalys),
    body: 'We calibrate one clinic to 171,526 patients across six trial intervention clinics and 8.2 additional medication-years per 10,000 patients over two years: 23.44 medication-years. Halving the transferred access effect, then applying 50% funding additionality and 90% buprenorphine share leaves 5.27 additional buprenorphine-years. Clinical costs of $238,888 plus $229,676 are multiplied by a judgmental 1.25 local/current-cost factor: $585,705. Costs are undiscounted; benefits are placed at year one and discounted 3%. The trial’s rollout window and the costing study’s first-treatment-year clock are not identical.',
    equation: { label: 'DOLLARS PER BETTER LIFE', expression: '10 × donor cost ÷ [added buprenorphine-years × ((0.0095 − 0.0043) × 0.5 × 5.154 + 0.03) ÷ 1.03]', result: price(r.costPerTenQalys) },
    inputs: model.assumptions.map(a => ({ key: a.key, label: a.label, confidence: 'Source calibration or explicit judgment; see basis', best: String(central[a.key as keyof typeof central]), range: scenarios.map(s => String(s[a.key as keyof typeof s])).join(' / '), basis: a.basis })),
    inputColumnLabel: 'Optimistic / central / pessimistic',
    giftHeading: 'Illustrative $100,000: ' + num.format(r.qalysPer100k) + ' QALYs, not available funding room',
    sensitivity: scenarios.map(s => ({ case: s.name, headline: price(s.result.costPerTenQalys), detail: num.format(s.result.additionalBuprenorphineYears) + ' additional buprenorphine-years; ' + num.format(s.result.netQalys) + ' QALYs per two-year package.' })),
    uncertaintyBoundary: model.nullBoundary,
    fundingBoundary: model.costPerspective + ' The full-resource version is ' + price(r.resourceCostPerTenQalys) + ', adding $1,000 per local incremental medication-year as an unverified pharmacy-cost assumption. It still excludes later healthcare and patient time; it is not a complete societal CEA.',
  },
  comparisonBridge: {
    headline: 'What would reverse our conclusion?',
    body: 'At the central health effect, donor cash would have to fall below ' + money.format(r.maximumDonorCostFor100k!) + ' for the entire package to beat $100,000 per 10 QALYs. That is a threshold, not an available offer. Even our favorable full-team scenario remains above the target. A lower-cost supplemental proposal needs its own additionality evidence, not attribution of benefits already purchased by public care.',
    equation: { label: 'MAXIMUM CASH AT THIS HEALTH EFFECT', expression: 'Central net QALYs × $10,000 per QALY', result: money.format(r.maximumDonorCostFor100k!) },
    inputs: [],
    sensitivity: [
      { case: 'Mortality only; no subjective nonfatal utility gain', headline: price(moudAccessModel({ ...central, nonfatalUtilityGain: 0 }).costPerTenQalys), detail: 'Tests the health-utility judgment instead of presenting a published health-state level as a causal gain.' },
      { case: 'Zero additional access and zero extra harm', headline: price(moudAccessModel({ ...central, accessTransfer: 0 }).costPerTenQalys), detail: 'Existing patients served differently without extra medication coverage produce no modeled benefit.' },
      { case: '0.05 extra deaths beyond the calibration', headline: price(moudAccessModel({ ...central, extraDeaths: .05 }).costPerTenQalys), detail: 'Illustrative cessation/implementation harm stress test, not an estimated local penalty.' },
    ],
    boundary: model.overlap,
  },
  evidence: [
    { key: 'access', design: 'PROUD cluster randomized trial', population: 'Twelve primary-care clinics in six US systems; two years after randomization', result: 'Adjusted gain: 8.2 medication-years per 10,000 patients; the measured treatment included buprenorphine and extended-release naltrexone.', transfer: 'Six intervention clinics establish our reference size, not ICC reach. A further expansion may have a smaller effect than introducing the model.' },
    { key: 'retention', design: 'Secondary trial analysis', population: 'Newly treated and ongoing medication patients over three years', result: 'No measurable increase in treatment duration among treated patients; benefits primarily reflected access.', transfer: 'Do not apply an additional retention multiplier. The absence of a significant effect is not proof that every retention intervention fails.' },
    { key: 'mortality', design: 'Meta-analysis of observational cohorts', population: 'Older buprenorphine cohorts, not contemporary San Francisco', result: 'Pooled mortality was 4.3 versus 9.5 deaths per 1,000 person-years in versus out of treatment.', transfer: 'Unadjusted associations are not causal risk differences. We retain half the difference by judgment; cessation risk and population selection remain unresolved.' },
    { key: 'cost', design: 'Primary microcosting', population: 'PROUD implementation; national 2023 prices and an assumed 75 monthly treated-patient caseload', result: 'Clinical package: $238,888 first year and $229,676 subsequent year.', transfer: 'Neither a local quote nor a cost per additional treated person. Pharmacy resources are separately stress-tested rather than claimed to be included in the clinical totals.' },
  ],
  reservations: [model.overlap, 'The 0.03 nonfatal utility gain is an analyst judgment, not a measured treatment effect. Both it and mortality transfer can be zero or negative.', 'The model gives no mortality or utility credit to naltrexone time; it does not claim naltrexone lacks benefit or advise patients to switch medications.', 'City outpatient budgets include other behavioral services and cannot be divided by clients to obtain marginal medication cost. Existing payer support can displace a gift.', 'Five future discounted QALYs per avoided acute death is a survival assumption, not permanent protection from treatment. Repeated grants require deduplicated person-time and survival accounting.'],
  excludedBenefits: ['Nonfatal benefits outside the explicitly modeled 0.03 utility increment', 'Family welfare, income and criminal-legal outcomes', 'Effects of naltrexone and other medications', 'Healthcare cost offsets and patient time'],
  sources: model.sources,
};
export default function HealthrightResearchPage() { return <CharityResearchReport content={content} />; }
