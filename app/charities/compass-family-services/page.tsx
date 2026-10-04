import type { Metadata } from 'next';
import CharityResearchReport, { type CharityReportContent } from '@/components/CharityResearchReport';
import review from '@/data/san-francisco/compass-family-services-review-v1.json';
import model from '@/data/san-francisco/compass-c-rent-cea-v1.json';
import bridge from '@/data/san-francisco/compass-c-rent-qaly-bridge-audit-v1.json';
import {calculate,diagnostics,modelVersion as currentVersion} from '@/lib/compass-calibrated-model.mjs';
import {preventionModelContent} from '@/lib/prevention-report-content.mjs';
import receipts from '@/docs/geography-discovery/compass-calibration-receipts-2026-10-01.json';

export const metadata: Metadata = {
  title: 'Compass C-Rent homelessness prevention — charity research | Market for Impact',
  description: 'Our evidence review and exploratory historical cost-effectiveness model for Compass Family Services C-Rent.',
  openGraph: { title: 'Compass Family Services — charity research', description: 'A source-grounded review and inspectable family-homelessness-prevention model.', images: [] },
  twitter: { card: 'summary', title: 'Compass Family Services — charity research', description: 'A source-grounded review and inspectable family-homelessness-prevention model.', images: [] },
};

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const compactMoney = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 });
const bridgeMoney = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 2 });
const number = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });
const percent = new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 1 });
const current=calculate(),cases=diagnostics();
const cost = model.inputs.find((input) => input.key === 'gross_accounting_cost_per_reported_family_usd')!;
const effect = model.inputs.find((input) => input.key === 'causal_six_month_homelessness_reduction')!;
const evidenceKeys = new Set(['compass-c-rent-reporting', 'compass-c-rent-audit', 'santa-clara-prevention-rct', 'compass-prevention-public-contract']);
const formatInput = (value: number, unit: string) => {
  if (unit === 'USD') return money.format(value);
  if (unit === 'proportion') return percent.format(value);
  return `${number.format(value)} ${unit}`;
};

