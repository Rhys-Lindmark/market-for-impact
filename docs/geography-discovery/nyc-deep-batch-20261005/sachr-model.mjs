import fs from 'node:fs';
import assert from 'node:assert/strict';
import {incomeHealthyYearEquivalent} from '../../../lib/income-health-equivalence.mjs';

export const base={G:10000,C:5267469,N:2816,f:.8,b:.25,a:.5,z:.6,mHigh:.04,mLow:.01,delta:.002,u:.7,T:10,p:.12,v:.03,L:.25,r:.03,g:.98,h:.0001,households:.8,Y:20000,buyer:.25,saving:40,unmet:.25,consumption:20,travel:10,missed:5,medicineShare:.1,medicine:20,workShare:.02,earnings:300,earnYears:1,workDelay:1.25,positiveIndependent:.5,external:0};
export function calculate(overrides={}){
 const x={...base,...overrides},k=Math.log1p(x.r),F=(v,t)=>Math.abs(v)<1e-12?t:-Math.expm1(-v*t)/v;
 assert(Object.values(x).every(Number.isFinite),'Finite numeric inputs required');
 assert(x.G>0&&x.C>0&&x.N>0&&x.Y>0&&x.T>=1&&x.L>=0&&x.r>=0&&x.mHigh>=0&&x.mLow>=0&&x.delta>=0);
 for(const name of ['f','b','a','z','u','p','g','households','buyer','unmet','medicineShare','workShare','positiveIndependent'])assert(x[name]>=0&&x[name]<=1,'Invalid fraction '+name);
 for(const name of ['v','h','saving','consumption','travel','missed','medicine','external','earnYears','workDelay'])assert(x[name]>=0,'Invalid nonnegative input '+name);
 assert(x.Y+x.earnings>0,'Nonpositive employment resource baseline');
 assert(x.delta<=x.mHigh&&x.buyer+x.unmet<=1&&x.Y>x.travel+x.missed+x.medicine);
 const E=x.G*x.b*x.N*x.f/x.C;
 const survival=t=>x.z*Math.exp(-x.mHigh*t)+(1-x.z)*Math.exp(-x.mLow*t);
 const B=x.u*(F(x.mHigh-x.delta+k,1)-F(x.mHigh+k,1)+(Math.exp(-(x.mHigh-x.delta))-Math.exp(-x.mHigh))*Math.exp(-k)*F(x.mHigh+k,x.T-1));
 const mortality=E*x.a*x.z*Math.exp(-(x.mHigh+k)*x.L)*B;
 // Clinical utility is restricted to common-alive people. Baseline utility u
 // already prices extra survival; no morbidity upgrade is added to that tail.
 const morbidity=E*x.a*x.p*x.v*(x.z*Math.exp(-(x.mHigh+k)*x.L)*F(x.mHigh+k,1)+(1-x.z)*Math.exp(-(x.mLow+k)*x.L)*F(x.mLow+k,1));
 const harm=E*x.h*survival(x.L)*Math.exp(-k*x.L);
 const health=mortality+morbidity-harm,households=E*x.households;
 const paths=[];
 const add=(label,people,gain,time,independent,sourceIds,rationale,baseline=x.Y)=>{
  if(!(people>0)||gain===0)return;
  paths.push({label,people,annualIncomeBeforeUSD:baseline,annualIncomeGainUSD:gain,years:1,causalShare:survival(time),editionShare:x.g,independentShare:gain>0?independent:1,delayYears:time,discountRate:x.r,sourceIds,rationale,counterfactual:'Existing grants, free food/supply routes, benefits, paid leave and alternative employment services continue; net differential resources only. Baseline-alive households only, no ordinary income of newly surviving participants.'});
 };
 // Joint outcome strata: buyer versus unmet-consumption are disjoint. Shared
 // burden is charged first; any receipt then uses that reduced resource base.
 const burden=x.travel+x.missed,receipt=x.L+.5;
 add('Net additional travel and lost disposable pay',households,-burden,receipt,1,['programs','workforce-current','income-cg'],'One-off net engagement cash burden after existing transport assistance/paid leave; time without lost cash is excluded.');
 add('Actual food/hygiene purchase saving',households*x.buyer,x.saving,receipt,x.positiveIndependent,['impact','programs','income-cg'],'Disjoint would-buy households avoid actual own spending, not retail kit value; same nutrition in both worlds.',x.Y-burden);
 add('Usable in-kind consumption for unmet households',households*x.unmet,x.consumption,receipt,x.positiveIndependent,['impact','dropin-current','income-cg'],'Disjoint would-not-buy households receive useful food/hygiene consumption, valued at a judged low household consumption-equivalent amount; not simultaneous purchase saving.',x.Y-burden);
 for(const [stratum,share,gain] of [['buyer',x.buyer,x.saving],['unmet',x.unmet,x.consumption],['other',1-x.buyer-x.unmet,0]])add('Additional medicine cash burden: '+stratum,households*x.medicineShare*share,-x.medicine,receipt,1,['programs','income-cg'],'Net actual copay/medicine spending beyond covered or alternative care. Nested medical subgroup uses resources after its stratum-specific receipt, even when positive welfare overlap reduces credited receipt.',x.Y-burden+gain);
 // Employment gain is in the baseline-alive cohort; each yearly receipt has
 // independent mortality and discounting, and offsets tax/benefits/work costs.
 for(let year=0;year<x.earnYears;year++)add('Net workforce/recovery earnings year '+(year+1),households*x.workShare,x.earnings,x.workDelay+year,x.positiveIndependent,['workforce-current','income-cg'],'Small incremental employment-response prior across all new engagements; includes eligibility, other-provider substitution, tax/benefit and work-cost offsets. No published SACHR placement/wage effect.');
 const income=paths.reduce((sum,p)=>sum+incomeHealthyYearEquivalent(p),0),q=x.g*health+income,cost=x.G+E*x.external;
 return {x,E,households,mortality,morbidity,harm,allPopulationQalys:health,editionQalys:x.g*health,income,total:q,cost,price:q>0?10*cost/q:null,incomePathways:paths};
}
export const definitions=[
 ['central','Conditional integrated care and net resources',{}],
 ['low','Small clinical response, weak funding and net resource costs',{f:.5,b:.1,a:.2,delta:.0005,T:3,p:.05,v:.01,buyer:.1,saving:20,unmet:.1,consumption:10,travel:25,missed:15,medicineShare:.2,medicine:40,workShare:.005,earnings:100}],
 ['high','Stronger additional engagement and useful household gains',{f:1,b:.5,a:.75,delta:.006,T:15,p:.2,v:.05,buyer:.3,saving:80,unmet:.3,consumption:40,travel:5,missed:0,workShare:.05,earnings:600,earnYears:2}],
 ['zero','No gift-induced expansion',{b:0}],
 ['adverse','No clinical change; extra burdens and no useful receipts',{delta:0,p:0,buyer:0,unmet:0,workShare:0,travel:40,missed:20,h:.005}],
 ['clinical-null','No mortality or morbidity benefit; signed resources remain',{delta:0,p:0}],
 ['complete-clinical-substitution','Alternative care removes clinical advantage; engagement costs remain',{a:0}],
 ['no-economic-gains','No useful food, consumption or workforce gain; costs remain',{buyer:0,unmet:0,workShare:0}],
 ['no-overlap-credit','All positive economic welfare overlaps clinical wellbeing',{positiveIndependent:0}],
 ['full-independent-resources','All positive household welfare independent of health',{positiveIndependent:1}],
 ['funding10','Only 10% funded scale response',{b:.1}],
 ['high-risk-mortality','8% high-risk baseline hazard',{mHigh:.08}],
 ['low-risk-mortality','2% high-risk baseline hazard',{mHigh:.02}],
 ['delayed','One-year engagement delay',{L:1,workDelay:2}],
 ['short-survival','Three-year survival valuation cap',{T:3}],
 ['no-mortality','No donor-caused survival effect',{delta:0}],
 ['no-morbidity','No additional clinical utility change',{p:0}],
 ['resource-companion','Selected unrecognized medication/volunteer/public resources',{external:2000}],
 ['low-household-baseline','10K annual household consumption-resource reference',{Y:10000}],
 ['negative-work','Net employment/disposable-pay effect negative',{earnings:-300}],
];
export function scenarios(){return definitions.map(([id,label,o])=>{const v=calculate(o);return {id,label,costUSD:v.cost,allPopulationQalys:v.allPopulationQalys,editionQalys:v.editionQalys,incomeUnknown:false,incomePathways:v.incomePathways,pricePer10Qalys:v.price,assumptions:JSON.stringify(v.x)+'; E='+v.E+'; mortality='+v.mortality+'; morbidity='+v.morbidity+'; harm='+v.harm+'; MSA income-equivalent='+v.income+'; unweighted judgment case, not confidence interval.'};});}
if(process.argv.includes('--test')){
 const c=calculate(),z=calculate({b:0}),d=calculate({G:20000});
 assert.equal(z.total,0);assert.equal(z.price,null);
 assert(Math.abs(c.price-d.price)<1e-6);assert(Math.abs(2*c.total-d.total)<1e-12);
 assert(calculate({delta:0}).mortality===0);
 assert(calculate({a:0}).mortality===0&&calculate({a:0}).morbidity===0);
 assert(calculate({delta:0,p:0,buyer:0,unmet:0,workShare:0}).total<0);
 assert(calculate({positiveIndependent:0}).income<0);
 assert(calculate({g:.5}).allPopulationQalys===c.allPopulationQalys);
 assert(Math.abs(calculate({g:.5}).total/c.total-.5/.98)<1e-12);
 assert(c.incomePathways.filter(p=>p.annualIncomeGainUSD<0).every(p=>p.independentShare===1));
 assert.throws(()=>calculate({Y:35,travel:10,missed:5,medicine:20}));
 assert.throws(()=>calculate({buyer:.8,unmet:.3}));
 assert.throws(()=>calculate({b:1.1}));
 assert.throws(()=>calculate({delta:.05,mHigh:.04}));
 assert.throws(()=>calculate({earnings:-20000}));
 assert.throws(()=>calculate({mHigh:NaN}));
 // Exact joint logarithm for a purchase-saving household: burden then receipt.
 assert(Math.abs(Math.log1p(-15/20000)+Math.log1p(40/19985)-Math.log1p(25/20000))<1e-14);
 assert(Math.abs(Math.log1p(-15/20000)+Math.log1p(40/19985)+Math.log1p(-20/20025)-Math.log1p(5/20000))<1e-14);
 for(const s of scenarios()){assert(Number.isFinite(s.editionQalys));assert(s.incomePathways.every(p=>Number.isFinite(incomeHealthyYearEquivalent(p))));}
 console.log(JSON.stringify({tests:'PASS: cost scaling, zero funding, signed null/adverse, substitution, positive overlap, geography once, joint cash ledger and invalid-domain rejection',central:c,scenarios:scenarios().map(s=>({id:s.id,price:s.pricePer10Qalys,health:s.editionQalys,income:s.incomePathways.reduce((t,p)=>t+incomeHealthyYearEquivalent(p),0)}))},null,2));
}

