import type { Metadata } from 'next';
import CharityResearchReport, { type CharityReportContent } from '@/components/CharityResearchReport';
import model from '@/data/san-francisco/hya-medication-access-cea-v1.json';
import { medicationAccessModel } from '@/lib/medication-access-model.mjs';
export const metadata: Metadata = { title: 'Homeless Youth Alliance: medication access | Market for Impact', description: 'A conditional $4.69M per 10-QALY model for supported buprenorphine initiation and retention.' };
const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 2 });
const scenarios = model.scenarios.map(s => ({ ...s, result: medicationAccessModel(s) }));
const central = scenarios[1];
const content: CharityReportContent = {
  organization: model.organization, program: model.program, eyebrow: 'CHARITY RESEARCH · SAN FRANCISCO · EXPLORATORY',
  published: '7 September 2026', modelVersion: model.version,
  nutshell: {
    headline: 'Medication access is a plausible health pathway; the benefit of an extra navigation dollar is much less certain.',
    body: <>Our conditional best guess is <strong>{usd.format(central.result.costPerTenQalys!)} per better life (10 QALYs)</strong>. This models HYA-supported initiation and retention through a collaborative clinic, not all HYA work. It counts additional medication-covered time, not referrals as successful treatment. We would seek a specific expansion plan before prioritizing a gift. <a href="https://ai.rhyslindmark.com/givebetter/api/sf-hya-model">Inspect the inputs and calculations →</a></>,
    whyItMayWork: 'Low-threshold support can help someone begin and remain on treatment that is associated with lower mortality.',
    whyWeAreCautious: 'Local additional uptake, coverage days and marginal staffing cost are unmeasured; the mortality association comes from a different adult cohort.',
    recommendationBlocker: 'No verified additional HYA allocation, prescriber capacity or linked medication-covered-time outcome is available.',
  },
  summary: [
    { label: 'OUR BEST GUESS', value: usd.format(central.result.costPerTenQalys!), detail: 'per 10 incremental QALYs; conditional mortality-only scenario' },
    { label: 'POSITIVE SCENARIOS', value: '$77K–$1.48B', detail: 'Not confidence bounds; optimistic case is not the expected price' },
    { label: 'COST PER INITIATION', value: '$2,793', detail: 'Assumed ten support hours at a shared-service benchmark' },
    { label: 'FUNDING ROOM', value: 'Unverified', detail: 'Public medication and clinical capacity are complementary' },
  ],
  programSection: {
    body: 'A March 2025 collaborative schedule places Street Medicine and buprenorphine services at HYA. The modeled philanthropic role is additional engagement and retention support, conditional on clinical and pharmacy capacity. It is not a claim that HYA alone provides or finances the medication.',
    steps: [
      { title: 'Support actual initiation', detail: 'Allocate engagement effort across supported starts; referral counts alone do not demonstrate medication access.' },
      { title: 'Add covered time', detail: 'Follow fills and coverage days. Sporadic prescriptions, appointments and adherence are distinct measures.' },
      { title: 'Estimate survival benefit cautiously', detail: 'Apply an externally observed mortality association only to additional time, with explicit causal and population uncertainty.' },
    ],
    boundary: model.overlapBoundary,
  },
  model: {
    headline: 'Our best estimate: ' + usd.format(central.result.costPerTenQalys!) + ' per 10 QALYs.',
    body: 'The central scenario assumes $2,793.20 per supported start, half genuinely additional, three medication-covered months, a 5% annual untreated mortality rate, an associated hazard ratio of 0.63, half-strength causal/population transfer and about 5.1541 QALYs per averted death.',
    equation: { label: 'DOLLARS PER BETTER LIFE', expression: '10 × $2,793.20 ÷ [50% × 0.25 × 0.05 × (1 − 0.63) × 50% × 5.1541]', result: '≈ $4.69M per 10 QALYs' },
    inputs: model.judgments.map(j => ({ key: j.key, label: j.label, confidence: 'External anchor or explicit analyst assumption', best: String(central[j.key as keyof typeof central]), range: scenarios.map(s => String(s[j.key as keyof typeof s])).join(' / '), basis: j.basis })),
    inputColumnLabel: 'Optimistic / central / pessimistic inputs',
    giftHeading: 'Illustrative $100,000: 35.8 supported starts and 0.213 QALYs',
    sensitivity: scenarios.map(s => ({ case: s.name, headline: usd.format(s.result.costPerTenQalys!) + ' per 10 QALYs', detail: s.result.additionalQalys.toFixed(3) + ' QALYs per $100,000; not a funding offer' })),
    uncertaintyBoundary: model.nullBoundary,
    fundingBoundary: 'The May 2026 shared grant is proposed, subject to final city budgets; neither payment nor a specific subcontract amount is established here. The model excludes publicly financed medication and prescriber costs, so it is a donor-budget model rather than a societal ICER.',
  },
  comparisonBridge: {
    headline: 'The under-$100K result requires several favorable assumptions together',
    body: 'The optimistic case combines cheaper support, greater additionality, six covered months, a higher-risk population, a stronger association and more future healthy survival. It is a stress scenario, not independent evidence of a cheap marginal HYA opportunity.',
    equation: { label: 'CENTRAL QALYS PER SUPPORTED START', expression: '0.5 × 0.25 × 0.05 × 0.37 × 0.5 × 5.1541', result: '0.005959 QALYs' },
    inputs: [], sensitivity: [],
    boundary: 'Rate multiplied by duration is a small-risk approximation. The external primary exposure includes a post-discontinuation month; transferring it to medication-covered time is approximate. The constant future-survival illustration does not model treatment transitions, aging or repeated interventions.',
  },
  evidence: [
    { key: 'local', design: 'Uncontrolled SF Street Medicine cohort', population: '95 homeless heroin injectors; mean age 39.2', result: 'Medication retention was 37%, 27%, 27%, 26% and 18% at months 1, 3, 6, 9 and 12.', transfer: 'Active prescriptions for over two weeks in a sampled month were the criterion—not adherence. Three covered months is a judgment, not calculated from these observations or specific to HYA youth.' },
    { key: 'mortality', design: 'Adjusted observational cohort', population: 'Massachusetts adult overdose survivors', result: 'Buprenorphine was associated with lower all-cause mortality: adjusted hazard ratio 0.63, with 95% interval 0.46–0.87.', transfer: 'Residual confounding and local risk differences remain; the model discounts the association and does not interpret it as an HYA causal effect.' },
    { key: 'budget', design: 'Proposed city agreement', population: 'SFAF and named subcontractors', result: 'A shared $279.32 service-hour benchmark spans many activities and organizations.', transfer: 'Not an HYA marginal rate or a buprenorphine course cost. Ten hours is an analyst allocation.' },
  ],
  reservations: [
    'The next gift may replace existing support rather than add medication-covered time.',
    'The external adult risk and survival assumptions may poorly describe HYA recipients.',
    'Publicly funded clinical services must have spare capacity for support spending to translate into treatment.',
    'Do not add full modeled HYA and SFAF mortality benefits for overlapping recipients or shared funding.',
  ],
  excludedBenefits: model.excluded, sources: model.sources,
};
export default function HYAReport() { return <CharityResearchReport content={content} />; }