const content: CharityReportContent = {
  organization: 'Compass Family Services',
  eyebrow: 'CHARITY RESEARCH · SAN FRANCISCO',
  program: 'C-Rent back-rent and move-in assistance, case management, and problem-solving for families at risk of homelessness',
  donationUrl: review.organization.donationUrl,
  published: '1 September 2026',
  modelVersion: currentVersion,
  calibrationDate: '1 October 2026',
  nutshell: {
    headline: 'Rental assistance and practical support for families facing a housing crisis.',
    body: <>Compass reports <strong>207 prevention-classified families</strong> in FY2025. Audited C-Rent expense gives a historical ratio of <strong>about {money.format(cost.best)} per reported family</strong>. Our current conditional estimate is <strong>{bridgeMoney.format(current.costPerBetterLifeUSD!)} per better life</strong>: 0.040359 income-equivalent years plus 0.000124 independently modeled noncash health-proxy years per case. Neither component is a measured Compass clinical or income effect, and additional donor capacity remains unverified.</>,
    whyItMayWork: 'A temporary rent or move-in cash gap can trigger eviction and shelter entry even when a family could otherwise sustain housing. C-Rent pairs direct assistance with case management and problem-solving.',
    whyWeAreCautious: 'The 207-family count is an administrative classification without a comparison or published follow-up, and the closest randomized study found stronger effects for households without children.',
    recommendationBlocker: 'Compass has not published C-Rent’s applicant funnel, unique-household reconciliation, HMIS-linked outcomes, source-specific assistance ledger, or a dated marginal plan showing that a new private gift adds rather than displaces aid.',
  },
  summary: [
    { label: 'REPORTED COST BENCHMARK', value: '≈ $9,700', detail: 'FY2025 audited C-Rent expense per reported prevention-classified family; not a causal impact price' },
    { label: 'OUR CONDITIONAL BEST GUESS', value: '≈ $485K', detail: 'per additional family avoiding recorded homelessness within six months' },
    { label: 'COST PER BETTER LIFE', value: compactMoney.format(current.costPerBetterLifeUSD!), detail: 'per 10 combined income-equivalent/noncash-proxy years; not measured clinical QALYs' },
    { label: 'FUNDING ROOM', value: 'Not published', detail: 'additional eligible awards are conditional, not a current marginal offer' },
  ],
  programSection: {
    body: 'Compass Family Services helps families facing a housing crisis. Its C-Rent program provides back-rent or move-in financial assistance, case management, and problem-solving to help families remain housed.',
    steps: [
      { title: 'Identify imminent risk', detail: 'A San Francisco family with at least one minor child seeks help while facing arrears, eviction, or a move-in barrier.' },
      { title: 'Assess the cash gap', detail: 'Staff review eligibility, household circumstances, available aid, and whether a bounded payment can resolve the crisis.' },
      { title: 'Pay and support', detail: 'C-Rent may pay back rent or move-in costs and pair the transfer with case management and problem-solving.' },
      { title: 'Verify housing stability', detail: "Stronger evidence would link all eligible applicants to the Homeless Management Information System (HMIS) and verify their housing status at 3, 6, 12, and 24 months." },
    ],
    boundary: 'This model covers C-Rent prevention only. It excludes Compass shelter, rapid rehousing, permanent subsidies, housing navigation, childcare, behavioral health, and the separate cash-after-rapid-rehousing trial. The 207 reported families are not assumed to be 207 additional outcomes.',
  },
  model: preventionModelContent('compass',current,cases),
  comparisonBridge: {
    headline: 'Historical housing-utility bridge',
    body: 'The original model divided the same program cost by a transported 0.072-QALY-labelled housing estimate. We preserve that calculation for comparison, but the current model independently calculates rent resources and a finite noncash health proxy instead of preserving that inherited total. A separate native judgment of a two-point six-month homelessness reduction gives about $485,000 per additional episode; it is not multiplied into either participant-level welfare estimate.',
    equation: {
      label: 'EXPLORATORY COST PER 10 QALYS · ONE BETTER LIFE',
      expression: `${money.format(bridge.modeledBridge.modeledDonorCostPerAssistedFamilyUsd.best)} ÷ ${bridge.modeledBridge.qalyPerAssistedFamily.best} QALY × 10`,
      result: `= ${bridgeMoney.format(bridge.modeledBridge.bestCostPerTenQalysUsd)}`,
    },
    inputs: [
      { key: 'donor_cost', label: 'Modeled donor cost per reported family', confidence: 'very low as a marginal price', best: money.format(bridge.modeledBridge.modeledDonorCostPerAssistedFamilyUsd.best), range: `${money.format(bridge.modeledBridge.modeledDonorCostPerAssistedFamilyUsd.low)}–${money.format(bridge.modeledBridge.modeledDonorCostPerAssistedFamilyUsd.high)}`, basis: bridge.modeledBridge.modeledDonorCostPerAssistedFamilyUsd.basis },
      { key: 'va_qaly', label: 'VA model QALYs per prevention recipient', confidence: 'moderate for model; indirect for Compass', best: String(bridge.sourceEvidence.incrementalQalysPerRecipient), range: 'Published point estimate', basis: 'A two-year VA simulation estimated 0.144 incremental QALYs and 90.7 additional stable-housing days per homelessness-prevention recipient receiving temporary financial assistance.' },
      { key: 'compass_qaly', label: 'QALYs per Compass reported family after transfer discount', confidence: 'very low transfer', best: String(bridge.modeledBridge.qalyPerAssistedFamily.best), range: `${bridge.modeledBridge.qalyPerAssistedFamily.low}–${bridge.modeledBridge.qalyPerAssistedFamily.high}`, basis: bridge.sourceEvidence.compassQalysPerAssistedFamily.basis },
    ],
    sensitivity: bridge.modeledBridge.sensitivity.map((row) => ({ case: row.case, headline: bridgeMoney.format(row.costPerTenQalysUsd), detail: `${money.format(row.donorCostPerFamilyUsd)} per family · ${percent.format(row.retainedShareOfVaQalyEffect)} of VA QALY estimate retained` })),
    boundary: `${bridge.modeledBridge.nullBoundary} ${bridge.sourceEvidence.boundary}`,
  },
  evidence: review.evidence.filter((item) => evidenceKeys.has(item.key)),
  reservations: review.reservations,
  excludedBenefits: ['Child, partner, caregiver and school-continuity spillovers without measured household outcomes.','Causal earnings changes, avoided public costs and landlord welfare beyond the net tenant resource allocation.','Other Compass programs, recurring rental subsidies and benefits beyond the supported outcome horizon.'],
  fundingAppendix:<><h3>Spending and financial records</h3><p>Original FY2025, FY2024 and FY2023 audits show consolidated expenses of $45,173,238, $30,660,547 and $23,137,645; their three-year mean is $32,990,477. Legal-entity Form 990 expenses are $44,554,916, $30,381,751 and $22,492,934. These accounting boundaries differ and are not blended. FY2023 tax-return totals were verified in the FY2024 return’s comparative column; the separate FY2023 original was scanned. FY2025’s return has a tax-year 2024 label but covers July 2024–June 2025.</p><p>C-Rent program expenses were $2,008,658 in FY2025, $1,258,441 in FY2024 and $1,258,722 in FY2023. FY2025 shared management/general/fundraising expense was $6,951,080 against $38,222,158 in program expenses; a proportional allocation raises the per-case cost to $11,468 and the current price to about $2.83M after independently rebuilding benefits. This support allocation is included in the current central cost, not added twice, and is not a verified marginal price. Current reporting and the live SF application route support ongoing operations, but do not establish new donor capacity.</p></>,
  sources: [
    ...review.sources.filter((source) => model.sources.some((modelSource) => modelSource.url === source.url)),
    ...bridge.sources.filter((source) => !review.sources.some((existing) => existing.url === source.url)),
    ...receipts.sources.filter(source=>['audit-FY2024','audit-FY2023','990-FY2025','990-FY2024','990-FY2023-original','current-eligibility-status','primary-local-RCT','CG-crosswalk'].includes(source.id)).map(source=>({publisher:source.id==='CG-crosswalk'?'Coefficient Giving':source.id==='primary-local-RCT'?'Phillips and Sullivan':'Compass Family Services',title:source.id.replaceAll('-',' '),url:source.url,published:'Fiscal year or publication date described in this report',retrieved:'2026-10-01',sourceType:source.id.includes('audit')?'original audited financial statements':source.id.includes('990')?'original Form 990':source.id==='primary-local-RCT'?'author working paper':source.id==='CG-crosswalk'?'published welfare-comparison framework':'current program eligibility'})),
  ],
};

export default function CompassFamilyServicesResearchPage() {
  return <CharityResearchReport content={content} />;
}
