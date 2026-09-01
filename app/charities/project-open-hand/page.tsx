import type { Metadata } from 'next';
import CharityResearchReport, { type CharityReportContent } from '@/components/CharityResearchReport';
import review from '@/data/san-francisco/project-open-hand-review-v1.json';
import model from '@/data/san-francisco/project-open-hand-mtm-cea-v1.json';
import bridge from '@/data/san-francisco/heart-failure-hospitalization-qaly-bridge-v1.json';

export const metadata: Metadata = {
  title: 'Project Open Hand medically tailored meals — charity research | Market for Impact',
  description: 'Our evidence review and exploratory heart-failure cost-effectiveness model for Project Open Hand medically tailored meals.',
  openGraph: { title: 'Project Open Hand — charity research', description: 'A source-grounded review that preserves the null primary endpoint and models the narrower heart-failure hypothesis.', images: [] },
  twitter: { card: 'summary', title: 'Project Open Hand — charity research', description: 'A source-grounded review that preserves the null primary endpoint and models the narrower heart-failure hypothesis.', images: [] },
};

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const compactMoney = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 });
const number = new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 });
const percent = new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 1 });
const cost = model.inputs.find((input) => input.key === 'modeled_marginal_cost_per_course_usd')!;
const effect = model.inputs.find((input) => input.key === 'causal_heart_failure_hospitalization_reduction')!;
const evidenceKeys = new Set(['kp-nourish', 'chefs-hiv', 'medi-cal-pilot']);
const formatInput = (value: number, unit: string) => {
  if (unit === 'USD') return money.format(value);
  if (unit === 'proportion') return percent.format(value);
  return `${number.format(value)} ${unit}`;
};

