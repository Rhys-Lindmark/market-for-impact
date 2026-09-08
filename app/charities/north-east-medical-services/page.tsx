import type { Metadata } from 'next';
import CharityResearchReport, { type CharityReportContent } from '@/components/CharityResearchReport';
import data from '@/data/san-francisco/nems-hbv-cea-v1.json';
import { hbvRetentionModel } from '@/lib/hbv-retention-model.mjs';
export const metadata: Metadata = { title: 'NEMS: hepatitis B cost-effectiveness | Market for Impact', description: 'A provisional model of additional HBV follow-up, with recurring costs, source limitations and explicit health assumptions.' };
const money = (n: number | null) => n === null ? 'No finite positive price' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
const scenarios = data.scenarios.map(s => ({ ...s, result: hbvRetentionModel(s) }));
const central = scenarios[1];
const r = central.result;
const content: CharityReportContent = {
  organization: data.organization, program: data.program, eyebrow: 'SAN FRANCISCO · MECHANISM-FIRST BET 4 · EXPLORATORY', published: '7 September 2026', modelVersion: data.version,
  nutshell: {
    headline: 'Preventing liver disease is promising. Repeated follow-up must change care that would otherwise be missed.',
    body: <>Our provisional best guess is <strong>{money(r.costPerTenQalys)} per better life: 10 additional QALYs</strong>. We would investigate an additional, targeted re-engagement package—not recommend an unrestricted gift from this estimate. A favorable case reaches $41,400, but assumes decades of useful support. <a href="/api/sf-hbv-model">Inspect the model →</a></>,
    whyItMayWork: 'Reliable monitoring can identify when treatment is needed and prevent later liver disease.',
    whyWeAreCautious: 'NEMS already provides HBV care and has a ReLink grant. The additional effect of a new gift is unknown.',
    recommendationBlocker: 'No priced SF-specific expansion, verified funding gap or causal local health estimate was found.',
  },
  summary: [
    { label: 'OUR BEST GUESS', value: money(r.costPerTenQalys), detail: 'per 10 QALYs; conditional navigation-cost model' },
    { label: 'POSITIVE SCENARIOS', value: '$41.4K–$326M', detail: 'Joint judgments, not confidence bounds; null/harm possible' },
    { label: 'EVIDENCE', value: 'Very low for donor price', detail: 'Published simulation adapted with unverified local effects' },
    { label: 'FUNDING ROOM', value: 'Unverified', detail: 'Existing services and grants are the counterfactual' },
  ],
  programSection: {
    body: 'NEMS offers screening, ongoing monitoring, indicated treatment and liver fibrosis assessment at SF locations. The proposed intervention is additional follow-up for adults with diagnosed HBV who would otherwise miss appropriate care. It is not a confirmed new NEMS project. The giving page names North East Medical Services Foundation as recipient; this review has not verified an HBV restriction or the foundation EIN.',
    steps: [
      { title: 'Find a real care gap', detail: 'Identify patients not adequately reached by existing care, registry reminders or the funded ReLink project.' },
      { title: 'Complete appropriate care', detail: 'Navigation must change completed monitoring and, when indicated, treatment or surveillance—not just messages or appointments.' },
      { title: 'Sustain the health benefit', detail: 'Pay for recurring support and account for later usual care, disease mix and funding replacement.' },
    ],
    boundary: 'The source’s inactive HBV means a clinical state: normal ALT, no cirrhosis and not currently eligible for antiviral treatment. It does not mean an inactive record or a person lost to follow-up. This calibration cannot be applied unchanged to every disengaged patient or advanced disease. The model follows a closed initial cohort without replacement patients and retains full fixed staffing costs. Hep B Moms is a separate infant-prevention lead, not included here.',
  },
  model: {
    headline: 'Our provisional estimate: ' + money(r.costPerTenQalys) + ' per 10 QALYs',
    body: 'Central present-value navigation cost is $808 per initial registry person across 20 funded years. We assume a 10-percentage-point monitoring gain beyond existing provision, then retain half the calibrated health response and assign half the benefit to the gift. Our uncertain timing adjustment yields 0.00673 QALY per initial person. These are model judgments—not observed NEMS results.',
    equation: { label: 'DOLLARS PER BETTER LIFE', expression: '10 × discounted recurring cost ÷ [0.17394 × (local monitoring gain / 0.2835) × causal transfer × funding additionality × timing fraction − harms]', result: money(r.costPerTenQalys) + ' per 10 QALYs' },
    inputs: data.assumptions.map(a => ({ key: a.key, label: a.label, confidence: 'Source calibration or analyst judgment; see basis', best: String(central[a.key as keyof typeof central]), range: scenarios.map(s => String(s[a.key as keyof typeof s])).join(' / '), basis: a.basis })),
    inputColumnLabel: 'Optimistic / central / pessimistic',
    giftHeading: 'Illustrative $100,000 buys 0.833 modeled QALY—not an available tranche',
    sensitivity: scenarios.map(s => ({ case: s.name, headline: money(s.result.costPerTenQalys) + ' per 10 QALYs', detail: money(s.result.donorCost) + ' present-value navigation cost per initial person; ' + s.result.netQalys.toPrecision(3) + ' net QALYs.' })),
    uncertaintyBoundary: data.nullBoundary, fundingBoundary: data.costPerspective,
  },
  comparisonBridge: {
    headline: 'A lifetime calibration—not a one-year navigator saving a lifetime',
    body: 'The external economic model supplies a discounted lifetime health difference. We allocate it over an assumed 35-year window using weights t/(1.03^t), credit only the first 20 years and charge recurring support for those 20 years. This retains 43.8% of the anchor. The assumed curve is not the source model’s annual trajectory, and this calculation does not recreate its disease transitions.',
    equation: { label: 'CREDITED HEALTH TIMING', expression: 'Σ[t/(1.03^t), t=1…20] ÷ Σ[t/(1.03^t), t=1…35]', result: '43.8% of the already discounted calibration' },
    inputs: [],
    sensitivity: [
      { case: 'Uniform health timing', headline: money(hbvRetentionModel({ ...central, benefitShape: 0 }).costPerTenQalys) + ' per 10 QALYs', detail: 'A different unverified time profile; not a clinical finding.' },
      { case: 'Later-weighted health timing', headline: money(hbvRetentionModel({ ...central, benefitShape: 2 }).costPerTenQalys) + ' per 10 QALYs', detail: 'More benefit falls beyond the credited window.' },
      { case: 'Full funding replacement', headline: 'No positive benefit', detail: 'The gift pays the same costs but changes no health if it merely replaces existing support.' },
      { case: 'Target price at central health', headline: money(r.maximumDonorCostFor100k) + ' per initial person', detail: 'Maximum present-value donor cost to reach $100K/10 QALYs. A threshold, not an available funding offer; reducing resources may reduce effect.' },
    ],
    boundary: 'Normalization avoids discounting the lifetime anchor twice. No health gains are credited after year20; that is a simplifying accounting restriction, not evidence that earlier treatment stops helping. Conversely, monitoring gains may not persist or cause the source-like downstream care assumed here. The linear monitoring-to-health scaling and transfer factors are unvalidated.',
  },
  evidence: [
    { key: 'paper', design: 'Published lifetime economic model', population: '100,000 already-diagnosed adults, initially inactive HBV', result: 'Navigation Table3 implies 17,394 additional discounted QALYs. Results report $9,025/QALY; the abstract instead reports $8,416.', transfer: 'Healthcare-system benchmark, not observed donor performance. Monitoring improvements persist by assumption; source discrepancies remain unresolved.' },
    { key: 'registry', design: 'Descriptive local conference abstract', population: '3,457 NEMS patients with a primary-care visit in 2022–23', result: 'Reports testing and prescriptions, not a causal navigation comparison.', transfer: 'Two-year tests are not annual adherence; people without a visit are excluded. The claimed economic-model intervention effects were not found in this cited abstract.' },
    { key: 'grant', design: 'Current funder disclosure', population: 'NEMS HBV ReLink project', result: 'A 12-month project is listed in progress.', transfer: 'Evidence of existing funding, not an additional donation opportunity; the NEMS-specific amount is undisclosed.' },
  ],
  reservations: ['Our central estimate assumes clinical benefit scales linearly with additional monitoring. Testing without appropriate treatment or surveillance may deliver no modeled gain.', 'Current local care may outperform the economic model’s baseline. Existing EHR support, ReLink and public reimbursement may crowd out the proposed gift.', 'The source assumes permanent monitoring improvement and high adherence. We have not reproduced its Markov model, resolved its reporting discrepancies, or validated the temporal adaptation.', 'Public tests, medication and surveillance are excluded from the donor-cost numerator but consume resources. This is not a societal cost-effectiveness estimate.', 'The favorable $41.4K case is not the ranking estimate. Donation restriction, current local workload, fully loaded staffing and additional completed care need verification.'],
  excludedBenefits: ['Infant infection prevention and onward transmission', 'New patients replacing those leaving the initial cohort', 'Health gains after the credited time window', 'Avoided future healthcare expenditure', 'Income and family welfare'],
  sources: data.sources,
};
export default function NemsResearchPage() { return <CharityResearchReport content={content} />; }
