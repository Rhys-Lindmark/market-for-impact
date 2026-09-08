import type {Metadata} from 'next';
import CharityResearchReport,{type CharityReportContent} from '@/components/CharityResearchReport';
import data from '@/data/san-francisco/st-anthony-diabetes-cea-v1.json';
import {diabetesAccessModel} from '@/lib/diabetes-access-model.mjs';
export const metadata:Metadata={title:'St. Anthony: diabetes outreach | Market for Impact',description:'Conditional diabetes-reconnection model with separate peer-support redesign and transparent20-year health calibration.'};
const money=(n:number|null)=>n===null?'No positive price':new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
const scenarios=data.scenarios.map(s=>({...s,result:diabetesAccessModel(s)})),central=scenarios[1],r=central.result,peer=diabetesAccessModel(data.redesign);
const labels:Record<string,string>={cost:'Donor cost per offered episode',sourceQalys:'External integrated20-year QALY gain',transfer:'Delivery and population transfer',fundingAdditionality:'Genuinely additional financing',harmQalys:'Extra net harm per additional episode'};
const content:CharityReportContent={
 organization:data.organization,program:data.program,eyebrow:'SAN FRANCISCO · MECHANISM-FIRST DIABETES ACCESS · EXPLORATORY',published:'7 September 2026',modelVersion:data.version,
 nutshell:{
  headline:'Reconnecting patients is worthwhile to investigate; a reminder is not a complete diabetes intervention.',
  body:<>Our provisional best guess is <strong>{money(r.costPerTenQalys)} per better life: 10 additional QALYs</strong>. The health bridge comes from an external modeled support package, not measured A3 outcomes. A more intensive peer-supported redesign is considered separately and does not determine this ranking. <a href="/api/sf-diabetes-model">Inspect the models →</a></>,
  whyItMayWork:'Outreach could lead to otherwise missed indicated treatment and fewer later complications.',
  whyWeAreCautious:'More testing or insurance paperwork alone does not establish additional health; dose and case mix differ from the external trial.',
  recommendationBlocker:'Need the current marginal delivery plan, completed care, causal outcomes, full payer costs and treatment harms.',
 },
 summary:[
  {label:'OUTREACH BEST GUESS',value:money(r.costPerTenQalys),detail:'per10 incremental QALYs; very low confidence'},
  {label:'OUTREACH SCENARIOS',value:money(scenarios[0].result.costPerTenQalys)+'–'+money(scenarios[2].result.costPerTenQalys),detail:'Same external CHW-only anchor; not confidence bounds'},
  {label:'SEPARATE REDESIGN',value:money(peer.costPerTenQalys),detail:'Conditional peer support, not current A3 effectiveness'},
  {label:'FUNDING ROOM',value:'Unverified',detail:'Existing workflow and public care are counterfactuals'},
 ],
 programSection:{
  body:'St. Anthony’s A3 initiative describes outreach and insurance reconnection for patients with poorly controlled diabetes. A January2025 report says quarterly testing increased from61% to86%; this process change is not a causal QALY estimate. Clinic financing includes public/sliding-fee arrangements. Healthy SF is not insurance. We model additional SF outreach, not all Foundation services.',
  steps:[
   {title:'Define the offered cohort',detail:'Include disconnected adults offered the episode, with failed contact and noncompletion costs. Do not price only successes while importing intention-to-treat health gains.'},
   {title:'Reconnect to indicated care',detail:'Track actual care and medication access, not just tests or enrollment forms. Clinical targets depend on individual circumstances.'},
   {title:'Measure the difference',detail:'Compare sustained outcomes and harms with concurrent usual care, including existing A3 capacity and alternative financing.'},
  ],
  boundary:'The proposed USD400 buys a constructed outreach episode, not a demonstrated replica of an18-month trial package. Continuing support needs continuing costs.',
 },
 model:{
  headline:money(r.costPerTenQalys)+' per10 QALYs',
  body:'Central: USD400 per offered episode and .0015 external modeled QALY gain, multiplied by .50 delivery/population transfer and .50 financing additionality. Net extra harm is initially assumed zero, not known absent. This gives .000375 donor-attributable QALY. The small positive estimate is an explicit uncertain prior, not evidence that the clinic is ineffective.',
  equation:{label:'DOLLARS PER BETTER LIFE',expression:'10 × donor cost ÷ {funding additionality × [external integrated QALYs × local transfer − extra net harm]}',result:money(r.costPerTenQalys)+' per10 QALYs'},
  inputs:Object.entries(labels).map(([key,label])=>({key,label,confidence:key==='sourceQalys'?'Primary Table2 economic-model increment':'Analyst judgment',best:String(central[key as keyof typeof central]),range:scenarios.map(s=>String(s[key as keyof typeof s])).join(' / '),basis:'No second lifetime, duration or generic completion multiplier.'})),
  inputColumnLabel:'Central',
  giftHeading:'Hypothetical USD4,000 for ten offered episodes—not a verified tranche',
  sensitivity:scenarios.map(s=>({case:s.name,headline:money(s.result.costPerTenQalys)+' per10 QALYs',detail:s.result.netQalys.toPrecision(4)+' modeled QALY per offered episode.'})),
  uncertaintyBoundary:'No change in indicated care or complete financing replacement gives no finite positive price. Hypoglycemia and treatment burden can produce negative net health.',
  fundingBoundary:'USD400 is five staff hours ×USD60 plusUSD100 access/admin allocation, including failed outreach. Not a provider quote. Visits, drugs and other payers’ resources are excluded, not free. Trial noncompletion is embedded in the package anchor; do not add an arbitrary completion haircut. Additional local recruitment losses need separate evidence.',
 },
 comparisonBridge:{
  headline:'Peer-supported redesign: a different bet, not the same outreach program',
  body:'A separate conditional design uses the source peer-support package’s .0276 QALY increment, .75 local transfer, .75 financing and a low USD150 donor contribution supported by donated capacity. Its result is about USD96.6K/10Q. It changes intervention and cost structure, so it is not the favorable bound for existing A3 and is excluded from the main ranking.',
  equation:{label:'SEPARATE REDESIGN',expression:'10 ×150 / (.0276 ×.75 ×.75)',result:money(peer.costPerTenQalys)+' per10 QALYs'},
  inputs:Object.entries(labels).map(([key,label])=>({key,label,confidence:key==='sourceQalys'?'External peer-package model':'Redesign judgment',best:String(data.redesign[key as keyof typeof data.redesign]),range:'Separate design, not outreach uncertainty',basis:'The additional peer support and low donor cost must both be demonstrated.'})),
  sensitivity:[{case:'USD400 instead of150',headline:money(diabetesAccessModel({...data.redesign,cost:400}).costPerTenQalys)+' per10 QALYs',detail:'Same peer-health assumptions; threshold crossing is sensitive to donor price.'}],
  boundary:'Weekly peer support is more intensive than reconnection. Donated capacity, full-resource costs and actual local delivery are unverified. Do not borrow the source’s persistent-effect sensitivity or subtract its future medical savings from donor cash.',
 },
 evidence:[
  {key:'model',design:'REACH Detroit trial-based economic simulation',population:'Diabetes support versus enhanced usual care',result:'Table2 reports .0015 QALY for CHW-only and .0276 for CHW-plus-peer support over20years.',transfer:'Already includes waning and3% annual discounting. Source intervention costs are2018 USD:234 usual care,820 CHW,1599 CHW+peer over18months; not local donor prices.'},
  {key:'null',design:'Seattle randomized community-health-worker trial',population:'Safety-net adults; excluded homelessness, serious illness and impending moves',result:'Overall A1c and health-related quality-of-life differences were not significant; high-A1c subgroup was more favorable.',transfer:'About49% potentially eligible people could not be contacted. These selection limits matter for disconnected SF adults.'},
  {key:'positive',design:'Miami randomized intensive support trial',population:'300 adults;215 followed up',result:'Adjusted additional A1c reduction about .51 percentage points over a year.',transfer:'Home visits and repeated calls are more intensive than a reminder. This is not the QALY coefficient.'},
 ],
 reservations:[
  'At central health assumptions donor cost must be below USD3.75 per episode for the100K/10Q target, versus proposed400.',
  'The separate peer redesign changes treatment intensity and financing; its optimistic threshold result is not established local cost-effectiveness.',
  'Outcome association, enrollment targets, clinic visits and individual patient stories cannot identify donation-caused QALYs.',
  'Source rounded table increments do not reproduce printed ICERs exactly; we preserve displayed values rather than invent precision.',
  'No universal lower-A1c target is recommended. Extra net harms must be assessed relative to alternative clinical care.',
 ],
 excludedBenefits:['Future healthcare savings as donor cash','Income and enrollment itself','Extra lifetime multiplier','Unmeasured caregiver benefits'],
 sources:data.sources,
};
export default function DiabetesResearchPage(){return <CharityResearchReport content={content}/>;}
