import type {Metadata} from 'next';
import CharityResearchReport,{type CharityReportContent} from '@/components/CharityResearchReport';
import data from '@/data/san-francisco/breathe-cea-v1.json';
import {cessationModel,asthmaModel} from '@/lib/breathe-model.mjs';
export const metadata:Metadata={title:'Breathe California: cessation and child asthma | Market for Impact',description:'Conditional cost-effectiveness models for smoking cessation and child asthma support, with separate evidence and funding boundaries.'};
const money=(n:number|null)=>n===null?'No positive price':new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
const scenarios=data.scenarios.map(s=>({...s,result:cessationModel(s)})),central=scenarios[1],r=central.result;
const asthma=data.asthmaScenarios.map(s=>({...s,result:asthmaModel(s)}));
const labels:Record<string,string>={cost:'Donor cost per enrolled adult',extraQuitProbability:'Additional six-month quit probability',qalysPerQuitter:'Discounted lifetime QALYs per extra quitter',transfer:'Health-yield transfer after six months',fundingAdditionality:'Additional financed capacity',harmQalys:'Extra net harm per enrollee'};
const content:CharityReportContent={
 organization:data.organization,program:data.program,eyebrow:'SAN FRANCISCO · MECHANISM-FIRST BET 6 · CONDITIONAL',published:'7 September 2026',modelVersion:data.version,
 nutshell:{
  headline:'Helping people quit can be inexpensive. The local opportunity still needs to be demonstrated.',
  body:<>Our provisional best guess is <strong>{money(r.costPerTenQalys)} per better life: 10 additional QALYs</strong> for an additionally financed adult cessation course. This is a research hypothesis, not a verified SF offer. Childhood asthma support is modeled separately below at {money(asthma[1].result.costPerTenQalys)} per 10 QALYs. <a href="/api/sf-breathe-model">Inspect both models →</a></>,
  whyItMayWork:'A small increase in lasting cigarette cessation can prevent later illness; a group course spreads delivery costs.',
  whyWeAreCautious:'Neither the current SF course nor its incremental quit rate and marginal budget are verified.',
  recommendationBlocker:'Need a named SF cohort, legal recipient, itemized budget and evidence that the gift adds care beyond free alternatives.',
 },
 summary:[
  {label:'CESSATION BEST GUESS',value:money(r.costPerTenQalys),detail:'per 10 QALYs; conditional donor counseling cost'},
  {label:'POSITIVE SCENARIOS',value:'$33.3K–$64M',detail:'Joint judgments, not confidence bounds'},
  {label:'CHILD ASTHMA',value:money(asthma[1].result.costPerTenQalys),detail:'Separate symptom-day bridge; not added to cessation'},
  {label:'FUNDING ROOM',value:'Unverified',detail:'Current SF cessation cohort is unconfirmed'},
 ],
 programSection:{
  body:'Breathe California of the Bay Area, Golden Gate, and Central Coast describes Ash Kickers as six adult group sessions. Its SF resources page is a directory, not proof of a currently enrolling local course. Do not confuse this organization with separately incorporated Breathe organizations. Its asthma home service includes assessment, education, equipment when needed and follow-ups; county-level evidence supports SF availability more clearly than it does for cessation.',
  steps:[
   {title:'Enroll the right denominator',detail:'Define the enrolled adults offered the full course, including those who do not finish. Costs and quit probabilities must use the same denominator.'},
   {title:'Measure extra sustained quits',detail:'Track six-month continuous abstinence against existing support. The provider’s six-week headline is not a causal long-term quit probability.'},
   {title:'Check financing and medicines',detail:'Separate a new donation from existing funding and free Kick It California help. Confirm medication access and who pays before assuming it is outside the gift.'},
  ],
  boundary:'The model is not the effectiveness of all Breathe programs or a claim that a current SF slot can be bought. It does not substitute text-message costs or effects for the six-session group course.',
 },
 model:{
  headline:money(r.costPerTenQalys)+' per 10 QALYs',
  body:'We assume a $200 donor budget per enrolled adult and a 3-percentage-point additional six-month quit probability. A published lifetime health calibration is reduced for uncertain local health yield, then for replacement of existing financing. This gives 0.00375 QALY per enrollee. Every local effect and price here is a judgment.',
  equation:{label:'DOLLARS PER BETTER LIFE',expression:'10 × donor course cost ÷ [extra six-month quit probability × lifetime Q per quitter × health-yield transfer × funding additionality − harms]',result:money(r.costPerTenQalys)+' per 10 QALYs'},
  inputs:Object.entries(labels).map(([key,label])=>({key,label,confidence:key==='qalysPerQuitter'?'External model calibration; pessimistic value is judgment':'Analyst judgment, not provider quote or measured effect',best:String(central[key as keyof typeof central]),range:scenarios.map(s=>String(s[key as keyof typeof s])).join(' / '),basis:key==='transfer'?'Applies to health after the quit endpoint, not engagement or modality efficacy already in the quit increment.':'See cost construction, evidence and limitations.'})),
  inputColumnLabel:'Favorable / central / pessimistic',
  giftHeading:'Hypothetical $2,000 for ten enrollees—not an available tranche',
  sensitivity:[...scenarios.map(s=>({case:s.name,headline:money(s.result.costPerTenQalys)+' per 10 QALYs',detail:s.result.netQalys.toPrecision(3)+' QALY per enrolled adult.'})),{case:'Add $100 medication/access contingency',headline:money(cessationModel({...central,cost:300}).costPerTenQalys)+' per 10 QALYs',detail:'Same health assumption; an actual quote must specify medication financing.'}],
  uncertaintyBoundary:'Zero additional quits or fully replaced funding gives no finite positive price. Harms or displacement of better support can make net health negative; a negative ratio is not a bargain.',
  fundingBoundary:'Constructed $200 budget: six sessions × two paid preparation/delivery hours × $60/hour ÷ ten enrollees = $72, plus $68 coordination and $60 materials/space/follow-up. These are assumptions. Medication and other payers’ resources are excluded, not free. Empty places raise unit cost. This is gross donor counseling cost, not societal cost.',
 },
 comparisonBridge:{
  headline:'For children: asthma support is a different, locally grounded opportunity',
  body:'The external child trial compared nurse education with nurse education plus home support in children ages3–13. We use 24.4 additional symptom-free days/year and a judgmental 0.10 utility improvement per changed day. At $1,000 and cautious transfer/funding assumptions, the estimate is about $5.98M/10 QALYs. Being young does not itself justify counting a whole lifetime of benefit.',
  equation:{label:'CHILD HEALTH BRIDGE',expression:'extra symptom-free days / 365 × utility gap × equivalent benefit-years × transfer × funding additionality − harms',result:asthma[1].result.netQalys.toPrecision(4)+' QALY per child'},
  inputs:['cost','extraSymptomFreeDays','utilityGap','equivalentYears','transfer','fundingAdditionality'].map(key=>({key,label:key,confidence:key==='extraSymptomFreeDays'?'Central external trial anchor; other scenarios are judgments':'Analyst judgment',best:String(asthma[1][key as keyof typeof asthma[1]]),range:asthma.map(s=>String(s[key as keyof typeof s])).join(' / '),basis:'Equivalent years integrate benefit within at most one year; no unsupported second year.'})),
  sensitivity:asthma.map(s=>({case:s.name,headline:money(s.result.costPerTenQalys)+' per 10 QALYs',detail:'Separate childhood asthma mechanism; not a second organization or additive outcome.'})),
  boundary:'Symptom-free days are not automatically full-health days. Caregiver questionnaire improvement is not child QALYs. A 2024 Philadelphia randomized trial of 626 children found no between-group improvement in asthma control at 12 months; its different population and intervention do not directly test Breathe. From January 2026, Medi-Cal asthma education and home assessments belong under Asthma Preventive Services; supplies and modifications are distinct Community Supports. Coverage does not prove access, but a donor must identify an uncovered service or access bottleneck rather than purchase publicly financed care twice.',
 },
 evidence:[
  {key:'provider',design:'Uncontrolled provider headline',population:'Ash Kickers participants at six weeks',result:'Reports over60% tobacco-free without a usable comparator or long-term follow-up denominator.',transfer:'Not entered as an incremental six-month quit probability.'},
  {key:'qaly',design:'UK lifetime economic model linked to a text-support RCT',population:'Trial-weighted adult smokers',result:'29 QALYs /58 extra six-month quitters gives an approximate0.5 QALY/quitter calibration.',transfer:'Already incorporates relapse, background quitting and3.5% discounting. No extra duration, death or generic relapse multiplier. It does not establish Breathe course efficacy.'},
  {key:'child',design:'Randomized home-support trial',population:'309 children ages3–13; active nurse-education comparator',result:'Additional symptom-free days, not a measured lifetime child utility gain.',transfer:'The utility-day bridge and local donor cost remain judgments; a null benefit scenario matters.'},
 ],
 reservations:[
  'Local course availability, legal donation recipient, medication payer and marginal capacity remain unverified. A directory listing cannot resolve them.',
  'The quit increment, health-yield transfer and financing factor answer different questions. If local evidence combines those effects, they must be elicited jointly rather than discounted twice.',
  'At central health assumptions the course would need to cost under $37.50 per enrollee to meet $100K/10 QALYs. At $200 it needs a16-percentage-point incremental quit probability, not the assumed3points.',
  'The old UK health model is a calibration, not a reconstructed contemporary SF disease model. Its source utility labels and population mix merit further checking.',
  'The child comparison does not claim lifelong asthma prevention, infant benefit, mortality reduction or caregiver QALYs. Asthma delivery has stronger geographic evidence but a weak preference-based health bridge.',
 ],
 excludedBenefits:['Secondhand-smoke health gains','Healthcare savings to other payers','Productivity and cigarette expenditure','Caregiver health','Child asthma gains beyond the modeled year'],
 sources:data.sources,
};
export default function BreatheResearchPage(){return <CharityResearchReport content={content}/>;}
