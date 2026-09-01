import type { Metadata } from 'next';
import CharityResearchReport, { type CharityReportContent } from '@/components/CharityResearchReport';
import review from '@/data/san-francisco/sf-marin-food-bank-review-v1.json';
import model from '@/data/san-francisco/sf-marin-food-bank-community-market-cea-v1.json';
import bridge from '@/data/san-francisco/sf-marin-food-bank-qaly-bridge-audit-v1.json';

export const metadata: Metadata = {
  title: 'SF–Marin Food Bank Community Markets — charity research | Market for Impact',
  description: 'Our evidence review and exploratory food-security cost-effectiveness model for San Francisco–Marin Food Bank Community Markets.',
  openGraph: { title: 'SF–Marin Food Bank — charity research', description: 'A source-grounded Community Market review with an explicit cash-cost boundary, transferred evidence, and null case.', images: [] },
  twitter: { card: 'summary', title: 'SF–Marin Food Bank — charity research', description: 'A source-grounded Community Market review with an explicit cash-cost boundary, transferred evidence, and null case.', images: [] },
};

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const compactMoney = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 });
const number = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });
const percent = new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 1 });
const cost = model.inputs.find((input) => input.key === 'modeled_cash_cost_per_26_week_household_course_usd')!;
const effect = model.inputs.find((input) => input.key === 'causal_absolute_very_low_food_security_reduction')!;
const formatInput = (value: number, unit: string) => unit === 'USD' ? money.format(value) : unit === 'proportion' ? percent.format(value) : `${number.format(value)} ${unit}`;

