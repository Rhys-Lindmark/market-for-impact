import fs from 'node:fs';
import {calculate as health} from '/Users/rhyslindmark/Documents/Codex/2026-08-29/okay-you-re-gonna-make-this/work/market-for-impact-california-six-surgery-beta/lib/oa-portfolio-model.mjs';
import {finiteYears,CATEGORIES} from '/Users/rhyslindmark/Documents/Codex/2026-08-29/okay-you-re-gonna-make-this/work/market-for-impact-california-six-surgery-beta/lib/oa-portfolio-foundation.mjs';
const legacy=JSON.parse(fs.readFileSync('/Users/rhyslindmark/Documents/Codex/2026-08-29/okay-you-re-gonna-make-this/work/market-for-impact-california-six-surgery-beta/data/san-francisco/oa-portfolio-model-v2.json','utf8'));
const counts={gi:575,general:201,gyne:168,ortho:158,head_neck:127,urology:101,derm:80,vascular:58,eye:45,other:16};
const observed={services:1529,people:1130,expense2025:2261505,expenseSeries:[2658742,2678152,2261505],expenseMean:2532800,plannedBudget2026:1900000};
const historic=structuredClone(legacy),ratio=1529/1130;
for(const k of ['eye','hernia','crc']){historic.foundation.central_inputs[k+'_services_per_person']=ratio;historic.foundation.central_inputs[k+'_disjoint_fraction']=1;}
for(const p of historic.paths){p.services_per_person=ratio;p.disjoint_fraction=1;}
const historicResult=health(historic);
const base={gift:100000,funding:.3,cap:100,costPerService:2261505/1529,baselineConsumption:30000,medicationAnnual:60,cystNetRecoveredPaidDays:5,netPayPerRecoveredDay:100,paidWorkShare:.5,ctsExtraLostPaidDays:.3,patientNetCashPerService:25,overlap:0,resourcesScale:1,healthIndependentHarm:0,incomeIndependentHarm:0,healthNull:false,incomeNull:false,healthZero:false,incomeZero:false};
function calculate(o={}){
 for(const k of Object.keys(o))if(!Object.hasOwn(base,k)&&!['aubUtility','fastCatchup'].includes(k))throw Error('Unknown override '+k);
 const p={...base,...o};
 for(const [k,v]of Object.entries(p))if(typeof v==='number'&&!Number.isFinite(v))throw Error('Nonfinite '+k);
 if(p.gift<=0||p.funding<0||p.funding>1||p.cap<0||p.costPerService<=0||p.baselineConsumption<=0||p.paidWorkShare<0||p.paidWorkShare>1||p.overlap<0||p.overlap>1||p.healthIndependentHarm<0||p.incomeIndependentHarm<0||p.resourcesScale<0||p.medicationAnnual<0||p.netPayPerRecoveredDay<0||p.ctsExtraLostPaidDays<0||p.patientNetCashPerService<0)throw Error('Invalid parameters');
 const bounds={gift:[1,1e9],cap:[0,1e7],costPerService:[1,1e7],baselineConsumption:[1,1e8],medicationAnnual:[0,1e5],cystNetRecoveredPaidDays:[-365,365],netPayPerRecoveredDay:[0,1e4],ctsExtraLostPaidDays:[0,365],patientNetCashPerService:[0,1e5],resourcesScale:[0,10],healthIndependentHarm:[0,1e6],incomeIndependentHarm:[0,1e6]};for(const[k,[lo,hi]]of Object.entries(bounds))if(typeof p[k]!=='number'||p[k]<lo||p[k]>hi)throw Error('Invalid '+k);
 for(const k of ['healthNull','incomeNull','healthZero','incomeZero'])if(typeof p[k]!=='boolean')throw Error('Invalid '+k);
 const m=structuredClone(historic),b=m.foundation.central_inputs;b.gift_usd=p.gift;b.funding_additionality=p.funding;b.max_additional_services=p.cap;
 for(const k of CATEGORIES){b[k+'_allocation']=counts[k]/1529;b[k+'_cash_per_service']=p.costPerService;}
 // .056 integrated first-year RCT effect; .75 transfer premise, no annual extension.
 b.eye_horizon_years=1;b.eye_catchup_hazard=0;b.eye_treatment_success=1;
 b.eye_utility_gain=.056*.75/finiteYears(b.eye_loss_hazard+b.eye_mortality_hazard+Math.log1p(b.discount),1);
 m.paths.find(x=>x.id==='aub').utility_gain=.07; // SF36 evidence does not identify this QALY mapping.
 m.paths.find(x=>x.id==='gallstone').utility_gain=0; // selected uncomplicated subgroup; harms retained.
 if(o.funding!==undefined)b.funding_additionality=o.funding;
 if(o.aubUtility!==undefined)m.paths.find(x=>x.id==='aub').utility_gain=o.aubUtility;
 if(o.fastCatchup!==undefined){for(const k of ['eye','hernia','crc'])b[k+'_catchup_hazard']=o.fastCatchup;for(const x of m.paths)x.catchup_hazard=o.fastCatchup;}
 if(p.healthZero){for(const k of ['eye','hernia'])b[k+'_utility_gain']=0;b.crc_treatment_linkage=0;for(const x of m.paths)x.utility_gain=0;}
 const h=health(m),ledger=[];
 const paths=[...m.paths.map((x,i)=>({...x,people:h.new_paths[i].unique_people})),...['eye','hernia','crc'].map(k=>({id:k,people:h.foundation[k+'_unique_people'],category:k==='eye'?'eye':k==='hernia'?'general':'gi',treatment_success:k==='crc'?0:b[k+'_treatment_success'],catchup_hazard:b[k+'_catchup_hazard'],loss_hazard:k==='crc'?0:b[k+'_loss_hazard'],mortality_hazard:k==='crc'?b.crc_baseline_total_mortality_hazard:b[k+'_mortality_hazard'],delay_years:b[k+'_delay_years']}))];
 let income=0;
 for(const x of paths){
  // Avoided paid medicine only on symptomatic paths; diagnostic/zero-benefit paths excluded.
  const medicationEligible=!['eye','crc','gi_symptom_diagnosis','breast_diagnostic','gyne_diagnostic','skin_lesion','other_assessment','degenerative_knee','gallstone'].includes(x.id);
  const annualMed=medicationEligible?p.medicationAnnual*x.treatment_success:0;
  // OA cyst story supplies direction only;5netpaid days and50%employment are declared judgments.
  const annualWork=x.id==='general_cyst'?p.cystNetRecoveredPaidDays*p.netPayPerRecoveredDay*p.paidWorkShare*x.treatment_success:0;
  const ctsLoss=x.id==='cts'?p.ctsExtraLostPaidDays*p.netPayPerRecoveredDay:0;
  // All resource changes are first-year amounts only. Cash/work events assumed consumed
  // over that same first year; discount its midpoint, never inherit clinical tail/hazards.
  const rate=(annualMed+annualWork)*p.resourcesScale;
  const cash=-(p.patientNetCashPerService*ratio+ctsLoss)*p.resourcesScale;
  if(rate<=-p.baselineConsumption||rate+cash<=-p.baselineConsumption)throw Error('Nonpositive consumption');
  const weight=.5*x.people*Math.pow(1+b.discount,-(x.delay_years+.5));
  const flow=weight*Math.log1p(rate/p.baselineConsumption),totalResource=weight*Math.log1p((rate+cash)/p.baselineConsumption);
  const burden=totalResource-flow;
  const q=totalResource;income+=q;ledger.push({id:x.id,people:x.people,annualMedicationNet:annualMed,annualWorkNet:annualWork,annualCtsLoss:ctsLoss,firstYearExtraCash:cash,flowEquivalent:flow,burdenEquivalent:burden,incomeEquivalent:q});
 }
 income=p.incomeZero?0:income-p.incomeIndependentHarm;
 const qhealth=h.total_q-p.healthIndependentHarm;
 const proceduralHarm=h.foundation.total_harm_q+h.new_path_harm,grossHealth=h.total_q+proceduralHarm;
 const total=p.healthNull||p.incomeNull?null:grossHealth-p.overlap*Math.max(0,grossHealth)-proceduralHarm-p.healthIndependentHarm+income;
 const out={params:p,observed,nominalServices:h.nominal_services,additionalServices:h.foundation.additional_services,additionalPeople:paths.reduce((s,x)=>s+x.people,0),grossHealthYears:grossHealth,proceduralHealthHarm:proceduralHarm,healthYears:p.healthNull?null:qhealth,incomeEquivalentYears:p.incomeNull?null:income,totalEquivalentYears:total,price10:total>0?10*p.gift/total:null,healthOnlyPrice10:qhealth>0&&!p.healthNull?10*p.gift/qhealth:null,incomeOnlyPrice10:income>0&&!p.incomeNull?10*p.gift/income:null,healthPaths:h.new_paths,foundation:h.foundation,resourceLedger:ledger,model:m};
 function finite(v){if(typeof v==='number'&&!Number.isFinite(v))throw Error('Nonfinite output');if(v&&typeof v==='object')for(const x of Object.values(v))finite(x);}finite(out);return out;
}
const central=calculate();
const cases={central,retainedFundingHalf:calculate({funding:.5}),lowFunding:calculate({funding:.1}),highFunding:calculate({funding:.8}),completeReplacement:calculate({funding:0}),fiveSlots:calculate({cap:5}),cost2026BudgetSameOutput:calculate({costPerService:1900000/1529}),costThreeYearMeanSameOutput:calculate({costPerService:2532800/1529}),aubLegacyUtility:calculate({aubUtility:.1}),aubNoUtility:calculate({aubUtility:0}),fastOtherCare:calculate({fastCatchup:4}),incomeNull:calculate({incomeNull:true}),healthNull:calculate({healthNull:true}),allNull:calculate({healthNull:true,incomeNull:true}),incomeZero:calculate({incomeZero:true}),healthBenefitZeroHarmsRetained:calculate({healthZero:true}),resourceSignedHarm:calculate({medicationAnnual:0,cystNetRecoveredPaidDays:0,patientNetCashPerService:300}),independentHealthHarm:calculate({healthIndependentHarm:1}),independentIncomeHarm:calculate({incomeIndependentHarm:1}),halfOverlap:calculate({overlap:.5}),fullOverlap:calculate({overlap:1}),consumption15000:calculate({baselineConsumption:15000}),consumption60000:calculate({baselineConsumption:60000}),noMedicationSavings:calculate({medicationAnnual:0}),workRecoveryNull:calculate({cystNetRecoveredPaidDays:0}),netTwentyCystDays:calculate({cystNetRecoveredPaidDays:20})};
const summary=Object.fromEntries(Object.entries(cases).map(([k,v])=>[k,{nominalServices:v.nominalServices,additionalServices:v.additionalServices,additionalPeople:v.additionalPeople,healthYears:v.healthYears,incomeEquivalentYears:v.incomeEquivalentYears,totalEquivalentYears:v.totalEquivalentYears,price10:v.price10}]));
console.log(JSON.stringify({version:'oa-ca-20261002-donor-health-resources-judgment-v1',historical:{q:historicResult.total_q,price10:historicResult.regions.us.donor_per_10q},central:{...central,model:undefined},cases:summary,noEmpiricalScenarioWeights:true},null,2));
