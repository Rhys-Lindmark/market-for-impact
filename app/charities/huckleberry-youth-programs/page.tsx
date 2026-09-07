import type { Metadata } from 'next';
import CharityResearchReport, { type CharityReportContent } from '@/components/CharityResearchReport';
import model from '@/data/san-francisco/huckleberry-counseling-cea-v1.json';
import { directQalyModel } from '@/lib/direct-qaly-model.mjs';
export const metadata: Metadata = { title: 'Huckleberry Youth Programs | Market for Impact', description: 'An exploratory adolescent counseling model, with explicit direct-QALY transfer assumptions.' };
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 2 });
const scenarios = model.scenarios.map(s => ({ ...s, result: directQalyModel(s) }));
const central = scenarios[1];
const content: CharityReportContent = {
 organization: model.organization, program: model.program, eyebrow: 'CHARITY RESEARCH · SAN FRANCISCO · EXPLORATORY', published: '7 September 2026', modelVersion: model.version,
 nutshell: {
  headline: 'A direct health measure supports a model—not a claim that local counseling is cheap.',
  body: <>Our best guess is <strong>{money.format(central.result.costPerTenQalys!)} per better life (10 QALYs)</strong> for a proposed brief adolescent anxiety course. This is not a measured Huckleberry effect, nor a model of its entire counseling portfolio. On this narrow health-only estimate, it is not a leading cost-effectiveness choice. <a href="https://ai.rhyslindmark.com/donate/api/sf-huckleberry-model">Inspect assumptions and formulas →</a></>,
  whyItMayWork: 'Accessible behavioral counseling can reduce avoidant behavior and improve functioning for a suitable adolescent anxiety cohort.',
  whyWeAreCautious: 'The local protocol, recipient mix and marginal cost are unverified. The external comparator is assisted referral, not no care.',
  recommendationBlocker: 'A priced additional course with identifiable reimbursement and staffing capacity is missing.',
 },
 summary: [
  { label: 'OUR BEST GUESS', value: money.format(central.result.costPerTenQalys!), detail: 'per 10 incremental QALYs; analyst scenario' },
  { label: 'POSITIVE SCENARIOS', value: '$618K–$71.1M', detail: 'Not local confidence bounds; null benefit possible' },
  { label: 'COST PER OFFER', value: '$2,400', detail: 'Assumed staffing budget, not a quote' },
  { label: 'FUNDING ROOM', value: 'Unverified', detail: 'Medi-Cal and other funding need reconciliation' },
 ],
 programSection: {
  body: 'Huckleberry offers individual, family and group counseling in San Francisco. We model a narrower proposed adolescent anxiety course; do not apply this estimate to crisis intervention, acute suicidality, substance dependence or all trauma services.',
  steps: [{title:'Define the eligible cohort',detail:'Match age, diagnosis and treatment need before transferring evidence.'},{title:'Offer a structured course',detail:'Budget staff delivery, supervision and failed engagement together.'},{title:'Measure incremental health',detail:'Compare with realistic alternative access and retain a time-limited endpoint.'}],
  boundary: 'The organization describes Medi-Cal provision and sliding-scale care. Free care to the recipient does not mean zero resource cost or an unfunded service. Undated relative-year state-contract language is not current funding room.',
 },
 model: {
  headline: 'Our best estimate: ' + money.format(central.result.costPerTenQalys!) + ' per 10 QALYs.',
  body: 'The cost is an explicit nominal-dollar analyst budget: twelve staff hours at $200, including engagement and supervision. We retain half the external health gain for transfer and half for additionality. Neither discount is measured locally.',
  equation: {label:'DOLLARS PER BETTER LIFE',expression:'10 × $2,400 ÷ (0.026 × 50% × 50%)',result:'≈ $3.69M per 10 QALYs'},
  inputs: model.judgments.map(j=>({key:j.key,label:j.label,confidence:'Source anchor or explicit judgment',best:String(central[j.key as keyof typeof central]),range:scenarios.map(s=>String(s[j.key as keyof typeof s])).join(' / '),basis:j.basis})),
  inputColumnLabel:'Optimistic / central / pessimistic inputs',
  giftHeading:'Illustrative $100,000: 41.7 offers and 0.271 QALYs',
  sensitivity:scenarios.map(s=>({case:s.name,headline:money.format(s.result.costPerTenQalys!)+' per 10 QALYs',detail:s.result.additionalQalys.toFixed(3)+' QALYs per $100,000; not available funding room'})),
  uncertaintyBoundary:model.nullBoundary,
  fundingBoundary:'A private gift could fund a genuinely new course, replace reimbursement, or support other services. The present model does not identify which occurs.',
 },
 comparisonBridge: {
  headline:'Use the measured time-integrated endpoint once',body:'A direct external QALY endpoint avoids converting the organization’s aggregate well-being improvement percentage into utility. It still requires a local treatment and population match.',
  equation:{label:'ADDITIONAL HEALTH PER OFFER',expression:'0.026 × 50% × 50%',result:'0.0065 incremental QALYs'},inputs:[],sensitivity:[],
  boundary:'Do not multiply by follow-up duration or completion again. Societal savings in an economic evaluation are not money returned to this donor and are excluded from the numerator.',
 },
 evidence:[{key:'trial',design:'External randomized economic evaluation',population:'185 pediatric anxiety/depression patients; mean age 11.3',result:'The model uses 0.026 incremental HUI2-based QALYs over 32 weeks after 8–12 offered sessions.',transfer:'A mixed-cohort estimate, not an adolescent-anxiety subgroup effect or local causal evidence. Restrict the proposed slice and inspect source eligibility exclusions before adopting the estimate.'}],
 reservations:['No verified match to the exact trial protocol.','Local staffing cost and reimbursement are unknown.','Short health horizon excludes possible durable and family benefits.','Neither a free-to-client service nor an aggregate improvement rate establishes donor additionality.'],
 excludedBenefits:model.excluded,sources:model.sources,
};
export default function HuckleberryReport(){return <CharityResearchReport content={content}/>;}
