import type { Metadata } from 'next';
import CharityResearchReport, { type CharityReportContent } from '@/components/CharityResearchReport';
import model from '@/data/san-francisco/hrtc-therapy-cea-v1.json';
import { therapyDecisionModel } from '@/lib/therapy-model.mjs';
export const metadata: Metadata = { title: 'Harm Reduction Therapy Center | Market for Impact', description: 'An exploratory $5.55M per 10-QALY model for an alcohol-focused mobile behavioral treatment course.' };
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 2 });
const scenarios = model.scenarios.map(s => ({ ...s, result: therapyDecisionModel(s) }));
const central = scenarios[1];
const content: CharityReportContent = {
  organization: model.organization, program: model.program, eyebrow: 'CHARITY RESEARCH · SAN FRANCISCO · EXPLORATORY',
  published: '7 September 2026', modelVersion: model.version,
  nutshell: {
    headline: 'Accessible therapy may improve health, but the modeled benefit is small and short-lived.',
    body: <>Our exploratory best guess is <strong>{money.format(central.result.costPerTenQalys!)} per better life (10 QALYs)</strong>. This is a proposed alcohol-focused slice of Adult Mobile Behavioral Health, not a measured HRTC result or evidence that HRTC uses the exact trial protocol. We would not prioritize it on the current health-only estimate. <a href="https://ai.rhyslindmark.com/givebetter/api/sf-hrtc-model">Inspect the model and assumptions →</a></>,
    whyItMayWork: 'Low-threshold behavioral care can reach adults whom conventional abstinence-first services do not engage.',
    whyWeAreCautious: 'The evidence concerns a specific external alcohol intervention. The score-to-utility mapping has not been validated for change scores.',
    recommendationBlocker: 'An additional course, local health trajectory and incremental private-funding plan are not verified.',
  },
  summary: [
    { label: 'OUR BEST GUESS', value: money.format(central.result.costPerTenQalys!), detail: 'per 10 incremental QALYs; subjective mapped-score model' },
    { label: 'POSITIVE SCENARIOS', value: '$493K–$444M', detail: 'Not confidence bounds; null benefit remains possible' },
    { label: 'COST PER OFFER', value: '$1,500', detail: 'Modeled five-session course plus engagement time' },
    { label: 'FUNDING ROOM', value: 'Unverified', detail: 'Existing public contracts are not donation capacity' },
  ],
  programSection: {
    body: 'HRTC provides mobile and low-threshold therapy. We model offering five alcohol-focused sessions over 12 weeks to adults experiencing homelessness with alcohol-use disorder, using external HaRT-A evidence. This is an analytic proposal within the adult mobile program, not a claim about the dose or protocol currently delivered.',
    steps: [
      { title: 'Offer low-threshold care', detail: 'Engagement and missed-appointment effort are included in the assumed course cost.' },
      { title: 'Deliver behavioral sessions', detail: 'The selected external comparison is HaRT-A alone, excluding injection and medication arms.' },
      { title: 'Credit incremental health time', detail: 'Allow usual care to catch up; do not turn persistent within-person improvement into a permanent treatment advantage.' },
    ],
    boundary: 'The city budget lists 4,530 staff hours at $198.64 and 500 planned clients for the adult mobile program. Budget targets are not executed costs, completed courses or causal outcomes; the separate transition-age-youth contract is excluded.',
  },
  model: {
    headline: 'Our best estimate: ' + money.format(central.result.costPerTenQalys!) + ' per 10 QALYs.',
    body: 'Four physical-component points is an analyst scenario, not a recovered trial endpoint. Multiplying by 0.00781 gives a mapped peak utility change; we halve it for transfer and mapping uncertainty, integrate 18 full-effect-equivalent weeks, and halve again for funding additionality.',
    equation: { label: 'DOLLARS PER BETTER LIFE', expression: '10 × $1,500 ÷ (4 × 0.00781 × 50% × 18/52 × 50%)', result: '≈ $5.55M per 10 QALYs' },
    inputs: model.judgments.map(j => ({ key: j.key, label: j.label, confidence: 'Explicit analyst assumption', best: String(central[j.key as keyof typeof central]), range: scenarios.map(s => String(s[j.key as keyof typeof s])).join(' / '), basis: j.basis })),
    inputColumnLabel: 'Optimistic / central / pessimistic inputs',
    giftHeading: 'Illustrative $100,000: 66.7 offered courses and 0.180 QALYs',
    sensitivity: scenarios.map(s => ({ case: s.name, headline: money.format(s.result.costPerTenQalys!) + ' per 10 QALYs', detail: s.result.additionalQalys.toFixed(3) + ' QALYs per $100,000; conditional, not available funding room' })),
    uncertaintyBoundary: model.nullBoundary,
    fundingBoundary: 'The adult mobile contract extends through June 2029 in the 2024 report. A new private gift may substitute for that funding. The budgeted all-in staff rate is only a cost anchor; current incremental staffing capacity must be established.',
  },
  comparisonBridge: {
    headline: 'A health-score bridge, not measured QALYs',
    body: model.mappingBoundary,
    equation: { label: 'SUBJECTIVE INCREMENTAL TRAJECTORY', expression: '12-week linear rise / 2 + 24-week linear decline / 2', result: '18 full-effect-equivalent weeks, not 36 weeks at peak' },
    inputs: [], sensitivity: [],
    boundary: 'The analysis is per course offered. Trial noncompletion is already embedded in treatment-assignment evidence; do not multiply by a completion rate again. The joint transfer factor allows different local delivery without pretending to measure it.',
  },
  evidence: [
    { key: '2021', design: 'Randomized behavioral-treatment comparison', population: 'Adults experiencing homelessness with alcohol-use disorder', result: 'HaRT-A alone improved physical SF-12 quality of life (d=0.41); no demonstrated mental-quality-of-life effect. Later active-group outcomes plateaued as usual care improved.', transfer: 'Unblinded treatment, missingness and protocol differences remain. Four physical points is a scenario, not d multiplied by a known trial standard deviation.' },
    { key: '2019', design: 'Earlier four-session randomized trial', population: 'Adults experiencing homelessness with alcohol-use disorder', result: 'Quality-of-life differences were inconclusive, despite improvement in alcohol outcomes.', transfer: 'Contrary evidence informs the transfer discount; alcohol outcomes are not added as separate QALYs.' },
    { key: 'mapping', design: 'Group-average utility prediction', population: 'SF-12/SF-36 population datasets', result: 'Hanmer supplies a preference-based SF-6D mapping coefficient for physical scores.', transfer: 'It does not establish the validity of mapping intervention-induced score changes.' },
  ],
  reservations: [
    'Current HRTC course completion and preference-based utility outcomes are missing.',
    'The mapping and benefit-duration assumptions dominate a small modeled health gain.',
    'Even the optimistic positive scenario here exceeds $100K per 10 QALYs.',
    'This is not a model of medication, naloxone, overdose mortality or all HRTC services.',
  ],
  excludedBenefits: model.excluded, sources: model.sources,
};
export default function HRTCReport() { return <CharityResearchReport content={content} />; }