const content: CharityReportContent = {
  organization: 'San Francisco–Marin Food Bank',
  eyebrow: 'CHARITY RESEARCH · SAN FRANCISCO',
  program: 'Community Markets: client-choice food access with navigation and support',
  donationUrl: review.organization.donationUrl,
  published: '1 September 2026',
  modelVersion: model.version,
  nutshell: {
    headline: 'A huge food-distribution engine; a promising program model; an unmeasured causal result.',
    body: <>SFMFB reports serving <strong>44,000 households weekly</strong> and nearly 56 million meals-equivalent in FY2025. Its Community Markets offer client choice and support, but SFMFB has not published a causal food-security estimate. Using audited pantry cash costs and heavily discounted external randomized evidence, we estimate <strong>about {money.format(model.bottomLine.costPerAdditionalHouseholdNotExperiencingVeryLowFoodSecurityUsd)} per additional household not experiencing very low food security at 12 months</strong>. A separate health-utility transfer produces a very-low-confidence central estimate of <strong>about {compactMoney.format(bridge.modeledBridge.bestCostPerTenQalysUsd)} per 10 QALYs</strong>.</>,
    whyItMayWork: 'Reliable client-choice food access can relax a household budget constraint, improve diet fit, and pair food with peer navigation and benefit support.',
    whyWeAreCautious: 'The causal anchor is a different bundled pantry intervention, current Community Market outcomes are unpublished, and network accounting does not identify a marginal market course cost.',
    recommendationBlocker: 'SFMFB has not published a costed site-by-site expansion gap, household enrollment and retention, pre-specified food-security follow-up, or evidence that the next private gift creates additional service rather than replacing cash, commodities, or donated food.',
  },
  summary: [
    { label: 'EXPLORATORY IMPACT PRICE', value: '≈ $6,000', detail: 'per additional household not experiencing very low food security at 12 months' },
    { label: 'POSITIVE-EFFECT SENSITIVITY', value: '$1.3K–$60K', detail: 'conditional on a positive effect; the null case has no finite impact price' },
    { label: 'COST PER BETTER LIFE', value: '≈ $85.7M', detail: 'per 10 QALYs; very-low-confidence food-security health-utility transfer' },
    { label: 'FUNDING ROOM', value: 'Not published', detail: 'the $100,000 gift is a scenario, not a current marginal offer' },
  ],
  programSection: {
    body: 'The modeled pathway is one household receiving 26 weeks of access to a staff-led Community Market. SFMFB opened two markets in June 2025 and says it aims to operate eight markets serving up to 4,500 households weekly within three years. The markets use a grocery-style, client-choice model and connect participants with peer navigators and support services.',
    steps: [
      { title: 'Enroll a household', detail: 'A household enters one defined Community Market cohort; a recommendation-grade plan would publish eligibility, waitlist, baseline food security, and nonparticipation.' },
      { title: 'Provide client-choice food', detail: 'Participants choose food in a grocery-style setting rather than receiving a fixed parcel.' },
      { title: 'Connect support', detail: 'Peer navigators and partner services can help households access benefits and other resources.' },
      { title: 'Measure the outcome', detail: 'Follow every eligible household for 12 months with the USDA 18-item food-security module and report retention, missingness, and a credible comparison.' },
    ],
    boundary: 'The model covers one 26-week Community Market household course. It excludes neighborhood pantry visits, home delivery, CalFresh outreach, food-bank-wide meals-equivalent, and organization-wide reach. Households—not individuals—are the outcome unit.',
  },
  model: {
    headline: 'Roughly $6,000 per additional household not experiencing very low food security—if the transferred effect is real.',
    body: 'We isolate approximately $25.8 million of FY2025 Neighborhood Pantries cash and recognized operating expense after removing recognized donated food and donated services, divide by 44,000 weekly households and 52 weeks, and model a 26-week course at $300. We then assign a 5-point absolute reduction in very low food security—far below the bundled Freshplace trial result—to reflect program and population transfer. This is a donor-cash model, not a total social-resource cost; the comparable full recognized accounting cost is about $1,160 per course.',
    equation: { label: 'CONDITIONAL COST PER ADDITIONAL HOUSEHOLD NOT EXPERIENCING VERY LOW FOOD SECURITY', expression: `${money.format(cost.best)} ÷ ${percent.format(effect.best)}`, result: `= ${money.format(model.bottomLine.costPerAdditionalHouseholdNotExperiencingVeryLowFoodSecurityUsd)}` },
    inputs: model.inputs.slice(1).map((input) => ({ key: input.key, label: input.label, confidence: input.confidence, best: formatInput(input.best, input.unit), range: `${formatInput(input.low, input.unit)}–${formatInput(input.high, input.unit)}`, basis: input.basis })),
    giftHeading: `What would ${money.format(model.bottomLine.giftUsd)} buy in the conditional model?`,
    sensitivity: model.sensitivity.map((row) => ({ case: row.case, headline: `${number.format(row.additionalHouseholdsPer100k)} additional households`, detail: `${number.format(row.householdCoursesPer100k)} modeled 26-week courses · ${compactMoney.format(row.costPerAdditionalHouseholdUsd)} per outcome` })),
    uncertaintyBoundary: model.nullEffectBoundary,
    fundingBoundary: model.fundingRoom.boundary,
  },
  comparisonBridge: {
    headline: 'Our current best estimate: about $85.7 million per better life (10 QALYs).',
    body: bridge.decision,
    equation: {
      label: 'EXPLORATORY COST PER 10 QALYS · ONE BETTER LIFE',
      expression: `${money.format(bridge.modeledBridge.modeledDonorCostPerHouseholdCourseUsd.best)} ÷ ${bridge.modeledBridge.qalyPerHouseholdCourse.best} QALY × 10`,
      result: `= ${compactMoney.format(bridge.modeledBridge.bestCostPerTenQalysUsd)}`,
    },
    inputs: [
      { key: 'donor_cost', label: 'Modeled donor-cash cost per household course', confidence: 'very low as a marginal price', best: money.format(bridge.modeledBridge.modeledDonorCostPerHouseholdCourseUsd.best), range: `${money.format(bridge.modeledBridge.modeledDonorCostPerHouseholdCourseUsd.low)}–${money.format(bridge.modeledBridge.modeledDonorCostPerHouseholdCourseUsd.high)}`, basis: bridge.modeledBridge.modeledDonorCostPerHouseholdCourseUsd.basis },
      { key: 'causal_exit', label: 'Causal exit from very low food security', confidence: 'very low', best: percent.format(bridge.modeledBridge.causalExitFromVeryLowFoodSecurityProbability.best), range: `${percent.format(bridge.modeledBridge.causalExitFromVeryLowFoodSecurityProbability.low)}–${percent.format(bridge.modeledBridge.causalExitFromVeryLowFoodSecurityProbability.high)}`, basis: bridge.modeledBridge.causalExitFromVeryLowFoodSecurityProbability.basis },
      { key: 'full_food_security', label: 'Share of exits reaching full food security', confidence: 'judgmental', best: percent.format(bridge.modeledBridge.shareOfExitsReachingFullHouseholdFoodSecurity.best), range: `${percent.format(bridge.modeledBridge.shareOfExitsReachingFullHouseholdFoodSecurity.low)}–${percent.format(bridge.modeledBridge.shareOfExitsReachingFullHouseholdFoodSecurity.high)}`, basis: bridge.modeledBridge.shareOfExitsReachingFullHouseholdFoodSecurity.basis },
      { key: 'adult_equivalents', label: 'Adult-equivalent beneficiaries per household', confidence: 'judgmental', best: String(bridge.modeledBridge.adultEquivalentBeneficiariesPerHousehold.best), range: `${bridge.modeledBridge.adultEquivalentBeneficiariesPerHousehold.low}–${bridge.modeledBridge.adultEquivalentBeneficiariesPerHousehold.high}`, basis: bridge.modeledBridge.adultEquivalentBeneficiariesPerHousehold.basis },
      { key: 'utility_effect', label: 'Observed QALY per adult-year eliminating food insecurity', confidence: 'very low as a causal transfer', best: String(bridge.sourceEvidence.qalyPerAdultYear.best), range: 'Published 95% CI: 0.002–0.014', basis: bridge.sourceEvidence.boundary },
      { key: 'retention', label: 'Share of observational utility effect retained', confidence: 'judgmental transfer', best: percent.format(bridge.modeledBridge.retainedShareOfObservedUtilityEffect.best), range: `${percent.format(bridge.modeledBridge.retainedShareOfObservedUtilityEffect.low)}–${percent.format(bridge.modeledBridge.retainedShareOfObservedUtilityEffect.high)}`, basis: bridge.modeledBridge.retainedShareOfObservedUtilityEffect.basis },
      { key: 'duration', label: 'Effective utility duration', confidence: 'judgmental', best: `${bridge.modeledBridge.effectiveDurationYears.best} year`, range: `${bridge.modeledBridge.effectiveDurationYears.low}–${bridge.modeledBridge.effectiveDurationYears.high} year`, basis: bridge.modeledBridge.effectiveDurationYears.basis },
    ],
    sensitivity: bridge.modeledBridge.sensitivity.map((row) => ({ case: row.case, headline: compactMoney.format(row.costPerTenQalysUsd), detail: `${money.format(row.donorCostPerHouseholdCourseUsd)} per household course · ${row.qalyPerHouseholdCourse} QALY each` })),
    boundary: bridge.modeledBridge.nullBoundary,
  },
  evidence: review.evidence,
  reservations: review.reservations,
  excludedBenefits: [...new Set([...model.excludedBenefits.filter((benefit) => !/QALY|life-substantially-bettered/i.test(benefit)), ...bridge.excludedBenefits])],
  sources: [...review.sources, ...bridge.sources.filter((source) => !review.sources.some((existing) => existing.url === source.url))],
};

export default function SfMarinFoodBankResearchPage() { return <CharityResearchReport content={content} />; }
