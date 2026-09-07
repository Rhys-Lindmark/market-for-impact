import type { Metadata } from 'next';
import CharityResearchReport, { type CharityReportContent } from '@/components/CharityResearchReport';
import model from '@/data/san-francisco/dope-site-cea-v1.json';
import { dopeSiteModel } from '@/lib/dope-site-model.mjs';

export const metadata: Metadata = { title: 'DOPE tenant responders: cost-effectiveness | Market for Impact', description: 'A judgmental site-year model of additional overdose response, with transparent costs, existing coverage and shared-benefit limits.' };
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const number = new Intl.NumberFormat('en-US', { maximumSignificantDigits: 3 });
const scenarios = model.scenarios.map(s => ({ ...s, result: dopeSiteModel(s) }));
const central = scenarios.find(s => /central/i.test(s.name))!;
const r = central.result;
const best = money.format(r.costPerTenQalys!);
const price = (value: number | null) => value === null ? 'No finite positive price' : money.format(value) + ' per 10 QALYs';
const content: CharityReportContent = {
  organization: model.organization,
  eyebrow: 'SAN FRANCISCO · MECHANISM-FIRST BET 1 · EXPLORATORY',
  program: model.program,
  published: '7 September 2026', modelVersion: model.version,
  nutshell: {
    headline: 'Promising response infrastructure, but not a sub-$100 K lead at our central site risk.',
    body: <>Our best guess is <strong>{best} per better life: 10 incremental QALYs</strong> for a hypothetical added tenant-responder site-year. We would investigate a documented high-risk, under-covered site before prioritizing this over our current leads. The model is not a measured DOPE result or a verified funding offer. <a href="/api/sf-dope-model">Inspect the versioned model →</a></>,
    whyItMayWork: 'Trusted residents may shorten the gap between an overdose and effective help, especially when formal supplies are available but not reached in time.',
    whyWeAreCautious: 'A staffed site-year is not cheap relative to its baseline fatal-event count. Current prevention is already substantial, and the additional mortality reduction is unknown.',
    recommendationBlocker: 'No current DOPE-restricted marginal work plan, site-specific cost or causal mortality estimate has been verified.',
  },
  summary: [
    { label: 'OUR BEST GUESS', value: best, detail: 'per 10 QALYs; subjective additional site-year model' },
    { label: 'POSITIVE SCENARIOS', value: '$16.9 K–$689 M', detail: 'Joint assumptions, not a confidence interval; null/harm possible' },
    { label: 'EVIDENCE', value: 'Very low for price', detail: 'Local implementation evidence, no measured causal mortality effect' },
    { label: 'FUNDING ROOM', value: 'Unverified', detail: 'General national donations are not a local expansion quote' },
  ],
  programSection: {
    body: 'DOPE is a National Harm Reduction Coalition program. This review models a hypothetical additional year of tenant outreach, training, refills and coordination in supportive housing. It excludes electronic detection systems and the wider national organization.',
    steps: [
      { title: 'Identify an actual coverage gap', detail: 'Choose occupied resident-person-time and shifts or networks not already served by contracts, staff, peers or another provider.' },
      { title: 'Support tenant responders', detail: 'Pay and train peers, replenish supplies, coordinate with building staff and provide supervision and debriefing. Four specialists do not imply continuous coverage.' },
      { title: 'Count only added health', detail: 'Estimate fewer otherwise-fatal events under existing usual care, not the number of trainings, kits or reported reversals.' },
    ],
    boundary: 'The pilot studied 50- and 160-unit buildings and paid trained specialists $50 weekly in gift cards. Those historical implementation details do not establish today’s cost, occupancy or efficacy. Our exposure is 100 occupied resident-person-years, not 100 distinct people or licensed beds.',
  },
  model: {
    headline: 'Our central estimate: ' + best + ' per 10 QALYs.',
    body: 'Annual donor cash is modeled as 4 × $50 × 52 for peers, plus 5 coordinator hours/week × $60 × 52, plus $4,000 for other delivery support: $30,000. The historical peer payment is a calibration only; staffing, pay adequacy and overhead require a current quote. The health model assumes 100 resident-years, 0.3% all-overdose fatal risk under usual care, 80% potentially opioid-responsive deaths, 20% additional risk reduction and 50% funding additionality. Each prevented acute death receives about 5.154 discounted future QALYs using the same survival assumptions as SFAF.',
    equation: { label: 'USD PER BETTER LIFE', expression: '10 × $30,000 ÷ (100 × 0.003 × 0.80 × 0.20 × 0.50 × 5.1541)', result: '≈ ' + best + ' per 10 QALYs' },
    inputs: model.judgments.map(j => ({ key: j.key, label: j.label, confidence: 'Analyst judgment unless explicitly sourced', best: String(central[j.key as keyof typeof central]), range: scenarios.map(s => String(s[j.key as keyof typeof s])).join(' / '), basis: j.basis })),
    inputColumnLabel: 'Optimistic / central / pessimistic',
    giftHeading: 'Illustrative $100,000: ' + number.format(r.additionalQalysPer100k) + ' QALYs—not available funding room',
    sensitivity: scenarios.map(s => ({ case: s.name, headline: price(s.result.costPerTenQalys), detail: number.format(s.result.additionalDeathsPrevented) + ' net acute deaths prevented and ' + number.format(s.result.netQalys) + ' QALYs per site-year. Favorable assumptions are not observed site performance.' })),
    uncertaintyBoundary: model.nullBoundary,
    fundingBoundary: model.costPerspective + ' The funding discount addresses substitution; the risk-reduction assumption already includes reach, availability and rescue relative to usual care. Do not discount engagement a second time. No benefits from repeated annual tranches may be summed without accounting for the same survivors.',
  },
  comparisonBridge: {
    headline: 'What would it take to beat $100,000 per better life?',
    body: 'At central cost and survival, the model needs more than ' + number.format(r.requiredDeathsFor100k) + ' net deaths prevented per site-year. Yet its entire baseline is only 0.3 all-overdose deaths. Even perfect prevention with no funding substitution cannot cross the threshold at that exposure and risk. A cheaper supplemental tranche or genuinely higher-risk site is a different hypothesis to test—not a reason to assign it the whole site’s benefit.',
    equation: { label: 'THRESHOLD', expression: '$30,000 ÷ $10,000 per QALY ÷ 5.1541 QALYs per prevented death', result: 'More than ' + number.format(r.requiredDeathsFor100k) + ' net deaths prevented/site-year' },
    inputs: [],
    sensitivity: [0, .05, .15].map(harm => { const result = dopeSiteModel({ ...central, responderHarmQalys: harm }); return { case: number.format(harm) + ' responder QALYs lost/site-year', headline: price(result.costPerTenQalys), detail: number.format(result.netQalys) + ' net QALYs. Illustrative burden stress test, not measured worker harm.' }; }),
    boundary: 'Responder psychological burden is unquantified, not presumed absent. The positive cases display zero subtraction; the stress tests show how small site-level losses can alter the result. Nonfatal overdose morbidity and peer income benefits are also excluded.',
  },
  evidence: [
    { key: 'implementation', design: 'Qualitative local evaluation', population: 'Two supportive SRO buildings; 35 observation days and interviews with staff and trained tenants', result: 'Improved access and coordination were described, alongside turnover, overnight constraints and responder burden.', transfer: 'No controlled mortality reduction or incremental-response rate. Existing responders and front-desk supplies were part of the baseline.' },
    { key: 'risk', design: 'Historical local mortality study', population: 'San Francisco SRO residents, 2010–2017', result: 'Table 1 reports 278.7 all-overdose and 157.8 opioid-related deaths per 100,000 annually, using SRO units as a population proxy.', transfer: 'Our 0.3% all-overdose risk and 80% responsive share are current-site judgments, not values measured by that study. Do not add substance-specific categories, which overlap.' },
    { key: 'coverage', design: 'Public implementation reporting', population: 'HSH-funded permanent supportive housing', result: 'The January 2025 SFDPH update reports 24/7 naloxone stations at all 156 sites.', transfer: 'Supply availability is not timely access or rescue, but it rules out assuming an untreated baseline. Actual current site coverage must be checked.' },
    { key: 'funding', design: 'Public contract inventory and objectives', population: 'NHRC Naloxone Distribution program, contract 1000032403', result: 'April 2026 inventory lists$439,086; FY 25–26 targets include 50 training events and two new community sites.', transfer: 'These are a program funding line and targets—not paid marginal cost, achieved outcomes, or open funding room. The objectives are not specific proof of an unfunded SRO tranche.' },
  ],
  reservations: [model.overlap, 'Current site mortality and incremental response are the decisive missing observations. A high-risk optimistic scenario is not evidence that such a site is available.', 'Locked rooms, staff turnover and peer availability can prevent timely help despite nearby medication. Duty, consent, supervision and worker safety need a funded plan.', 'SFDPH and DOPE obtain free intranasal naloxone through California’s NDP. Additional delivery depends on continued supply; donated resources are not zero societal costs.', 'National donations may support work outside San Francisco. No specific local gift restriction or current unfunded expansion has been verified.'],
  excludedBenefits: ['Nonfatal overdose morbidity', 'Peer income, dignity and social connection', 'Electronic detection and button systems', 'Later healthcare and other public resource costs', 'Any separately counted SFAF benefit for the same event or person'],
  sources: model.sources,
};
export default function DopeResearchPage() { return <CharityResearchReport content={content} />; }