const content: CharityReportContent = {
  organization: 'Project Open Hand',
  eyebrow: 'CHARITY RESEARCH · SAN FRANCISCO',
  program: 'Post-discharge medically tailored meals for adults with known heart failure',
  donationUrl: review.organization.donationUrl,
  published: '31 August 2026',
  modelVersion: model.version,
  nutshell: {
    headline: 'A real randomized test—and a result that resists a simple endorsement.',
    body: <>Project Open Hand helped deliver meals in a 1,977-person randomized trial. The intervention <strong>did not reduce the primary outcome of all-cause hospitalization</strong>: 27.1% with meals versus 24.6% with usual care. A narrower exploratory analysis among participants with heart failure found 7.9% versus 13.2% heart-failure hospitalization. We discount that subgroup result and estimate <strong>about {money.format(model.bottomLine.costPerAdditionalHeartFailureHospitalizationAvertedUsd)} per additional 90-day heart-failure hospitalization averted</strong>. Bridging only that admission’s short-term quality-of-life loss yields <strong>about {compactMoney.format(bridge.bottomLine.costPerTenQalysUsd)} per 10 QALYs—one better life</strong>. Both figures are conditional on the exploratory effect being real and transferable; a null remains plausible.</>,
    whyItMayWork: 'After discharge, a condition-matched meal can make a heart-failure diet feasible when illness, low income, mobility, or cooking constraints would otherwise undermine adherence.',
    whyWeAreCautious: 'The primary outcome was null, the favorable heart-failure result was exploratory, two meal providers were pooled, and the public cost anchor describes a different meal intensity.',
    recommendationBlocker: 'Project Open Hand has not published a current heart-failure cohort, provider-only outcome, course price, payer-denial funnel, or marginal plan showing that a private gift creates additional courses rather than replacing reimbursed care.',
  },
  summary: [
    { label: 'PRIMARY ENDPOINT', value: 'No benefit shown', detail: 'all-cause hospitalization was 27.1% with meals versus 24.6% usual care' },
    { label: 'COST PER BETTER LIFE', value: '≈ $133M', detail: 'per 10 QALYs, counting only short-term morbidity from an avoided heart-failure admission' },
    { label: 'POSITIVE-EFFECT SENSITIVITY', value: '$32M–$7.8B', detail: 'conditional on a positive heart-failure effect; a null effect has no finite impact price' },
    { label: 'FUNDING ROOM', value: 'Not published', detail: 'the $100,000 gift is a scenario, not a current marginal offer' },
  ],
  programSection: {
    body: 'The modeled pathway begins with an adult recently discharged after a hospitalization who has known heart failure. A health system or community partner identifies eligibility, Project Open Hand prepares and delivers condition-matched meals, and the outcome is a heart-failure hospitalization within 90 days. The evidence intervention delivered one large meal per day for up to 10 weeks; the California budget anchor covered three meals per day for 12 weeks plus nutrition and case-management components.',
    steps: [
      { title: 'Identify a high-risk discharge', detail: 'A participating health system identifies an adult with known heart failure who is returning home.' },
      { title: 'Match meals to the condition', detail: 'Meals prioritize heart-failure nutrition standards and account for co-occurring diabetes or kidney disease.' },
      { title: 'Deliver the course', detail: 'Project Open Hand or a partner delivers meals; some programs add dietitian counseling or case management.' },
      { title: 'Measure the 90-day outcome', detail: 'A recommendation-grade version would link every eligible participant to complete all-cause and heart-failure hospitalization data.' },
    ],
    boundary: 'The model covers one targeted post-discharge heart-failure pathway. It excludes Project Open Hand’s HIV services, groceries, senior meals, disability programs, produce prescriptions, community nutrition, and the organization-wide meal count. It also does not turn the exploratory mortality result into lives saved.',
  },
  model: {
    headline: 'Primary result: no demonstrated all-cause benefit. Conditional heart-failure model: roughly $213,000 per admission averted.',
    body: 'California authorized $6 million to serve 1,413 medically tailored meal participants, implying $4,246 per targeted participant. We round that to a $4,250 best-guess course cost, with a $3,000–$7,000 range. We then discount the randomized exploratory 5.3-point heart-failure hospitalization difference to a 2.0-point best guess because the primary endpoint was null, multiple outcomes were tested, two providers were pooled, and the current Project Open Hand pathway is unpublished.',
    equation: { label: 'CONDITIONAL COST PER ADDITIONAL HEART-FAILURE HOSPITALIZATION AVERTED', expression: `${money.format(cost.best)} ÷ ${percent.format(effect.best)}`, result: `= ${money.format(model.bottomLine.costPerAdditionalHeartFailureHospitalizationAvertedUsd)}` },
    inputs: model.inputs.slice(1).map((input) => ({ key: input.key, label: input.label, confidence: input.confidence, best: formatInput(input.best, input.unit), range: `${formatInput(input.low, input.unit)}–${formatInput(input.high, input.unit)}`, basis: input.basis })),
    giftHeading: `What would ${money.format(model.bottomLine.giftUsd)} buy in the conditional model?`,
    sensitivity: model.sensitivity.map((row) => ({ case: row.case, headline: `${number.format(row.additionalHeartFailureHospitalizationsAvertedPer100k)} heart-failure hospitalizations averted`, detail: `${number.format(row.mealCoursesPer100k)} modeled courses · ${compactMoney.format(row.costPerAdditionalHeartFailureHospitalizationAvertedUsd)} each` })),
    uncertaintyBoundary: model.nullEffectBoundary,
    fundingBoundary: model.fundingRoom.boundary,
  },
  comparisonBridge: {
    headline: 'About $133 million per 10 QALYs—conditional on the exploratory heart-failure effect.',
    body: 'The bridge deliberately counts only the short-term morbidity of an avoided acute heart-failure admission. NICE’s model implies 0.016 QALY per admission from a six-week utility dip. The sensitivity spans an acute-stay-only floor from ASCEND-HF to a 90-day recovery profile reported in the heart-failure utility review. It excludes mortality, downstream readmissions, caregiver effects, medical savings, and the direct quality-of-life effects of meals.',
    equation: { label: 'CONDITIONAL COST PER 10 QALYS (ONE BETTER LIFE)', expression: `${money.format(model.bottomLine.costPerAdditionalHeartFailureHospitalizationAvertedUsd)} ÷ ${number.format(bridge.bottomLine.qalyPerHeartFailureHospitalizationAverted)} QALY × 10`, result: `= ${money.format(bridge.bottomLine.costPerTenQalysUsd)}` },
    inputs: bridge.inputs.map((input) => ({ key: input.key, label: input.label, confidence: input.confidence, best: formatInput(input.best, input.unit), range: `${formatInput(input.low, input.unit)}–${formatInput(input.high, input.unit)}`, basis: input.basis })),
    sensitivity: [
      { case: 'Optimistic positive effect', headline: compactMoney.format(bridge.bottomLine.conditionalPositiveEffectRangeUsd.low), detail: 'per 10 QALYs · $56,604 per admission averted ÷ 0.0175 QALY × 10' },
      { case: 'MFI best guess', headline: compactMoney.format(bridge.bottomLine.costPerTenQalysUsd), detail: '$212,500 per admission averted ÷ 0.016 QALY × 10' },
      { case: 'Small positive effect', headline: compactMoney.format(bridge.bottomLine.conditionalPositiveEffectRangeUsd.high), detail: '$1.4 million per admission averted ÷ 0.0018 QALY × 10' },
    ],
    boundary: bridge.nullEffectBoundary,
  },
  evidence: review.evidence.filter((item) => evidenceKeys.has(item.key)),
  reservations: review.reservations,
  excludedBenefits: model.excludedBenefits,
  sources: [...review.sources.filter((source) => model.sources.some((modelSource) => modelSource.url === source.url)), ...bridge.sources],
};

export default function ProjectOpenHandResearchPage() {
  return <CharityResearchReport content={content} />;
}
