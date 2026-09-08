import CharityResearchReport,{type CharityReportContent} from '@/components/CharityResearchReport';
import programs from '@/data/san-francisco/large-bay-programs-v1.json';
import {foodAccessModel,benefitAccessModel,foodPharmacyModel} from '@/lib/large-bay-impact-model.mjs';
const money=(n:number|null)=>n===null?'No positive price':new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
const thresholdMoney=(n:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',minimumFractionDigits:2,maximumFractionDigits:2}).format(n);
export default function LargeBayProgramReport({slug}:{slug:string}){
 const data=programs.find(r=>r.slug===slug);if(!data)throw Error('Unknown Bay program');
 const calc=data.calculator==='food'?foodAccessModel:data.calculator==='benefits'?benefitAccessModel:foodPharmacyModel;
 const cases=data.scenarios.map(s=>({s,r:calc(s)})),central=cases[1];
 const content:CharityReportContent={
 organization:data.organization,program:data.program,eyebrow:'BAY AREA · CONDITIONAL HEALTH MODEL',published:'7 September 2026',modelVersion:data.version,
 nutshell:{headline:'Useful assistance, but not a leading health-only opportunity under our current estimate.',
 body:<>Our best guess is <strong>{money(central.r.costPerTenQalys)} per better life—10 incremental QALYs</strong>. This is an exploratory program model, not measured organization-wide effectiveness. <a href={'/api/bay-program-model?slug='+slug}>Inspect the model →</a></>,
 whyItMayWork:'Additional assistance may improve food security beyond what existing services provide.',
 whyWeAreCautious:'The pathway from assistance to incremental health contains judgmental causal, duration and financing assumptions. A zero health effect remains plausible.',
 recommendationBlocker:data.funding},
 summary:[{label:'BEST GUESS',value:money(central.r.costPerTenQalys),detail:'USD per 10 incremental QALYs; very low confidence'},
 {label:'POSITIVE SCENARIOS',value:money(cases[0].r.costPerTenQalys)+'–'+money(cases[2].r.costPerTenQalys),detail:'Joint assumptions, not confidence bounds'},
 {label:'GEOGRAPHY',value:data.geography,detail:'Kept separate from SF-city recommendations'},
 {label:'FUNDING ROOM',value:'Unverified',detail:'Not a current restricted donation offer'}],
 programSection:{body:data.how,steps:[{title:'Define the extra service',detail:data.unit},{title:'Price the actual bottleneck',detail:'Reconcile existing public, private and partner resources before attributing delivery to a new gift.'},{title:'Test incremental health',detail:'Measure outcomes against existing alternatives, including burdens and potential harms.'}],boundary:data.geography},
 model:{headline:money(central.r.costPerTenQalys)+' per 10 QALYs',body:data.evidence+(data.calculator==='pharmacy'?'':' The .023 observational utility contrast compares USDA adult responses 0–2 (food secure, including marginal security) with 3+ (insecure). Favorable one-year health duration assumes persistence beyond the six-month course without further paid treatment; it is not demonstrated by that course.'),
 equation:{label:'INSPECTABLE HEALTH BRIDGE',expression:data.equation+'; price = 10 × donor cost / Q when Q > 0',result:money(central.r.costPerTenQalys)},
 inputs:Object.entries(central.s).filter(([,v])=>typeof v==='number').map(([key,v])=>({key,label:key,confidence:'Source anchor or analyst judgment; see evidence below',best:String(v),range:cases.map(c=>String(Object.entries(c.s).find(([k])=>k===key)?.[1])).join(' / '),basis:'Favorable / central / pessimistic. The full combination is a scenario, not a confidence interval.'})),
 giftHeading:'Constructed course costs—not a verified funding tranche',
 sensitivity:cases.map(c=>({case:c.s.name,headline:money(c.r.costPerTenQalys)+' per 10 QALYs',detail:c.r.netQalys.toPrecision(4)+' QALY per modeled unit. Maximum cost to reach $100K/10Q: '+thresholdMoney(c.r.maximumCostFor100k)})),
 uncertaintyBoundary:'No extra delivery or no causal health improvement gives no finite positive impact price. Harm can outweigh benefit. Financing multiplies both added benefit and harm; unchanged delivery does not create new harm.',
 fundingBoundary:data.costs+' '+data.funding},
 evidence:[{key:'evidence',design:'External studies and local program disclosures',population:data.unit,result:data.evidence,transfer:'No local randomized QALY estimate. All local transfer and donor additionality coefficients are explicit judgments.'}],
 reservations:['Food access, dignity and purchasing power have value not fully captured by this narrow health ledger.','Do not add food-bank and downstream partner effects for the same household.','The favorable case does not establish an available or cost-effective marginal gift.'],
 excludedBenefits:['Unmodeled child development and mortality','Public benefits converted directly into QALYs','Whole-organization reach','Unverified healthcare savings'],sources:data.sources};
 return <CharityResearchReport content={content}/>;
}
