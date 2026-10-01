import type { Metadata } from 'next';
import CharityResearchReport, { type CharityReportContent } from '@/components/CharityResearchReport';
import review from '@/data/san-francisco/compass-family-services-review-v1.json';
import model from '@/data/san-francisco/compass-c-rent-cea-v1.json';
import bridge from '@/data/san-francisco/compass-c-rent-qaly-bridge-audit-v1.json';
import {calculate,diagnostics,modelVersion as currentVersion} from '@/lib/compass-calibrated-model.mjs';
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
const scenarioLabels:Record<string,string>={central:'Central: full overlap',halfOverlap:'Half overlap',noOverlap:'No overlap',cashOnly:'Cash only; no transported housing benefit',cautious:'Cautious joint stress',favorable:'Favorable joint stress',noFunding:'Funding replacement',replacementHarm:'Replacement with recipient burden',loadedCost:'Shared-support cost allocation',halfFunding:'Half of awards additional'};
const scenarioRows=['central','halfOverlap','noOverlap','cashOnly','loadedCost','halfFunding','cautious','favorable','noFunding','replacementHarm'].map(id=>({case:scenarioLabels[id],headline:cases[id].costPerBetterLifeUSD===null?'No finite positive price':bridgeMoney.format(cases[id].costPerBetterLifeUSD),detail:`${number.format(cases[id].combinedYears/cases[id].cases)} combined years per historical-equivalent case; ${number.format(cases[id].incomeEquivalentYears/cases[id].cases)} income-equivalent and ${number.format(cases[id].noncashProxyYears/cases[id].cases)} residual noncash proxy. ${cases[id].status==='harm'?'Net harm in this diagnostic.':''}`}));
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
    body: <>Compass reports <strong>207 prevention-classified families</strong> in FY2025. Audited C-Rent expense gives a historical ratio of <strong>about {money.format(cost.best)} per reported family</strong>. Our current conditional estimate is <strong>{bridgeMoney.format(current.costPerBetterLifeUSD)} per better life</strong>: 0.040359 income-equivalent years plus 0.031641 residual noncash welfare/health-proxy years per case, with overlapping housing wellbeing counted once. Neither component is a measured Compass clinical or income effect, and additional donor capacity remains unverified.</>,
    whyItMayWork: 'A temporary rent or move-in cash gap can trigger eviction and shelter entry even when a family could otherwise sustain housing. C-Rent pairs direct assistance with case management and problem-solving.',
    whyWeAreCautious: 'The 207-family count is an administrative classification without a comparison or published follow-up, and the closest randomized study found stronger effects for households without children.',
    recommendationBlocker: 'Compass has not published C-Rent’s applicant funnel, unique-household reconciliation, HMIS-linked outcomes, source-specific assistance ledger, or a dated marginal plan showing that a new private gift adds rather than displaces aid.',
  },
  summary: [
    { label: 'REPORTED COST BENCHMARK', value: '≈ $9,700', detail: 'FY2025 audited C-Rent expense per reported prevention-classified family; not a causal impact price' },
    { label: 'OUR CONDITIONAL BEST GUESS', value: '≈ $485K', detail: 'per additional family avoiding recorded homelessness within six months' },
    { label: 'COST PER BETTER LIFE', value: '≈ $1.35M', detail: 'per 10 combined income-equivalent/noncash-proxy years; not measured clinical QALYs' },
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
  model: {
    headline: `Our current estimate: ${bridgeMoney.format(current.costPerBetterLifeUSD)} per better life.`,
    body: 'C-Rent pays back rent or move-in expenses and supports families through the crisis. Audited FY2025 program spending divided by 207 reported prevention-classified families gives about $9,704 per historical-equivalent case: $5,295 in housing assistance and $4,409 in other program costs. We explicitly value tenant resources and allocate overlapping housing wellbeing only once. The resulting estimate is conditional on an additional SF award, not an unrestricted donation across all Compass services. Separately recorded shared support is excluded from the central program numerator and included in a cost-loading sensitivity.',
    comparisonUnit: 'income-equivalent and noncash-welfare-equivalent years; the residual noncash component is a health proxy, not measured clinical QALYs',
    equation: { label: 'CONDITIONAL COST PER BETTER LIFE', expression: `${money.format(current.inputs.costPerCaseUSD)} ÷ 0.072 combined welfare years × 10`, result: `= ${bridgeMoney.format(current.costPerBetterLifeUSD)}` },
    inputColumnLabel: 'Historical value / best guess',
    inputs: model.inputs.slice(1).map((input) => ({ key: input.key, label: input.label, confidence: input.confidence, best: formatInput(input.best, input.unit), range: input.low === input.high ? 'Fixed historical value' : `${formatInput(input.low, input.unit)}–${formatInput(input.high, input.unit)}`, basis: input.basis })),
    giftHeading: 'Alternative assumptions',
    sensitivity: scenarioRows.slice(0,6),
    uncertaintyBoundary: 'These are judgment scenarios, not confidence limits. The family count is not reconciled to unique C-Rent awards; household resources, net tenant capture, benefit overlap and marginal costs are not measured locally. No additional award or benefit gives no finite positive price; recipient burdens can produce net harm.',
    fundingBoundary: 'Compass has an active public prevention contract and existing restricted resources. C-Rent restricted net assets of $1,185,965 at June 30, 2025 are not current cash on hand, an uncommitted balance or proof of an incremental donor tranche. No current unfunded queue or source-specific displacement rule establishes that a new private gift buys additional cases. The model assumes an additional eligible SF award; full funding replacement and failed-completion cases remain explicit.',
    incomeLedger:{paragraphs:[
      'The Coefficient Giving comparison values a healthy year at $CG100,000 and uses a $50,000 reference income with logarithmic resource utility. Our central household baseline of $50,000 is a reference judgment, not a measured Compass income distribution. We credit 80% of the $5,295 assistance ratio as net tenant housing consumption, debt relief or freed resources; the 20% offset is an incidence judgment, not observed landlord recovery or benefit withdrawal.',
      'The transfer is valued once, at an assumed quarter-year receipt with 3% discount: 0.5 × ln(1 + 0.8 × $5,294.61 / $50,000) / 1.03^0.25 = 0.040359 income-equivalent years per case. We do not repeat it as annual wages, add the landlord payment again, count avoided debt twice, or multiply actual assistance by the probability of homelessness prevented. Net earnings remain unquantified, with a provisional zero central increment.',
      'The prior 0.072 figure transfers half of a VA housing model’s two-year 0.144 increment. Its utility values broad housing states, so economic wellbeing may overlap with the cash value. The central full-overlap allocation counts income first and retains 0.031641 residual noncash welfare/health-proxy years: total 0.072. This is an allocation judgment, not empirically separated health. If cash welfare exceeds the transported envelope, the cash surplus is retained. Half/no-overlap and cash-only cases show the consequence of rejecting that assumption.',
      'The VA outcome already discounts its second year. We do not discount it again or multiply it by the separate two-point native homelessness-effect judgment. Funding, completion, SF residence and portfolio assignment are separate: the same award and outcome must be credited once across Compass, Hamilton, GLIDE or public rental assistance. Recipient work/process losses enter as signed income burdens with explicit exposure even if no additional award occurs; they are not added to donor costs or discounted away as overlap.',
    ],scenarios:scenarioRows.slice(6)},
  },
  comparisonBridge: {
    headline: 'Historical housing-utility bridge',
    body: 'The original model divided the same program cost by a transported 0.072-QALY-labelled housing estimate. We preserve that calculation for comparison, but the current ledger explicitly separates cash resources from the residual broad housing-welfare proxy. A separate native judgment of a two-point six-month homelessness reduction gives about $485,000 per additional episode; it is not multiplied into either participant-level welfare estimate.',
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
  fundingAppendix:<><h3>Spending and financial records</h3><p>Original FY2025, FY2024 and FY2023 audits show consolidated expenses of $45,173,238, $30,660,547 and $23,137,645; their three-year mean is $32,990,477. Legal-entity Form 990 expenses are $44,554,916, $30,381,751 and $22,492,934. These accounting boundaries differ and are not blended. FY2023 tax-return totals were verified in the FY2024 return’s comparative column; the separate FY2023 original was scanned. FY2025’s return has a tax-year 2024 label but covers July 2024–June 2025.</p><p>C-Rent program expenses were $2,008,658 in FY2025, $1,258,441 in FY2024 and $1,258,722 in FY2023. FY2025 shared management/general/fundraising expense was $6,951,080 against $38,222,158 in program expenses; a proportional allocation raises the per-case cost to $11,468 and the central price to about $1.59M. This is an allocation sensitivity, not a verified marginal price. Current reporting and the live SF application route support ongoing operations, but do not establish new donor capacity.</p></>,
  sources: [
    ...review.sources.filter((source) => model.sources.some((modelSource) => modelSource.url === source.url)),
    ...bridge.sources.filter((source) => !review.sources.some((existing) => existing.url === source.url)),
    ...receipts.sources.filter(source=>['audit-FY2024','audit-FY2023','990-FY2025','990-FY2024','990-FY2023-original','current-eligibility-status','primary-local-RCT','CG-crosswalk'].includes(source.id)).map(source=>({publisher:source.id==='CG-crosswalk'?'Coefficient Giving':source.id==='primary-local-RCT'?'Phillips and Sullivan':'Compass Family Services',title:source.id.replaceAll('-',' '),url:source.url,published:'Fiscal year or publication date described in this report',retrieved:'2026-10-01',sourceType:source.id.includes('audit')?'original audited financial statements':source.id.includes('990')?'original Form 990':source.id==='primary-local-RCT'?'author working paper':source.id==='CG-crosswalk'?'published welfare-comparison framework':'current program eligibility'})),
  ],
};

export default function CompassFamilyServicesResearchPage() {
  return <CharityResearchReport content={content} />;
}
