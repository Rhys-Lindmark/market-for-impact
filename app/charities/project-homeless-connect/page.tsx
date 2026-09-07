import type { Metadata } from 'next';
import CharityResearchReport, { type CharityReportContent } from '@/components/CharityResearchReport';
import model from '@/data/san-francisco/phc-glasses-cea-v1.json';
import { glassesDecisionModel } from '@/lib/glasses-model.mjs';

export const metadata: Metadata = { title: 'Project Homeless Connect: prescription glasses | Market for Impact', description: 'A conditional $71K per 10-QALY estimate for prescription glasses, with explicit cost, utility, retention and funding assumptions.' };
const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const scenarios = model.scenarios.map(s => ({ ...s, result: glassesDecisionModel(s) }));
const central = scenarios[1];
const price = usd.format(central.result.costPerTenQalys!);
const content: CharityReportContent = {
  organization: model.organization, program: model.program,
  eyebrow: 'CHARITY RESEARCH · SAN FRANCISCO · EXPLORATORY',
  donationUrl: 'https://www.projecthomelessconnect.org/donate/',
  published: '7 September 2026', modelVersion: model.version,
  nutshell: {
    headline: 'A cheap correction could buy meaningful healthy time—if the next gift adds access.',
    body: <>Our conditional best guess is <strong>{price} per better life (10 QALYs)</strong>. Prescription glasses are a promising research lead below our $100K target, not yet a verified marginal donation opportunity. The largest uncertainty is whether new giving adds usable correction beyond existing coverage. <a href="https://ai.rhyslindmark.com/donate/api/sf-glasses-model">Inspect every input and calculated scenario →</a></>,
    whyItMayWork: 'A low-cost device can correct an ongoing limitation for months, without requiring an expensive year-long service program.',
    whyWeAreCautious: 'The health-utility estimate comes from an uncontrolled external study. Local retained use, costs and counterfactual access are unmeasured.',
    recommendationBlocker: 'No current restricted expansion, incremental dispense budget or marginal funding room has been verified.',
  },
  summary: [
    { label: 'OUR BEST GUESS', value: price, detail: 'per 10 incremental QALYs; conditional analyst estimate' },
    { label: 'POSITIVE SCENARIOS', value: '$8.9K–$4M', detail: 'Not a confidence interval; zero additional benefit remains possible' },
    { label: 'EVIDENCE', value: 'Very low locally', detail: 'Correctable impairment mechanism; uncertain local transfer' },
    { label: 'FUNDING ROOM', value: 'Unverified', detail: 'Giving levels are not an additional allocation plan' },
  ],
  programSection: {
    body: 'Core Senses offers one prescription pair annually at monthly Optical Day, with an existing prescription. PHC also offers reading glasses and repairs. This model covers appropriately prescribed, completed dispenses—not all screenings, all eye disease, or its hearing and dental programs.',
    steps: [
      { title: 'Obtain the right prescription', detail: 'An examination occurs elsewhere; a historical Optical Day listing explicitly excludes on-site exams.' },
      { title: 'Complete fitting and collection', detail: 'Navigation matters: in a small SF shelter-clinic study, only 14 of 40 people referred for free glasses presented.' },
      { title: 'Retain useful correction', detail: 'Credit health improvement only while the pair remains usable and worn, and only beyond what would otherwise have happened.' },
    ],
    boundary: 'PHC is fiscally sponsored by Community Initiatives (EIN 94-3255070). Sponsor-wide financial statements cannot be treated as PHC program costs. A general donation is not automatically restricted to glasses.',
  },
  model: {
    headline: 'Our best estimate: ' + price + ' per 10 QALYs.',
    body: 'We assume $100 of donor spending per completed pair, a 0.0375 health-utility gain while corrected, nine effective months of use and 50% additionality. All four are analyst judgments. The current PHC giving level implies $50 per pair; doubling it is a provisional delivery allowance, not audited costing.',
    equation: { label: 'DOLLARS PER BETTER LIFE', expression: '10 × $100 ÷ (0.0375 × 0.75 years × 50%)', result: '≈ ' + price + ' per 10 QALYs' },
    inputs: model.judgments.map(j => ({ key: j.key, label: j.label, confidence: 'Explicit analyst assumption', best: String(central[j.key as keyof typeof central]), range: scenarios.map(s => String(s[j.key as keyof typeof s])).join(' / '), basis: j.basis })),
    inputColumnLabel: 'Optimistic / central / pessimistic inputs',
    giftHeading: 'Illustrative $100,000: 1,000 funded pairs and 14.06 QALYs',
    sensitivity: scenarios.map(s => ({ case: s.name, headline: usd.format(s.result.costPerTenQalys!) + ' per 10 QALYs', detail: s.result.additionalQalys.toFixed(2) + ' additional QALYs per $100,000; not available funding room' })),
    uncertaintyBoundary: model.nullBoundary,
    fundingBoundary: 'This is a donor-budget perspective, not full societal cost-effectiveness. The $100 allowance assumes access to other financed or donated resources. Reimbursement, in-kind optical inputs and cash costs must be reconciled before using it to budget a gift. PHC describes its programs as privately funded; that does not establish that recipients lack other insured routes to glasses.',
  },
  comparisonBridge: {
    headline: 'What would overturn the under-$100K conclusion?',
    body: 'Holding other central assumptions fixed, donor cost must stay below $140.63 per completed pair, or additionality must exceed 35.6% at $100 per pair. These are break-even calculations, not evidence that the program meets the conditions.',
    equation: { label: 'QALYS PER COMPLETED PAIR', expression: '0.0375 utility × 0.75 effective years × 0.5 additionality', result: '0.0140625 incremental QALYs' },
    inputs: [],
    sensitivity: [0.25, 0.5, 0.75, 1].map(a => ({ case: (100 * a) + '% additionality', headline: usd.format(glassesDecisionModel({ ...central, additionality: a }).costPerTenQalys!) + ' per 10 QALYs', detail: 'One-way sensitivity; other central inputs held fixed.' })),
    boundary: 'The 35% referral-presentation rate is not multiplied into a cost already defined per completed dispense. If future costing is per referral instead, completion must enter explicitly. Presentation alone is not verified sustained wear.',
  },
  evidence: [
    { key: 'utility', design: 'Uncontrolled before/after study', population: '41 Zambia spectacle recipients at six-month follow-up from 113 recruited', result: 'EQ-5D utility rose from 0.850 to 0.925. The model uses half the 0.075 change.', transfer: 'Selection, confounding, severity and valuation differences limit causal transfer. The 50% adjustment is subjective; the study price is not a PHC donor price.' },
    { key: 'access', design: 'Local observational clinic follow-up', population: 'SF homeless-shelter clinic, 2017–18', result: '14 of 40 glasses referrals presented. This identifies a real access problem, not the effect of additional PHC funding.', transfer: 'Small historical cohort; no current dispense costs, corrected acuity or long-term wear estimate.' },
    { key: 'coverage', design: 'Official program and benefit descriptions', population: 'PHC participants and full-scope Medi-Cal members', result: 'A 2025 Optical Day served eligible Medi-Cal recipients; routine glasses are already a covered benefit with replacement provisions.', transfer: 'Coverage is not the same as successful access. The additionality assumption jointly allows alternative access and displaced funding.' },
  ],
  reservations: [
    'The result is close enough to the target that reasonable cost or additionality changes move it above $100K.',
    'The external utility sample is small and uncontrolled; correcting all local vision problems is not assumed. Current recipient-level presenting and corrected acuity are unmeasured, so the half-strength transfer does not establish comparable baseline severity.',
    'Repeated yearly pairs cannot each receive overlapping multiyear benefits. This model caps effective use within one year.',
    'A glasses-specific marginal budget, dispenses and follow-up could change the estimate substantially. No organizational evidence request has been sent.',
  ],
  excludedBenefits: model.excluded, sources: model.sources,
};
export default function PHCReport() { return <CharityResearchReport content={content} />; }
