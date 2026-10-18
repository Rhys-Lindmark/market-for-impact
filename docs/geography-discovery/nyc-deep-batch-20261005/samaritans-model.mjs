import assert from 'node:assert/strict';
import {incomeHealthyYearEquivalent} from '../../../lib/income-health-equivalence.mjs';
export const base={G:10000,C:1288400,N:29129,f:.8,b:.4,episode:.2,a:.3,s:.25,R:.002,e:.1,u:.8,m:.02,T:20,L:1/365,r:.03,g:.8,p:.25,v:.05,days:14,h:.00001,households:.7,Y:25000,phone:.25,careShare:.02,careCost:20,workShare:.02,netPay:30,positiveIndependent:.5,external:0};
export function calculate(o={}){
 const x={...base,...o};assert(Object.values(x).every(Number.isFinite));
 for(const n of ['f','b','episode','a','s','R','e','u','g','p','households','careShare','workShare','positiveIndependent'])assert(x[n]>=0&&x[n]<=1,'Invalid share '+n);
 for(const n of ['m','L','r','v','days','h','phone','careCost','external'])assert(x[n]>=0,'Invalid nonnegative '+n);
 assert(x.G>0&&x.C>0&&x.N>0&&x.Y>x.phone+x.careCost&&x.Y+x.netPay>0&&x.T>0);
 const k=Math.log1p(x.r),F=(q,t)=>Math.abs(q)<1e-12?t:-Math.expm1(-q*t)/q;
 const calls=x.G*x.b*x.N*x.f/x.C,E=calls*x.episode,B=E*x.a;
 // R is the cumulative acute fatal risk in the baseline episode, not an annual hazard.
 const alive=Math.exp(-x.m*x.L),mortality=B*x.s*x.R*x.e*alive*Math.exp(-k*x.L)*x.u*F(x.m+k,x.T);
 const commonAlive=(1-x.s*x.R)*alive;
 const morbidity=B*commonAlive*x.p*x.v*Math.exp(-k*x.L)*F(x.m+k,x.days/365);
 const harm=E*x.h*alive*Math.exp(-k*x.L),health=mortality+morbidity-harm;
 const paths=[],households=E*x.households,receipt=x.L+x.days/365;
 const add=(label,people,gain,baseline,rationale)=>{if(people>0&&gain!==0)paths.push({label,people,annualIncomeBeforeUSD:baseline,annualIncomeGainUSD:gain,years:1,causalShare:(1-x.s*x.R)*Math.exp(-x.m*receipt),editionShare:x.g,independentShare:gain>0?x.positiveIndependent:1,delayYears:receipt,discountRate:x.r,sourceIds:['crisis','988','income-cg'],rationale,counterfactual:'Existing free NYC988, other support, insured care and paid leave continue. Actual net disposable-resource differential, baseline-alive households only.'});};
 add('Net additional provider phone charges',households,-x.phone,x.Y,'One-off actual cash fee difference, not time; prepaid/free calling alternatives already reflected by small prior.');
 // Nested referral and net-pay groups preserve exact joint resource logs even if overlapping.
 for(const [stratum,share,care]of[['care',x.careShare,x.careCost],['no-care',1-x.careShare,0]]){
  add('Net care copay/transport burden: '+stratum,households*share,-care,x.Y-x.phone,'Net additional uncovered care spending after covered and counterfactual care; unmeasured incidence prior.');
  add('Avoided lost disposable pay: '+stratum,households*share*x.workShare,x.netPay,x.Y-x.phone-care,'Once-only actual after-tax/benefit/paid-leave pay differential among common-alive households; not caller time monetization, ongoing survivor earnings or gross wages.');
 }
 const income=paths.reduce((t,p)=>t+incomeHealthyYearEquivalent(p),0),total=x.g*health+income,cost=x.G+E*x.external;
 return {x,calls,E,B,households,mortality,morbidity,harm,allPopulationQalys:health,editionQalys:x.g*health,income,total,cost,price:total>0?10*cost/total:null,incomePathways:paths};
}
export const definitions=[['central','Conditional hotline and signed household resources',{}],['low','Weak additional response and greater cash burden',{b:.15,a:.1,e:.02,p:.1,v:.02,T:5,phone:1,careShare:.05,careCost:40,workShare:0}],['high','Stronger response and avoided net pay',{b:.6,a:.6,e:.2,p:.4,v:.08,T:25,phone:0,careShare:.01,workShare:.05,netPay:60}],['zero','No gift-induced expansion',{b:0}],['adverse','No benefit; health and cash burdens remain',{e:0,p:0,workShare:0,h:.002,phone:2,careShare:.1,careCost:50}],['clinical-null','No clinical effect; signed resource effects remain',{e:0,p:0}],['full-clinical-substitution','Existing services remove clinical advantage',{a:0}],['no-mortality','No additional deaths averted',{e:0}],['no-morbidity','No additional distress utility improvement',{p:0}],['no-resource-gain','No avoided lost pay',{workShare:0}],['no-economic-overlap-credit','Positive resource welfare entirely overlaps health',{positiveIndependent:0}],['full-independent-resources','Positive cash effect entirely independent',{positiveIndependent:1}],['repeated-callers','Ten contacts per independent crisis',{episode:.1}],['current-half-scale','Historical reach transfers at half scale',{f:.5}],['short-survival','Five-year finite survival tail',{T:5}],['delay','Thirty-day response delay',{L:30/365}],['low-risk','Lower acute episode fatal risk',{R:.0005}],['negative-pay','Referral/engagement reduces net disposable pay',{netPay:-30}],['external-resource-companion','Selected unrecognized volunteer/public resources',{external:100}],['low-household-baseline','Lower household resource reference',{Y:10000}]];
export function scenarios(){return definitions.map(([id,label,o])=>{const c=calculate(o);return {id,label,costUSD:c.cost,allPopulationQalys:c.allPopulationQalys,editionQalys:c.editionQalys,incomeUnknown:false,incomePathways:c.incomePathways,pricePer10Qalys:c.price,assumptions:JSON.stringify(c.x)+'; calls='+c.calls+'; independent episodes='+c.E+'; mortality='+c.mortality+'; morbidity='+c.morbidity+'; harm='+c.harm+'; MSA income equivalent='+c.income+'; unweighted judgment sensitivity, not confidence interval.'};});}
if(process.argv.includes('--test')){
 const c=calculate(),d=calculate({G:20000});assert(Math.abs(c.price-d.price)<1e-7);assert.equal(calculate({b:0}).total,0);assert.equal(calculate({b:0}).price,null);assert.equal(calculate({e:0}).mortality,0);assert.equal(calculate({p:0}).morbidity,0);assert(calculate({e:0,p:0,workShare:0}).total<0);assert(calculate({netPay:-30}).income<0);assert(calculate({positiveIndependent:0}).income<0);assert(c.incomePathways.filter(p=>p.annualIncomeGainUSD<0).every(p=>p.independentShare===1));
 for(const o of [{b:1.1},{R:-.1},{Y:20,phone:1,careCost:20},{netPay:-25000},{C:0},{N:NaN},{days:-1},{workShare:2}])assert.throws(()=>calculate(o));
 assert(Math.abs(Math.log1p(-.25/25000)+Math.log1p(-20/24999.75)+Math.log1p(30/24979.75)-Math.log1p(9.75/25000))<1e-14);
 for(const s of scenarios())assert(Number.isFinite(s.editionQalys)&&s.incomePathways.every(p=>Number.isFinite(incomeHealthyYearEquivalent(p))));
 console.log(JSON.stringify({status:'PASS',checks:'20 scenarios; zero, scaling, negative/null, positive overlap, exact nested cash ledger and impossible input rejection',central:c,scenarios:scenarios().map(s=>({id:s.id,health:s.editionQalys,income:s.incomePathways.reduce((t,p)=>t+incomeHealthyYearEquivalent(p),0),price:s.pricePer10Qalys}))},null,2));
}

