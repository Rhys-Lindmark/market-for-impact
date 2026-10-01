import type { Metadata } from 'next';
import CharityResearchReport, { type CharityReportContent } from '@/components/CharityResearchReport';
import review from '@/data/san-francisco/hamilton-families-review-v1.json';
import model from '@/data/san-francisco/hamilton-prevention-cea-v1.json';
import bridgeAudit from '@/data/san-francisco/hamilton-prevention-qaly-bridge-audit-v1.json';
import {calculate,diagnostics,modelVersion as currentVersion} from '@/lib/hamilton-calibrated-model.mjs';
import receipts from '@/docs/geography-discovery/hamilton-calibration-receipts-2026-10-01.json';

export const metadata: Metadata = {
  title: 'Hamilton Families homelessness prevention — charity research | Market for Impact',
  description: 'Our evidence review and exploratory cost-effectiveness model for Hamilton Families homelessness prevention.',
  openGraph: { title: 'Hamilton Families — charity research', description: 'A source-grounded review and inspectable family-homelessness-prevention model.', images: [] },
  twitter: { card: 'summary', title: 'Hamilton Families — charity research', description: 'A source-grounded review and inspectable family-homelessness-prevention model.', images: [] },
};

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const compactMoney = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 });
const percent = new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 1 });
const current=calculate(),cases=diagnostics();
const scenarioLabels:Record<string,string>={central:'Central: full overlap',halfOverlap:'Half overlap',noOverlap:'No overlap',cashOnly:'Cash only',higherDose:'Larger modeled award',loadedCost:'Alternative program-only cost boundary',halfFunding:'Half of awards additional',cautious:'Cautious joint stress',favorable:'Favorable joint stress',noFunding:'Funding replacement',replacementHarm:'Replacement with recipient burden'};
const scenarioRows=Object.keys(scenarioLabels).map(id=>({case:scenarioLabels[id],headline:cases[id].costPerBetterLifeUSD===null?'No finite positive price':compactMoney.format(cases[id].costPerBetterLifeUSD),detail:`${(cases[id].combinedYears/cases[id].cases).toFixed(6)} combined years per modeled award: ${(cases[id].incomeEquivalentYears/cases[id].cases).toFixed(6)} income-equivalent and ${(cases[id].noncashProxyYears/cases[id].cases).toFixed(6)} residual noncash proxy. ${cases[id].status==='harm'?'Net harm in this diagnostic.':''}`}));
const evidenceKeys = new Set(['hamilton-reporting', 'hamilton-prevention-program', 'santa-clara-prevention-rct']);

