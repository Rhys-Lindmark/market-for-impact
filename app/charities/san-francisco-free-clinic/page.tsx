import type { Metadata } from 'next';
import CharityResearchReport, { type CharityReportContent } from '@/components/CharityResearchReport';
import data from '@/data/san-francisco/sffc-vaccine-cea-v1.json';
import { vaccineAccessModel } from '@/lib/vaccine-access-model.mjs';
export const metadata: Metadata = { title: 'SF Free Clinic: targeted vaccine access | Market for Impact', description: 'An exploratory shingles-vaccine access model with explicit inventory cash, completion and counterfactual assumptions.' };
const money = (n: number | null) => n === null ? 'No positive price' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
const cases = data.scenarios.map(s => ({ ...s, result: vaccineAccessModel(s) }));
const central = cases[1], r = central.result;
const labels: Record<string,string> = {initiators:'First-dose starts',completedSeries:'Completed courses',benchmarkAge:'Benchmark age',clinicalTransfer:'Clinical transfer, excluding completion',counterfactualShare:'Gift-attributable benefit share',incompleteHarm:'QALY harm allowance per incomplete course',purchasedSeedDoses:'Purchased starting inventory',adminPerDose:'Paid administration per dose',navigationPerInitiator:'Paid navigation per starter',setupCash:'Setup cash',dosePrice:'Dose acquisition price proxy',otherCash:'Additional unitemized cash allowance',donatedLaborValue:'Additional donated-labor valuation'};
const content: CharityReportContent = {
  organization:data.organization,program:data.program,eyebrow:'SAN FRANCISCO · MECHANISM-FIRST BET 5 · PROPOSED EXPANSION',published:'7 September 2026',modelVersion:data.version,
  nutshell:{
    headline:'Free vaccine supply could help. Starting inventory and additional patients still have to be paid for.',
    body:<>Our provisional central estimate is <strong>{money(r.costPerTenQalys)} per better life: 10 additional QALYs</strong>. We would investigate a tightly specified vaccine-access pilot, not recommend a general donation from this model. SFFC provides vaccinations, but its delivery of this specific product and assistance pathway is unverified. <a href="/api/sf-vaccine-model">Inspect the model →</a></>,
    whyItMayWork:'Preventing shingles and persistent nerve pain can generate health gains; donated supply may reduce donor cash.',
    whyWeAreCautious:'The favorable $92.6K result needs unusually low delivery costs, fast stock turnover and almost no substitution for existing vaccination.',
    recommendationBlocker:'No verified SFFC shingles expansion, eligible patient cohort, itemized quote or marginal funding offer.',
  },
  summary:[
    {label:'OUR BEST GUESS',value:money(r.costPerTenQalys),detail:'per 10 QALYs; finite-cohort donor cash'},
    {label:'POSITIVE SCENARIOS',value:'$92.6K–$121M',detail:'Joint judgments, not statistical bounds'},
    {label:'LOCAL DELIVERY',value:'Product unverified',detail:'Generic vaccination service is confirmed'},
    {label:'FUNDING ROOM',value:'Unknown',detail:'No available tranche established'},
  ],
  programSection:{
    body:'The clinic serves uninsured people and lists vaccinations among its services. This review proposes additional shingles vaccination for eligible, otherwise unvaccinated adults; it does not claim the clinic currently participates in this manufacturer assistance pathway.',
    steps:[
      {title:'Find genuinely additional patients',detail:'Verify clinical eligibility, prior vaccination, assistance eligibility and whether another provider would vaccinate them anyway.'},
      {title:'Fund delivery and stock',detail:'Pay for applications, administration and purchased starting doses. Manufacturer replacement is vaccine inventory, not a cash refund. Ten approved doses must accumulate within12 months or replacement is forfeited. GSK does not pay for administration, and the provider cannot bill a public payer for it.'},
      {title:'Complete the course',detail:'Track second doses, actual receipts and unused stock. Applications, referrals and leftover vaccine are not completed health gains.'},
    ],
    boundary:'The age-70 cohort is hypothetical. Many people this age have Medicare and do not qualify for this assistance program. No evidence establishes sufficient eligible SFFC patients. This model cannot be used as personal vaccination advice or as the incremental effect of recalling dose two alone.',
  },
  model:{
    headline:money(r.costPerTenQalys)+' per 10 QALYs',
    body:'The central pilot assumes 20 starts and 16 completed courses. It purchases 20 starting doses, administers 36 and receives 30 replacement doses. Gross cash is $5,933.80; 14 doses remain as stock with no cash or future-health credit. Our completed-course health proxy yields 0.03035 additional lifetime QALY for the cohort.',
    equation:{label:'DOLLARS PER BETTER LIFE',expression:'10 × gross donor cash ÷ [(completed × source Q × clinical transfer − incomplete-course harm) × counterfactual share − extra harm]',result:money(r.costPerTenQalys)+' per 10 QALYs'},
    inputs:Object.entries(labels).map(([key,label])=>({key,label,confidence:key==='dosePrice'?'Manufacturer list-price proxy; not clinic quote':'Analyst judgment, not local measurement',best:String(central[key as keyof typeof central]),range:cases.map(s=>String(s[key as keyof typeof s])).join(' / '),basis:key==='otherCash'||key==='donatedLaborValue'?'Zero is an explicit unquantified omission, not evidence these resources are free. See cost boundaries.':'See source audit and scenario limitations below.'})),
    inputColumnLabel:'Favorable / central / unfavorable',
    giftHeading:'A hypothetical $5,934 pilot—not a verified funding request',
    sensitivity:cases.map(s=>({case:s.name,headline:money(s.result.costPerTenQalys)+' per 10 QALYs',detail:money(s.result.donorCash)+' cash; '+s.result.netQalys.toPrecision(4)+' cohort QALYs; '+s.result.terminalDoses+' terminal doses.'})),
    uncertaintyBoundary:'No incremental vaccination means no positive estimate. Negative net QALYs are possible in the model; an incomplete-only case omits partial protection and does not demonstrate that one-dose vaccination is biologically harmful.',
    fundingBoundary:'Gross donor cash includes initial inventory without salvage. Shipment cadence is assumed adequate; the year-end stock equation is not a dated delivery simulation. Additional cold-chain, screening failures, finance, supervision and donated staff costs are not fully itemized. A separate consumed-resource proxy values all used vaccine at list price but omits unpriced labor and is not a societal ICER.',
  },
  comparisonBridge:{
    headline:'A narrow favorable case—not a robust sub-$100K finding',
    body:'The favorable case starts 100 eligible age-70 patients, completes 95 courses and uses a ten-dose stock buffer. Its cash headroom below the target is only about $305. Two more purchased buffer doses would exceed the threshold. The central cohort would need total cash below $304, compared with nearly $6,000 modeled.',
    equation:{label:'TARGET CASH CEILING',expression:'$100,000 ÷ 10 × cohort incremental QALYs',result:money(r.maximumCashFor100k)+' at central health'},
    inputs:[],
    sensitivity:[
      {case:'Favorable plus two buffer doses',headline:money(vaccineAccessModel({...cases[0],purchasedSeedDoses:12}).costPerTenQalys)+' per 10 QALYs',detail:'No extra patient benefit is credited for unused inventory.'},
      {case:'Central consumed-resource price proxy',headline:money(r.resourceProxyPerTenQalys)+' per 10 QALYs',detail:'Values consumed vaccine at list price and delivery cash; donated labor remains unpriced. Not the ranking numerator.'},
      {case:'Complete funding substitution',headline:'No positive benefit',detail:'Cash is still spent if the gift merely replaces existing vaccination support.'},
    ],
    boundary:'Reusing already-financed stock could make a later marginal cohort cheaper, but capital and health boundaries must extend together. Do not count the same manufacturer-leveraged health again as an additional benefit.',
  },
  evidence:[
    {key:'model',design:'Published lifetime economic model',population:'Immunocompetent US adults vaccinated at ages 50, 60 or 70',result:'Table 2 gives net discounted incremental QALYs of 0.001220, 0.003052 and 0.005392 respectively.',transfer:'Imported modeled health, not an observed SFFC effect. Source completion and vaccine harms are already embedded; source societal cost offsets are not donor cash.'},
    {key:'local',design:'Current clinic service disclosure',population:'Uninsured clinic patients',result:'Vaccinations are listed; a product-specific service and assistance arrangement are not confirmed.',transfer:'An educational sample note is not evidence of administered shingles doses.'},
    {key:'supply',design:'Manufacturer assistance rules',population:'Approved eligible patients at registered sites',result:'In-kind ten-dose replenishment batches and an annual 200-dose site/product cap.',transfer:'Stock must be purchased before use; other patients can consume the cap. Timing and remaining capacity require local verification.'},
  ],
  reservations:[
    'The health shortcut credits the published mixed-completion benefit only for completed courses, without dividing by 95.5%. Incomplete courses get no protection credit and an explicit adverse-burden allowance. This conservative convention is not an exact two-dose model or universal lower bound.',
    'Clinical transfer excludes completion; counterfactual share jointly represents alternate access, later vaccination and funding replacement. Do not multiply a second displacement discount.',
    'The old model assumes waning and lifetime survival rather than observing lifetime outcomes. New long-term follow-up exists; updating it requires disease-state modeling, not multiplying QALYs by a newer efficacy ratio. One source author disclosed manufacturer advisory work.',
    'The low-cost scenario depends on shared or donated labor and rapid replacement. Neither the patient count nor staff capacity is verified. Unpriced labor and costs can eliminate the apparent advantage.',
    'Stock balance does not prove each injection can occur on time. Count only receipts, not expected approvals, and model extra purchases if shipments arrive late.',
  ],
  excludedBenefits:['Protection from incomplete courses','Future use of terminal stock','Healthcare and productivity cost savings','Other vaccines or other clinic services'],
  sources:[...data.sources,{publisher:'EClinicalMedicine',title:'Final ZOE-LTFU analysis to 11 years',url:'https://pubmed.ncbi.nlm.nih.gov/40630610/',published:'2025-05-09',retrieved:'2026-09-07',sourceType:'Primary long-term extension study'}],
};
export default function VaccineResearchPage(){return <CharityResearchReport content={{...content, donationUrl:"https://sffc.org/donate"}}/>;}
