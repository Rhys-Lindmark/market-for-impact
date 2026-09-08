import type {Metadata} from 'next';
import CharityResearchReport,{type CharityReportContent} from '@/components/CharityResearchReport';
import data from '@/data/san-francisco/clinic-dental-cea-v1.json';
import {dentalAccessModel} from '@/lib/dental-access-model.mjs';
export const metadata:Metadata={title:'Clinic by the Bay: earlier dental pain relief | Market for Impact',description:'An explicit, uncertain model of earlier definitive dental care, donor costs and pain-related QALYs.'};
const money=(n:number|null)=>n===null?'No positive price':new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
const scenarios=data.scenarios.map(s=>({...s,result:dentalAccessModel(s)})),central=scenarios[1],r=central.result;
const labels:Record<string,string>={cost:'Donor cost per completed episode',utilityGain:'Utility improvement while pain would persist',painYears:'Otherwise untreated integrated pain-years',resolution:'Probability of symptomatic resolution',fundingAdditionality:'Fraction of genuinely additional care',harmQalys:'Net harm per genuinely additional episode'};
const content:CharityReportContent={
 organization:data.organization,program:data.program,eyebrow:'SAN FRANCISCO · MECHANISM-FIRST DENTAL ACCESS · EXPLORATORY',published:'7 September 2026',modelVersion:data.version,
 nutshell:{
  headline:'Relieving severe dental pain sooner could be valuable. The waiting-time counterfactual is decisive.',
  body:<>Our provisional best estimate is <strong>{money(r.costPerTenQalys)} per better life: 10 additional QALYs</strong>. We model an SF resident receiving a clinically indicated simple extraction earlier, not the clinic’s entire program. The health inputs are judgments; no marginal funding offer is verified. <a href="/api/sf-dental-model">Inspect the model →</a></>,
  whyItMayWork:'A relatively short treatment episode may end recurring pain that would otherwise continue while someone waits for care.',
  whyWeAreCautious:'Neither the extra wait avoided nor the utility change caused by this local intervention has been measured.',
  recommendationBlocker:'Need a funded-versus-unfunded treatment plan, SF allocation, wait reduction and cost per extra completed episode.',
 },
 summary:[
  {label:'BEST GUESS',value:money(r.costPerTenQalys),detail:'USD per10 incremental QALYs; gross donor episode budget'},
  {label:'POSITIVE SCENARIOS',value:money(scenarios[0].result.costPerTenQalys)+'–'+money(scenarios[2].result.costPerTenQalys),detail:'Joint judgments, not confidence bounds'},
  {label:'UNIT',value:'Completed care',detail:'Not an exam, appointment slot or antibiotic prescription'},
  {label:'FUNDING ROOM',value:'Unverified',detail:'General donation route is not a priced extra-care offer'},
 ],
 programSection:{
  body:'Clinic by the Bay provides simple extractions and fillings to eligible active medical patients, prioritizing diabetes care. It does not offer root canals or tooth replacement. Its emergency slot is for examination and X-rays, not guaranteed same-day treatment. The clinic reports donor rather than government/insurance financing; existing donors and other treatment options still matter.',
  steps:[
   {title:'Identify appropriate patients',detail:'Clinicians and patients choose care; this model does not recommend extracting teeth that could appropriately be preserved.'},
   {title:'Fund extra completed care',detail:'Include assessment, treatment, follow-up and allocated failed appointments. Restrict the modeled cohort to SF residents or allocate costs and benefits consistently.'},
   {title:'Measure earlier relief',detail:'Estimate integrated pain until spontaneous improvement or alternative treatment, accounting for intermittent symptoms—not the remaining lifetime.'},
  ],
  boundary:'One symptomatic condition per person; do not add utility gains across teeth without accounting for overlap. Eligibility excludes Medi-Cal or other insurance. Non-SF beneficiaries require a separate geographic allocation.',
 },
 model:{
  headline:money(r.costPerTenQalys)+' per10 QALYs',
  body:'Central judgments: USD350 per completed episode, .04 utility gain over .25 otherwise untreated pain-years, .80 resolution, .50 additional financing, and .0005 net harm per additional episode. These yield .00375 donor-attributable QALY. The harm convention differs from the discovery draft: both benefit and harm now disappear under pure replacement of identical care.',
  equation:{label:'DOLLARS PER BETTER LIFE',expression:'10 × donor episode cost ÷ {additionality × [utility gain × untreated pain-years × resolution − net episode harm]}',result:money(r.costPerTenQalys)+' per10 QALYs'},
  inputs:Object.entries(labels).map(([key,label])=>({key,label,confidence:'Analyst judgment; cost has a local salary anchor',best:String(central[key as keyof typeof central]),range:scenarios.map(s=>String(s[key as keyof typeof s])).join(' / '),basis:key==='resolution'?'Symptom resolution conditional on completed care, not appointment completion.':'See evidence and cost construction below.'})),
  inputColumnLabel:'Central',
  giftHeading:'Hypothetical USD3,500 for ten completed episodes—not an available tranche',
  sensitivity:[...scenarios.map(s=>({case:s.name,headline:money(s.result.costPerTenQalys)+' per10 QALYs',detail:s.result.netQalys.toPrecision(4)+' QALY per funded episode.'})),{case:'Threshold test',headline:'More than '+r.requiredPainYearsFor100k?.toFixed(2)+' untreated pain-years',detail:'Needed for under USD100K/10Q at other central assumptions, versus central .25 years. This is not evidence such waits occur.'}],
  uncertaintyBoundary:'No extra care or no net health improvement gives no finite positive price. Complications or loss of function may outweigh relief; negative health is not a bargain.',
  fundingBoundary:'Constructed USD350 budget: salary midpoint90,000 /1,040 paid hours ×1.30 assumed loading ×2 allocated episode hours =225, plus75 assistant/admin and50 supplies. Salary range85–95K for20hours/week is published; loading, throughput and allocations are judgments. Paid time includes oversight, leave and failed appointments. Volunteer opportunity cost is excluded from this donor perspective, not zero. A vacancy does not prove an unfunded position.',
 },
 evidence:[
  {key:'cohort',design:'Nonrandomized Swedish prospective cohort',population:'Paired extraction respondents n18 at12months',result:'Mean EQ5D .77→.81; p=.297. This is not a causal extraction effect.',transfer:'The .04 input is a judgment loosely informed by this nonsignificant before/after difference. No untreated comparator; UK crosswalk values and some tooth replacement complicate SF transfer.'},
  {key:'salary',design:'Local employment disclosure',population:'Part-time dental director role',result:'Salary anchors a constructed episode budget, not observed treatment unit cost.',transfer:'Actual clinical capacity and full cost must be measured; volunteer hours are not free resources.'},
 ],
 reservations:[
  'The favorable scenario assumes severe pain persisting for a year without timely alternatives. It is a research possibility, not a measured local patient profile.',
  'Use conditional pain duration and resolution consistently: do not apply resolution twice if a duration estimate already incorporates failures.',
  'Earlier usual-care treatment, existing donors and insurance eligibility changes can reduce additionality. Direct public payer overlap is not the only counterfactual.',
  'Patient choice, tooth preservation, postoperative burden and longer-term function belong in clinical decisions, not donor-driven extraction targets. Net episode harm is incremental versus eventual alternative care: accelerating the same procedure does not automatically create all of its harm.',
  'Actual donor funding room, SF-resident share, wait reduction and added completed treatment remain unknown.',
 ],
 excludedBenefits:['Mortality reduction','Employment and income','Multiple overlapping tooth-level utility gains','Unpriced volunteer opportunity costs','Permanent full-health restoration'],
 sources:data.sources,
};
export default function DentalResearchPage(){return <CharityResearchReport content={content}/>;}
