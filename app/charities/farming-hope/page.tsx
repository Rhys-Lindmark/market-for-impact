import type { Metadata } from 'next';
import CharityResearchReport, { type CharityReportContent } from '@/components/CharityResearchReport';
import review from '@/data/san-francisco/farming-hope-review-v1.json';
import model from '@/data/san-francisco/farming-hope-apprenticeship-cea-v1.json';

export const metadata: Metadata = {
  title: 'Farming Hope culinary apprenticeship — charity research | Market for Impact',
  description: 'Our evidence review and exploratory employment model for Farming Hope’s paid culinary apprenticeship.',
  openGraph: { title: 'Farming Hope culinary apprenticeship — charity research', description: 'A source-grounded employment review separating reported placements, transferred causal evidence, historical cost, and funding room.', images: [] },
  twitter: { card: 'summary', title: 'Farming Hope culinary apprenticeship — charity research', description: 'An inspectable employment model with a plausible null and no invented life-bettered conversion.', images: [] },
};

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const compactMoney = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 2 });
const number = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });
const percent = new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 1 });
const cost = model.inputs.find((input) => input.key === 'historical_gross_cost_per_reported_apprentice_usd')!;
const effect = model.inputs.find((input) => input.key === 'mfi_transferred_late_year_any_employment_effect')!;
const formatInput = (value: number, unit: string) => {
  if (unit === 'USD') return money.format(value);
  if (unit === 'proportion') return percent.format(value);
  return `${number.format(value)} ${unit}`;
};

const content: CharityReportContent = {
  organization: 'Farming Hope',
  eyebrow: 'CHARITY RESEARCH · SAN FRANCISCO',
  program: '12-week, part-time, paid culinary apprenticeship for adults facing major barriers to employment',
  donationUrl: review.organization.donationUrl,
  published: '31 August 2026',
  modelVersion: model.version,
  nutshell: {
    headline: 'A promising reported placement rate. A costly historical pathway. A very uncertain causal transfer.',
    body: <>Farming Hope reported <strong>41 apprentices trained</strong>, an <strong>85% graduation rate</strong>, and <strong>71% employment within 90 days of graduation</strong> in 2024. Its Form 990 assigns {money.format(model.inputs.find((input) => input.key === 'fy2024_job_training_expense_usd')!.best)} to job training, or <strong>{money.format(cost.best)} of gross historical expense per reported apprentice</strong>. Transferring a 4-point pooled randomized employment effect gives a conditional estimate of <strong>about {compactMoney.format(model.bottomLine.costPerAdditionalPersonEverEmployedInLateFollowUpYearUsd)} per additional person with any covered employment in the late follow-up year</strong>. A null remains plausible.</>,
    whyItMayWork: 'Paid work experience, culinary instruction, professional and life-skills training, case-manager involvement, and employer relationships may reduce experience, confidence, network, and screening barriers to unsubsidized work.',
    whyWeAreCautious: 'Farming Hope does not publish the placement numerator, missing follow-up, job definition, retention, prior employment, comparison rate, or participant-level cost; randomized transitional-jobs effects vary sharply by program.',
    recommendationBlocker: 'There is no current apprenticeship-only marginal budget, verified 3- to 24-month employment and earnings cohort, credible Farming Hope counterfactual, or public/restricted/earned-funding displacement rule.',
  },
  summary: [
    { label: 'GROSS HISTORICAL BENCHMARK', value: '≈ $41,600', detail: 'FY2024 job-training expense per reported apprentice; not a marginal price' },
    { label: 'OUR CONDITIONAL BEST GUESS', value: '≈ $1.04M', detail: 'per additional person ever employed in a late follow-up year, using a transferred 4-point effect' },
    { label: '$ PER LIFE BETTERED', value: 'Not estimated', detail: 'employment duration, earnings, wellbeing, and QALY conversion are not measured' },
    { label: 'FUNDING ROOM', value: 'Not published', detail: 'the $100,000 gift is a scenario, not a verified cohort expansion' },
  ],
  programSection: {
    body: 'Farming Hope currently offers a 12-week, part-time, paid apprenticeship. Apprentices receive kitchen and hospitality training, professional and life-skills instruction, and work experience producing food for community programs. This report isolates the transition from the apprenticeship into later covered employment; it does not treat the food produced as an apprentice employment outcome.',
    steps: [
      { title: 'Apply with support', detail: 'Candidates facing barriers such as former incarceration, homelessness, or recovery apply with case-manager support and complete an open-house and interview process.' },
      { title: 'Complete paid training', detail: 'Apprentices work part time for 12 weeks while learning kitchen, hospitality, professional, and life skills in a production setting.' },
      { title: 'Move toward unsubsidized work', detail: 'Staff and employment partners support graduation, job search, placement, and the transition from temporary paid training into regular employment.' },
      { title: 'Measure employment after exit', detail: 'A recommendation-grade cohort would verify job start, hours, wage, benefits, employer, and employment in each quarter through at least 24 months for every entrant.' },
    ],
    boundary: 'The model covers the culinary apprenticeship and any covered employment during a late follow-up year. It excludes meals, groceries, food recovery, community dinners, apprentice wages as a benefit, and any unmeasured earnings, retention, housing, recovery, recidivism, or wellbeing effects.',
  },
  model: {
    headline: 'Our current model: about $1.04 million per additional person ever employed in a late follow-up year—conditional on a very uncertain transfer.',
    body: 'The historical cost anchor divides Farming Hope’s filed 2024 job-training expense by 41 reported apprentices. It is a gross cross-source ratio, not an incremental cohort budget. The causal midpoint uses the seven-site Enhanced Transitional Jobs Demonstration’s 4.0-point increase in any administrative-record employment during the final follow-up year. We deliberately do not use Farming Hope’s 71% placement rate as an effect. The 1%, 4%, and 8% cases are decision scenarios, not statistical confidence bounds.',
    equation: { label: 'CONDITIONAL COST PER ADDITIONAL PERSON EVER EMPLOYED IN THE LATE FOLLOW-UP YEAR', expression: `${money.format(cost.best)} ÷ ${percent.format(effect.best)}`, result: `= ${money.format(model.bottomLine.costPerAdditionalPersonEverEmployedInLateFollowUpYearUsd)}` },
    inputColumnLabel: 'Published value / best guess',
    inputs: model.inputs.slice(1).map((input) => ({ key: input.key, label: input.label, confidence: input.confidence, best: formatInput(input.best, input.unit), range: input.low === input.high ? 'Fixed published value' : `${formatInput(input.low, input.unit)}–${formatInput(input.high, input.unit)}`, basis: input.basis })),
    giftHeading: `What would ${money.format(model.bottomLine.giftUsd)} imply at the historical cost ratio?`,
    sensitivity: model.sensitivity.map((row) => ({ case: row.case, headline: `${number.format(row.additionalPeopleEverEmployedInLateFollowUpYearPer100k)} additional people`, detail: `${number.format(row.historicalEquivalentApprenticesPer100k)} historical-equivalent apprentices · ${compactMoney.format(row.costPerAdditionalPersonEverEmployedInLateFollowUpYearUsd)} per outcome` })),
    uncertaintyBoundary: model.nullEffectBoundary,
    fundingBoundary: model.fundingRoom.boundary,
  },
  evidence: review.evidence,
  reservations: review.reservations,
  excludedBenefits: model.excludedBenefits,
  sources: review.sources,
};

export default function FarmingHopeResearchPage() {
  return <CharityResearchReport content={content} />;
}
