import type { Metadata } from 'next';
import CharityResearchReport, { type CharityReportContent } from '@/components/CharityResearchReport';
import review from '@/data/san-francisco/five-keys-review-v1.json';
import model from '@/data/san-francisco/five-keys-credential-cea-v1.json';

export const metadata: Metadata = {
  title: 'Five Keys secondary credentials — charity research | Market for Impact',
  description: 'Our evidence review and exploratory cost-per-additional-credential model for Five Keys Independence High School.',
  openGraph: { title: 'Five Keys secondary credentials — charity research', description: 'A source-grounded model separating audited school costs, credential outputs, modeled causal scenarios, and funding room.', images: [] },
  twitter: { card: 'summary', title: 'Five Keys secondary credentials — charity research', description: 'An inspectable credential model with a plausible null and no invented life-bettered conversion.', images: [] },
};

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const compactMoney = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 2 });
const number = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });
const percent = new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 1 });
const cost = model.inputs.find((input) => input.key === 'historical_gross_cost_per_ada_year_usd')!;
const effect = model.inputs.find((input) => input.key === 'mfi_modeled_additional_credential_probability_per_ada_year')!;
const formatInput = (value: number, unit: string) => {
  if (unit === 'USD') return money.format(value);
  if (unit === 'proportion') return percent.format(value);
  return `${number.format(value)} ${unit}`;
};

const content: CharityReportContent = {
  organization: 'Five Keys Schools and Programs',
  eyebrow: 'CHARITY RESEARCH · SAN FRANCISCO',
  program: 'Accredited secondary-credential pathway at Five Keys Independence High School',
  donationUrl: review.organization.donationUrl,
  published: '31 August 2026',
  modelVersion: model.version,
  nutshell: {
    headline: 'A strong mission and auditable school cost. The causal credential gain is still a judgment call.',
    body: <>Five Keys Independence High School reported <strong>{money.format(model.inputs.find((input) => input.key === 'fy2024_fkih_total_expense_usd')!.best)} of FY2024 expense</strong> and <strong>{number.format(model.inputs.find((input) => input.key === 'fy2024_fkih_annual_ada')!.best)} annual ADA</strong>, or about <strong>{money.format(cost.best)} per ADA-equivalent year</strong>. If a year increases credential completion by our 10-point midpoint, the conditional estimate is <strong>about {compactMoney.format(model.bottomLine.costPerAdditionalCredentialUsd)} per additional secondary credential</strong>. Five Keys has not measured that effect, so zero remains plausible.</>,
    whyItMayWork: 'Accredited, flexible instruction is brought into jails and community settings, with transcript review, individualized graduation maps, GED/HiSET preparation, counseling, and reentry-linked support for learners whom traditional schools did not retain.',
    whyWeAreCautious: 'ADA is not unique enrollment or dosage; reported GED completions lack an eligible denominator; graduation cohorts are nonstandard; and the public record provides no comparable nonparticipant group or clean San Francisco-only instructional cost.',
    recommendationBlocker: 'There is no gift-restricted marginal expansion plan, causal credential effect, unique learner flow, public-funding displacement rule, or verified long-run education, employment, and custody follow-up.',
  },
  summary: [
    { label: 'GROSS HISTORICAL BENCHMARK', value: '≈ $16,700', detail: 'FY2024 total FKIH expense per ADA-equivalent year; not a marginal price' },
    { label: 'OUR CONDITIONAL BEST GUESS', value: '≈ $167,000', detail: 'per additional credential if one ADA-equivalent year raises completion by 10 points' },
    { label: '$ PER BETTER LIFE', value: 'Not yet convertible', detail: 'denominator: 10 QALYs; no defensible credential-to-QALY bridge yet' },
    { label: 'FUNDING ROOM', value: 'Not published', detail: 'the $100,000 gift is a scenario, not a verified added-seat plan' },
  ],
  programSection: {
    body: 'Five Keys operates accredited public charter schools in custody and community settings. This report isolates the secondary-credential pathway at Five Keys Independence High School: re-engaging a learner without a diploma, assessing prior credits and needs, delivering flexible instruction and support, and helping the learner earn a diploma or equivalency. It does not evaluate Five Keys housing, shelters, workforce programs, or the broader organization as one intervention.',
    steps: [
      { title: 'Re-engage an eligible learner', detail: 'A learner age 15 or older without a diploma enrolls voluntarily in a jail, community setting, or supported online pathway.' },
      { title: 'Map the credential path', detail: 'Staff review transcripts and skills, identify remaining credits or equivalency requirements, and create an individualized plan.' },
      { title: 'Deliver flexible instruction', detail: 'Credentialed teachers provide classroom, independent-study, synchronous, GED/HiSET, literacy, and related support around custody and life constraints.' },
      { title: 'Verify completion and follow-up', detail: 'A recommendation-grade cohort would reconcile every entrant, dosage, withdrawal, transfer, diploma or equivalency, and education, employment, and custody status through at least 36 months.' },
    ],
    boundary: 'The model covers an ADA-equivalent year in FKIH and an additional accredited secondary credential. It excludes other Five Keys schools and services, credits without completion, selected-graduate recidivism comparisons, employment and earnings, avoided custody, and any QALY or life-bettered conversion.',
  },
  model: {
    headline: 'Our current model: about $167,000 per additional credential—conditional on a 10-point effect we cannot yet verify.',
    body: 'The cost anchor divides audited FY2024 FKIH total expense by audited annual ADA. It is a schoolwide historical intensity, not a marginal cohort budget. The 5%, 10%, and 20% credential-effect cases represent one additional credential per twenty, ten, or five ADA-equivalent years. They are decision scenarios, not confidence bounds. We do not use the reported 56 GED completions or Five Keys recidivism claims as causal effects.',
    equation: { label: 'CONDITIONAL COST PER ADDITIONAL SECONDARY CREDENTIAL', expression: `${money.format(cost.best)} ÷ ${percent.format(effect.best)}`, result: `= ${money.format(model.bottomLine.costPerAdditionalCredentialUsd)}` },
    inputColumnLabel: 'Published value / best guess',
    inputs: model.inputs.slice(1).map((input) => ({ key: input.key, label: input.label, confidence: input.confidence, best: formatInput(input.best, input.unit), range: input.low === input.high ? 'Fixed published value' : `${formatInput(input.low, input.unit)}–${formatInput(input.high, input.unit)}`, basis: input.basis })),
    giftHeading: `What would ${money.format(model.bottomLine.giftUsd)} imply at the historical cost ratio?`,
    sensitivity: model.sensitivity.map((row) => ({ case: row.case, headline: `${number.format(row.additionalCredentialsPer100k)} additional credentials`, detail: `${number.format(row.historicalEquivalentAdaYearsPer100k)} historical ADA-equivalent years · ${compactMoney.format(row.costPerAdditionalCredentialUsd)} per credential` })),
    uncertaintyBoundary: model.nullEffectBoundary,
    fundingBoundary: model.fundingRoom.boundary,
  },
  evidence: review.evidence,
  reservations: review.reservations,
  excludedBenefits: model.excludedBenefits,
  sources: review.sources,
};

export default function FiveKeysResearchPage() {
  return <CharityResearchReport content={content} />;
}