const content: CharityReportContent = {
  organization: 'Hamilton Families',
  eyebrow: 'CHARITY RESEARCH · SAN FRANCISCO',
  program: 'Temporary financial assistance, income planning, legal referrals, and case management for families at imminent risk of homelessness',
  donationUrl: 'https://give.hamiltonfamilies.org/give/485121',
  published: '31 August 2026',
  modelVersion: currentVersion,
  calibrationDate: '1 October 2026',
  nutshell: {
    headline: 'Rent assistance and practical support to keep families housed.',
    body: <>Hamilton helps families resolve rent crises with financial assistance, income planning and referrals. Related randomized evidence supports temporary assistance as a way to prevent homelessness. Our conditional estimate is <strong>about {compactMoney.format(current.costPerBetterLifeUSD)} per better life</strong>, counting one-off tenant resources and residual housing-related welfare without crediting the same benefit twice.</>,
    whyItMayWork: 'A short cash gap can trigger eviction and shelter entry even when a family could sustain rent afterward. Hamilton can combine direct payment with income planning, legal referrals, and case management.',
    whyWeAreCautious: 'Hamilton’s “avoided homelessness” count has no comparison or common follow-up, its prevention cost is not separated from broader housing services, and the closest randomized study found smaller effects for households with children.',
    recommendationBlocker: 'Hamilton has not published prevention-only accounts, average awards, current eligible-but-unfunded families, HMIS-linked outcomes, or a dated marginal plan showing that a new private gift adds rather than displaces assistance.',
  },
  summary: [
    { label: 'OUR BEST GUESS', value: '≈ $500K', detail: 'per additional eligible family avoiding recorded homelessness within six months' },
    { label: 'POSITIVE-EFFECT SENSITIVITY', value: '$100K–$12.5M', detail: 'conditional on a positive causal effect; a null effect has no finite impact price' },
    { label: 'COST PER BETTER LIFE', value: '≈ $1.4M', detail: 'per 10 combined income and noncash-welfare-equivalent years; not measured clinical QALYs' },
    { label: 'FUNDING ROOM', value: 'Not published', detail: 'additional prevention awards are a conditional model, not a verified marginal offer' },
  ],
  programSection: {
    body: 'Hamilton helps currently housed San Francisco families facing eviction, recent hardship and household income at or below 50% of area median income. Its current application page describes past-due and future rent assistance through SF ERAP, alongside support services. The FY2025 audit describes up to three months of back rent and three months of future rent; that historical description is not a guaranteed current award.',
    steps: [
      { title: 'Identify imminent risk', detail: 'A housed family applies while facing arrears, eviction, or another resolvable housing crisis.' },
      { title: 'Assess sustainability', detail: 'Hamilton reviews eligibility, the cash gap, income plan, and other available public or private assistance.' },
      { title: 'Pay and support', detail: 'The program may pay rent and pair it with legal referrals, income planning, and case management.' },
      { title: 'Verify housing stability', detail: "Stronger evidence would link every eligible applicant to the Homeless Management Information System (HMIS) and verify their housing status at 3, 6, 12, and 24 months." },
    ],
    boundary: 'The model covers Hamilton’s prevention assistance only. It excludes emergency shelter, rapid rehousing, long-term subsidies, transitional housing, education services, and the separate cash-after-rapid-rehousing trial. The 127 reported FY2025 families remain an output, not a causal denominator.',
  },
  model: {
    headline: 'Our current estimate: about $1.4M per better life.',
    body: 'The central scenario assumes a $10,000 all-in prevention award, including $5,000 in rent payments and $5,000 for delivery and shared support. These are analyst judgments, not audited Hamilton unit costs. We credit 80% of the payment as net tenant resources once, then remove overlapping value from a broadly transferred housing-welfare estimate. The conditional total is 0.072 combined years per modeled award, not measured clinical QALYs.',
    equation: {label:'COST PER BETTER LIFE',expression:'$10,000 ÷ 0.072 combined years × 10',result:'≈ $1.4M'},
    comparisonUnit:'combined income-welfare and residual noncash-welfare-equivalent years',
    inputs:[
      {key:'all_in_cost',label:'All-in cost per modeled award',confidence:'judgment; not measured',best:'$10,000',range:'$5,000–$25,000',basis:'Prevention-only cost is not disclosed. Includes delivery and shared-support allowance; do not automatically load overhead again.'},
      {key:'transfer',label:'Rent resources per modeled award',confidence:'judgment; not measured',best:'$5,000',range:'$4,000 favorable / $8,000 cautious / $12,000 larger-dose case',basis:'An independent assumed dose, not Housing Services expense divided by 127. Transfer must not exceed this all-in donor cost.'},
      {key:'cash',label:'Income-equivalent years per award',confidence:'reference-weight and incidence judgments',best:'0.038197',range:'Dose, baseline and incidence cases below',basis:'0.5 × ln(1 + 0.8 × $5,000 / $50,000) / 1.03^0.25. One affected household; no repeated annual payment.'},
      {key:'residual',label:'Residual noncash welfare/health proxy',confidence:'very-low-confidence transfer and overlap',best:'0.033803',range:'Cash-only to no-overlap diagnostics',basis:'Half of the VA two-year 0.144 envelope, less overlapping cash value; not empirically separated clinical health.'},
    ],
    giftHeading:'Cost, dose and overlap scenarios',
    sensitivity:scenarioRows,
    uncertaintyBoundary:'These cases are judgment diagnostics, not confidence bounds. Funding replacement, failed completion without recipient exposure, zero portfolio attribution or no transfer/no housing effect produces no finite positive price. Explicit recipient process loss can produce net harm.',
    fundingBoundary:'An executed, additional SF prevention award is the central conditional scope. Public contract authority and dated restricted balances do not show that a new private gift creates one. The same household payment and outcomes must be assigned once across Hamilton, Compass, GLIDE or SF ERAP.',
    incomeLedger:{paragraphs:[
      'Coefficient Giving uses $50,000 reference income and $CG100,000 per healthy year. We apply its logarithmic crosswalk to one-off resources, not a measured Hamilton wage gain. The $50,000 household baseline, 80% tenant incidence and quarter-year receipt are judgments; benefit withdrawal, landlord capture and financing offsets belong in actual net resources if measured.',
      'The $5,000 rent payment gives 0.038197 income-equivalent years at 3% discount. Housing consumption, debt relief and freed cash are alternative descriptions of that value, not three benefits. Net earnings are unquantified, with a provisional zero central increment. The separate post-rehousing cash trial does not supply prevention earnings results.',
      'The VA envelope uses broad housing-state utility and already discounts its second year. Temporary assistance for housed at-risk adults is a plausible intervention match, but veteran risk, healthcare linkage and trajectories differ. Retaining half is a provisional transfer judgment, not new Hamilton evidence. Full overlap allocates cash first and leaves 0.033803 residual noncash welfare/health-proxy years. Cash above the envelope is retained, not capped; cash-only and partial-overlap cases challenge this assumption.',
      'Neither component is measured clinical QALYs. We do not multiply them by the separate two-point native homelessness-offer judgment or add child/landlord/public-payer multipliers. Funding, completion, geography and portfolio assignment are separate from income incidence. Signed recipient work/process losses can persist when no additional award occurs; they are not suppressed by overlap or added to donor cash costs.',
    ],scenarios:[]},
  },
  comparisonBridge: {
    headline: 'Historical housing-utility and native-outcome calculations',
    body: 'The original bridge labeled the transferred 0.072 housing-welfare envelope as QALYs. That historical calculation is preserved here; the current ledger separates one-off income resources from the residual broad welfare proxy. The separate assumed two-point six-month offer effect gives about $500,000 per additional recorded homelessness episode avoided. It has a different denominator and is not multiplied into the participant-level welfare calculation.',
    equation: {
      label: 'EXPLORATORY COST PER 10 QALYS · ONE BETTER LIFE',
      expression: `${money.format(bridgeAudit.modeledBridge.modeledDonorCostPerAssistedFamilyUsd.best)} ÷ ${bridgeAudit.modeledBridge.qalyPerAssistedFamily.best} QALY × 10`,
      result: `= ${compactMoney.format(bridgeAudit.modeledBridge.bestCostPerTenQalysUsd)}`,
    },
    inputs: [
      { key: 'donor_cost', label: 'Modeled donor cost per assisted family', confidence: 'very low', best: money.format(bridgeAudit.modeledBridge.modeledDonorCostPerAssistedFamilyUsd.best), range: `${money.format(bridgeAudit.modeledBridge.modeledDonorCostPerAssistedFamilyUsd.low)}–${money.format(bridgeAudit.modeledBridge.modeledDonorCostPerAssistedFamilyUsd.high)}`, basis: bridgeAudit.modeledBridge.modeledDonorCostPerAssistedFamilyUsd.basis },
      { key: 'va_qaly', label: 'VA model QALYs per prevention recipient', confidence: 'moderate for model; indirect for Hamilton', best: String(bridgeAudit.sourceEvidence.incrementalQalysPerRecipient), range: 'Published point estimate', basis: 'A two-year VA simulation estimated 0.144 incremental QALYs and 90.7 additional stable-housing days per homelessness-prevention recipient receiving temporary financial assistance.' },
      { key: 'hamilton_qaly', label: 'QALYs per Hamilton assisted family after transfer discount', confidence: 'very low transfer', best: String(bridgeAudit.modeledBridge.qalyPerAssistedFamily.best), range: `${bridgeAudit.modeledBridge.qalyPerAssistedFamily.low}–${bridgeAudit.modeledBridge.qalyPerAssistedFamily.high}`, basis: bridgeAudit.sourceEvidence.hamiltonQalysPerAssistedFamily.basis },
    ],
    sensitivity: bridgeAudit.modeledBridge.sensitivity.map((row) => ({ case: row.case, headline: compactMoney.format(row.costPerTenQalysUsd), detail: `${money.format(row.donorCostPerFamilyUsd)} per family · ${percent.format(row.retainedShareOfVaQalyEffect)} of VA QALY estimate retained` })),
    boundary: `${bridgeAudit.modeledBridge.nullBoundary} ${bridgeAudit.sourceEvidence.boundary}`,
  },
  evidence: review.evidence.filter((item) => evidenceKeys.has(item.key)).map(item=>item.key==='hamilton-prevention-program'?{...item,result:'The FY2025 audit describes up to three months of back rent plus three months of future rent, with income planning, referrals and case management. The current SF ERAP application page describes past/future rent but no guaranteed six-month award; the 127 reported FY2025 prevention outcomes are administrative claims, not causal effects.'}:item),
  reservations: review.reservations,
  excludedBenefits:['Child, partner and caregiver spillovers without measured household outcomes.','Additional earnings, landlord welfare or avoided public costs beyond the net tenant-resource allocation.','Other Hamilton programs, recurring post-rehousing cash and benefits beyond the supported horizon.'],
  fundingAppendix:<><h3>Spending and financial records</h3><p>Original FY2025, FY2024 and FY2023 consolidated statement-of-activities expenses are $18,799,001, $22,640,878 and $22,766,766: average $21,402,215. Those statements net direct special-event costs; gross functional expenses are $18,980,454, $22,825,446 and $22,853,470. Legal-entity Form 990 expenses are $18,906,130, $21,858,844 and $22,981,979. Do not blend these scopes. The FY2025 return’s tax-year 2024 label covers July 2024–June 2025.</p><p>FY2025 Housing Services expense is $7,549,923, including $3,060,446 rental/move-in assistance and $833,752 post-rental assistance. Prevention and rehousing are combined, so these cannot be divided by the 127 reported prevention outcomes to derive a unit price. The central $10,000 is assumed all-in; treating it instead as program-only and allocating shared support raises the cost to $13,600 and the comparison price to about $1.89M. That alternative is not added again to the all-in central case.</p><p>At June 30, 2025, financial assets available for general expenditure were $5,164,612 and restricted guaranteed-basic-income assets were $2,265,874. These dated balances are not current cash or prevention funding room. The prevention contract extends to June 2028; its August 30, 2026 data, loaded September 28, reports $8,363,463 authority, $4,375,495 paid and $2,527,827 remaining authority. Those lifetime accounting fields do not establish a philanthropic shortfall. Current SF application eligibility, not the broader organization’s placement mix, defines this model’s SF scope.</p></>,
  sources: [
    ...review.sources.filter((source) => model.sources.some((modelSource) => modelSource.url === source.url)),
    ...bridgeAudit.sources.filter((source) => !review.sources.some((existing) => existing.url === source.url)),
    ...receipts.sources.filter(s=>['audit-FY2025','audit-FY2024','audit-FY2023','990-FY2025','990-FY2024','current-prevention-eligibility','prevention-city-contract','primary-local-RCT','CG-crosswalk','current-financial-index'].includes(s.id)).map(s=>({publisher:s.id==='CG-crosswalk'?'Coefficient Giving':s.id==='primary-local-RCT'?'Phillips and Sullivan':s.id==='prevention-city-contract'?'City and County of San Francisco':'Hamilton Families',title:s.id.replaceAll('-',' '),url:s.url,published:'Fiscal or publication period described in this report',retrieved:'2026-10-01',sourceType:s.id.includes('audit')?'original audited financial statements':s.id.includes('990')?'original Form 990':'original program, contract or research source'})),
  ],
};

export default function HamiltonFamiliesResearchPage() {
  return <CharityResearchReport content={content} />;
}
