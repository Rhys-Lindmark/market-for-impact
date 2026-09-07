import type { Metadata } from 'next';
import CharityResearchReport, { type CharityReportContent } from '@/components/CharityResearchReport';
import model from '@/data/san-francisco/sfaf-naloxone-cea-v1.json';
import { discountedSurvivalQalys, naloxoneDecisionModel } from '@/lib/naloxone-model.mjs';

export const metadata: Metadata = {
  title: 'San Francisco AIDS Foundation: overdose prevention | Market for Impact',
  description: 'Our exploratory best estimate for targeted naloxone outreach: dollars per 10 QALYs, assumptions, sensitivity and funding constraints.',
};

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const number = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });
const scenarios = model.scenarios.map((s) => {
  const qalys = discountedSurvivalQalys(s);
  return { ...s, qalys, result: naloxoneDecisionModel({ ...s, reportedReversals: model.reported.reversals, distributedDoses: model.reported.doses, qalysPerDeathPrevented: qalys }) };
});
const central = scenarios[1];
const best = money.format(central.result.costPerTenQalys!);
const content: CharityReportContent = {
  organization: model.organization,
  eyebrow: 'CHARITY RESEARCH · SAN FRANCISCO · EXPLORATORY',
  program: model.program,
  donationUrl: 'https://donate.sfaf.org/campaign/773029/donate',
  published: '7 September 2026',
  modelVersion: model.version,
  nutshell: {
    headline: 'A promising low-cost health intervention—if new money reaches otherwise uncovered overdoses.',
    body: <>Our best guess for an additional expansion is <strong>{best} per better life (10 QALYs), conditional on additional reach</strong>. This is a very-low-confidence analyst model, not a measured SFAF result or an available funding offer. It connects local service reporting to explicit assumptions about coverage, acute survival and subsequent health. We would prioritize investigating a concrete expansion before committing a large gift. <a href="https://ai.rhyslindmark.com/donate/api/sf-naloxone-model">Inspect the versioned model inputs and calculated results →</a></>,
    whyItMayWork: 'A relatively inexpensive emergency intervention can prevent an otherwise fatal event. SFAF already operates fixed and mobile distribution in SF.',
    whyWeAreCautious: 'Reported reversals are not lives saved. Existing free supply, alternative rescue and repeated recipients can sharply reduce the benefit of the next donation.',
    recommendationBlocker: 'A current unfunded expansion and recipient-linked additional outcomes are unverified. Our positive central estimate is not a verified funding offer.',
  },
  summary: [
    { label: 'OUR BEST GUESS', value: best, detail: 'per 10 incremental QALYs; judgmental local-output transfer' },
    { label: 'POSITIVE SCENARIOS', value: '$5K–$1.67M', detail: 'Not a confidence interval; zero additional benefit remains possible' },
    { label: 'EVIDENCE', value: 'Very low locally', detail: 'Strong mechanism; uncertain marginal donor effect' },
    { label: 'FUNDING ROOM', value: 'Unverified', detail: 'No published additional allocation has been verified' },
  ],
  programSection: {
    body: 'SFAF supplies intranasal and injectable naloxone with overdose-response training at its 6th Street Center, mobile sites and Strut. This review concerns expanding targeted outreach, not all SFAF services or the purchase of medication already supplied through public programs.',
    steps: [
      { title: 'Reach likely witnesses', detail: 'Get training and supplies to people likely to encounter an overdose who would otherwise lack effective coverage.' },
      { title: 'Enable timely response', detail: 'A trained witness can respond before an otherwise fatal event. Many reported responses would also have survived through another route.' },
      { title: 'Credit additional survival', detail: 'Count only additional acute survival, then allow for later mortality and imperfect health. Do not count every reversal as one life saved.' },
    ],
    boundary: '2025 reporting lists 41,399 doses, 10,041 trainings and 2,852 reported reversals. These are organization-wide outputs, not a linked cohort or causal evaluation of a donation.',
  },
  model: {
    headline: 'Our best estimate: ' + best + ' per 10 QALYs.',
    body: 'The model starts with reported reversals per dose, halves that yield for the marginal program, and credits additional acute survival in only 2% of retained reports. The cost assumption is $20 per dose. A survival calculation credits about 5.15 discounted QALYs per prevented acute death. These adjustments are judgments, not measured SFAF coefficients. The 2025 reports are not linked to the doses distributed that year: projecting this ratio onto future doses is an analyst extrapolation.',
    equation: { label: 'DOLLARS PER BETTER LIFE', expression: '10 × $20 ÷ [(2,852 ÷ 41,399) × 50% × 2% × 5.1541]', result: '≈ ' + best + ' per 10 QALYs' },
    inputs: model.judgments.map((j) => ({ key: j.key, label: j.label, confidence: 'Explicit analyst assumption', best: String(central[j.key as keyof typeof central]), range: scenarios.map((s) => String(s[j.key as keyof typeof s])).join(' / '), basis: j.basis })),
    inputColumnLabel: 'Optimistic / central / pessimistic inputs',
    giftHeading: 'An illustrative $100,000: ' + number.format(central.result.additionalQalys) + ' QALYs',
    sensitivity: scenarios.map((s) => ({ case: s.name, headline: money.format(s.result.costPerTenQalys!) + ' per 10 QALYs', detail: number.format(s.result.additionalQalys) + ' QALYs per $100K; ' + number.format(s.qalys) + ' QALYs per additional acute survivor' })),
    uncertaintyBoundary: model.nullBoundary,
    fundingBoundary: 'The $100,000 example is not available funding room. Continued public medication supply for the expansion is assumed, not guaranteed. A general SFAF donation is not automatically restricted to this program. This donor-budget perspective excludes publicly supplied medication, subsequent healthcare costs and wider resource costs; it cannot be compared directly with a full societal ICER.',
  },
  comparisonBridge: {
    headline: 'How much healthy survival does an acute rescue add?',
    body: 'We integrate survival over a capped horizon rather than assuming normal remaining life expectancy. H is an annual mortality hazard, d is the annual discount rate, T is years and U is health utility. The result is conditional on genuinely preventing an acute death; multiplying it by all reported reversals would be wrong.',
    equation: { label: 'DISCOUNTED FUTURE QALYS PER ADDITIONAL ACUTE SURVIVOR', expression: 'U × [1 − exp(−(H + ln(1+d)) × T)] ÷ (H + ln(1+d))', result: number.format(central.qalys) + ' QALYs with U=0.70, H=0.08, T=15, d=0.03' },
    inputs: [],
    sensitivity: [1, 0.75, 0.5, 0.25].map((share) => ({ case: (share * 100) + '% lifetime credit retained', headline: money.format(central.result.costPerTenQalys! / share) + ' per 10 QALYs', detail: 'Additional stress test of residual repeat-rescue overlap after the existing aggregate 50% adjustment; not an empirical estimate.' })),
    boundary: 'Later deaths and poor health are included approximately, not measured longitudinally. A constant hazard does not represent aging, treatment transitions or repeated rescue events. Repeated benefits may still be overstated without person-linked records.',
  },
  evidence: [
    { key: 'local', design: 'Organization reporting and proposed public agreement', population: 'SFAF SF services; different scopes in 2024 and 2025', result: 'The planned $250K annual bundle divided by 26,016 target doses is $9.61 per target dose. We use $20 as a marginal cost judgment.', transfer: 'Planned targets are not executed accounts. Do not divide this budget by organization-wide reported reversals as if they share a scope.' },
    { key: 'survival', design: 'External observational cohorts', population: 'US and Massachusetts nonfatal overdose survivors', result: 'Published mortality anchors include 778.3 deaths per 10,000 person-years and 5.5% mortality in one year.', transfer: 'We assume a constant 8% annual hazard, 0.70 health utility and a 15-year credited horizon; these are not contemporary SF survival estimates.' },
    { key: 'counterfactual', design: 'Historical decision model', population: 'Heroin users; older drug and rescue environment', result: 'The original model used 89.9% survival without medical assistance or lay naloxone.', transfer: 'Our 2% additional-survival assumption is much lower than the implied 10.1% mortality. The 2017 correction text remains unverified; this model does not use its kits-per-death result.' },
    { key: 'coverage', design: '2026 HEALing Communities microsimulation', population: '26 communities outside SF', result: 'Some communities were modeled with no additional naloxone expansion because their baseline already met the enhanced-distribution definition.', transfer: 'This supports checking existing coverage, not assuming zero effectiveness in SF. The paper uses a different, higher cost-effectiveness threshold.' },
  ],
  reservations: [
    'The 50% marginal-yield adjustment and 2% additional-survival probability dominate the result; neither has been measured for SFAF expansion.',
    'Repeating lifetime benefits for repeated rescues of the same person can overcount. The aggregate retention adjustment is not a substitute for a person-linked survival model.',
    'Annual doses and reports can concern different periods, sources or repeat events; the observed ratio is an operational anchor, not a biological probability.',
    'Existing funding and free naloxone may leave little additional coverage for philanthropy. A gift that displaces existing support can have no incremental benefit.',
    'At central survival and cost, the product of retention and additional-survival probability must exceed about 0.00563 to beat $100K per 10 QALYs. Our central product is 0.01; modest assumption changes can reverse the conclusion.',
  ],
  excludedBenefits: model.excluded,
  sources: model.sources,
};

export default function SFAFReport() {
  return <CharityResearchReport content={content} />;
}
