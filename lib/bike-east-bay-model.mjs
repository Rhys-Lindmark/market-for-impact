export const modelVersion='bike-east-bay-whole-gift-finite-v1';
export const anchors=Object.freeze({ein:'94-2585652',fiscalEnd:'2024-12-31',expense:1897776,eventCost:7478,inventoryCost:3141,wholeExpense:1908395,historicalDeaths:6,historicalSevereInjuries:35,observationYears:5,classParticipants:1158});
// Priors declared before first execution; observed injury series is not the unmodified future baseline.
const c={riskScale:1,residual:.75,fatalQ:10,seriousQ:2,reduction:.2,years:3,lag:4,contribution:.1,realization:.5,participantScale:1,extraCycling:.1,extraActivity:.3,utility:.005,activityYears:.5,nonOverlap:.8,funding:.4,bay:.98,harm:.1};
export const scenarios=Object.freeze([
 {id:'funding-null',weight:.2,...c,funding:0},
 {id:'health-null',weight:.2,...c,reduction:0,utility:0,harm:0},
 {id:'harm',weight:.1,...c,reduction:0,utility:0,harm:1},
 {id:'cautious',weight:.2,...c,riskScale:.5,residual:.5,fatalQ:5,seriousQ:.5,reduction:.1,years:1,lag:6,contribution:.03,realization:.25,participantScale:.75,extraCycling:.03,extraActivity:.2,utility:.002,activityYears:.25,nonOverlap:.5,funding:.2,harm:.05},
 {id:'central',weight:.2,...c},
 {id:'favorable',weight:.1,...c,residual:.9,fatalQ:15,seriousQ:3,reduction:.4,years:5,lag:2,contribution:.25,realization:.8,participantScale:1.2,extraCycling:.3,extraActivity:.5,utility:.02,activityYears:1,nonOverlap:.8,funding:.7,harm:1}
].map(Object.freeze));
const bounds={weight:[0,1],riskScale:[0,3],residual:[0,1],fatalQ:[0,30],seriousQ:[0,10],reduction:[-1,1],years:[0,10],lag:[0,15],contribution:[0,1],realization:[0,1],participantScale:[0,3],extraCycling:[0,1],extraActivity:[0,1],utility:[-.1,.1],activityYears:[0,2],nonOverlap:[0,1],funding:[0,1],bay:[0,1],harm:[0,1000]};
const obj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const num=(x,a,b,k)=>{if(typeof x!=='number'||!Number.isFinite(x)||x<a||x>b)throw new RangeError(k);};
const price=(c,q)=>{if(q<=0)return null;const p=10*c/q;if(!Number.isFinite(p))throw new RangeError('price');return p;};
export const discountedYears=(years,lag)=>{num(years,0,10,'years');num(lag,0,15,'lag');const d=Math.log1p(.03);return Math.exp(-d*lag)*(-Math.expm1(-d*years))/d;};
export function calculate(options={}){
 if(!obj(options))throw new TypeError('options');const{gift=10000,wholeExpense=anchors.wholeExpense,worlds=scenarios}=options;num(gift,0,10000,'gift');num(wholeExpense,1,1e9,'expense');
 if(!Array.isArray(worlds)||!worlds.length||worlds.length>100)throw new TypeError('worlds');let mass=0;const ids=new Set();
 const results=worlds.map(s=>{if(!obj(s)||typeof s.id!=='string'||!s.id.trim()||ids.has(s.id.trim()))throw new TypeError('id');ids.add(s.id.trim());for(const[k,[a,b]]of Object.entries(bounds))num(s[k],a,b,k);mass+=s.weight;
  const residualAnnualDeaths=anchors.historicalDeaths/anchors.observationYears*s.riskScale*s.residual,residualAnnualSevere=anchors.historicalSevereInjuries/anchors.observationYears*s.riskScale*s.residual;
  const exposureYears=discountedYears(s.years,s.lag),roadQ=(residualAnnualDeaths*s.fatalQ+residualAnnualSevere*s.seriousQ)*s.reduction*exposureYears*s.contribution*s.realization;
  const participantEquivalents=anchors.classParticipants*s.participantScale,additionalActive=participantEquivalents*s.extraCycling*s.extraActivity,activityQ=additionalActive*s.utility*s.activityYears*s.nonOverlap;
  const budgetQ=(roadQ+activityQ-s.harm)*s.funding,budgetBayQ=budgetQ*s.bay;
  return{id:s.id,weight:s.weight,residualAnnualDeaths,residualAnnualSevere,exposureYears,roadQ,participantEquivalents,additionalActive,activityQ,harm:s.harm,budgetQ,budgetBayQ,giftBayQ:budgetBayQ*gift/wholeExpense,bayCostPer10:price(wholeExpense,budgetBayQ)};});
 if(Math.abs(mass-1)>1e-10)throw new RangeError('weights');const weightedQ=results.reduce((v,r)=>v+r.weight*r.budgetQ,0),weightedBayQ=results.reduce((v,r)=>v+r.weight*r.budgetBayQ,0),fav=results.find(r=>r.id==='favorable');
 const r={modelVersion,gift,wholeExpense,results,weightedQ,weightedBayQ,weightedGiftBayQ:weightedBayQ*gift/wholeExpense,bayCostPer10:price(wholeExpense,weightedBayQ),allCostPer10:price(wholeExpense,weightedQ),favorableShare:weightedBayQ>0&&fav?fav.weight*fav.budgetBayQ/weightedBayQ:null,probabilityBelow1M:results.reduce((v,r)=>v+(r.bayCostPer10!==null&&r.bayCostPer10<1e6?r.weight:0),0),completeResourceCostPer10:null};
 const check=x=>{if(typeof x==='number'&&!Number.isFinite(x))throw new RangeError('nonfinite output');if(obj(x)||Array.isArray(x))Object.values(x).forEach(check);};check(r);return r;
}
