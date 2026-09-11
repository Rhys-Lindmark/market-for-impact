export const modelVersion='marin-county-bicycle-coalition-whole-gift-finite-v1';
export const anchors=Object.freeze({ein:'68-0419394',wholeExpense:1425170,fiscalEnd:'2025-06-30',coryParticipantsFloor:60,conceptMiles:1.6});
// Locked before first evaluation. All outcome/causal coefficients are judgments, not observed corridor risks.
const central={fatalPerYear:.1,fatalQ:10,seriousPerYear:.5,seriousQ:2,safetyReduction:.2,exposureYears:3,delayYears:4,discount:.03,contribution:.25,realization:.5,youthScale:1,additionalActive:.3,activityAlternative:.5,activityUtility:.01,activityYears:.5,activityNonOverlap:.8,funding:.5,bay:.98,harmQ:.1};
export const scenarios=Object.freeze([
 {id:'funding-null',weight:.2,...central,funding:0},
 {id:'health-null',weight:.2,...central,safetyReduction:0,activityUtility:0,harmQ:0},
 {id:'harm',weight:.1,...central,safetyReduction:0,activityUtility:0,harmQ:1},
 {id:'cautious',weight:.2,...central,fatalPerYear:.03,seriousPerYear:.2,fatalQ:5,seriousQ:.5,safetyReduction:.1,exposureYears:1,delayYears:6,contribution:.1,realization:.25,youthScale:.5,additionalActive:.1,activityAlternative:.3,activityUtility:.003,activityYears:.25,activityNonOverlap:.5,funding:.25,harmQ:.05},
 {id:'central',weight:.2,...central},
 {id:'favorable',weight:.1,...central,fatalPerYear:.2,seriousPerYear:2,fatalQ:15,seriousQ:3,safetyReduction:.4,exposureYears:5,delayYears:2,contribution:.5,realization:.8,youthScale:2,additionalActive:.7,activityAlternative:.8,activityUtility:.03,activityYears:1,activityNonOverlap:.8,funding:.8,harmQ:1}
].map(Object.freeze));
const bounds={weight:[0,1],fatalPerYear:[0,2],fatalQ:[0,30],seriousPerYear:[0,20],seriousQ:[0,10],safetyReduction:[-1,1],exposureYears:[0,10],delayYears:[0,15],discount:[0,.2],contribution:[0,1],realization:[0,1],youthScale:[0,3],additionalActive:[0,1],activityAlternative:[0,1],activityUtility:[-.1,.1],activityYears:[0,2],activityNonOverlap:[0,1],funding:[0,1],bay:[0,1],harmQ:[0,1000]};
const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const number=(x,a,b,k)=>{if(typeof x!=='number'||!Number.isFinite(x)||x<a||x>b)throw new RangeError(k);};
const price=(c,q)=>{if(q<=0)return null;const p=10*c/q;if(!Number.isFinite(p))throw new RangeError('price overflow');return p;};
export function discountedYears(years,delay,rate){number(years,0,10,'years');number(delay,0,15,'delay');number(rate,0,.2,'rate');return rate===0?years:Math.exp(-Math.log1p(rate)*delay)*(-Math.expm1(-Math.log1p(rate)*years))/Math.log1p(rate);}
export function calculate(options={}){
 if(!object(options))throw new TypeError('options');
 const{gift=10000,wholeExpense=anchors.wholeExpense,worlds=scenarios}=options;
 number(gift,0,10000,'gift');number(wholeExpense,1,1e9,'wholeExpense');
 if(!Array.isArray(worlds)||!worlds.length||worlds.length>100)throw new TypeError('worlds');
 const ids=new Set();let mass=0;
 const results=worlds.map(s=>{
  if(!object(s)||typeof s.id!=='string'||!s.id.trim()||ids.has(s.id.trim()))throw new TypeError('world identity');ids.add(s.id.trim());
  for(const[k,[lo,hi]]of Object.entries(bounds))number(s[k],lo,hi,k);mass+=s.weight;
  const baselineAnnualInjuryQ=s.fatalPerYear*s.fatalQ+s.seriousPerYear*s.seriousQ;
  const effectiveYears=discountedYears(s.exposureYears,s.delayYears,s.discount);
  const roadQ=baselineAnnualInjuryQ*s.safetyReduction*effectiveYears*s.contribution*s.realization;
  const modeledYouth=anchors.coryParticipantsFloor*s.youthScale;
  const additionalActiveYouth=modeledYouth*s.additionalActive*s.activityAlternative;
  const activityQ=additionalActiveYouth*s.activityUtility*s.activityYears*s.activityNonOverlap;
  const annualBudgetQ=(roadQ+activityQ-s.harmQ)*s.funding,annualBudgetBayQ=annualBudgetQ*s.bay;
  return{id:s.id,weight:s.weight,baselineAnnualInjuryQ,effectiveYears,roadQ,modeledYouth,additionalActiveYouth,activityQ,harmQ:s.harmQ,annualBudgetQ,annualBudgetBayQ,giftBayQ:annualBudgetBayQ*gift/wholeExpense,bayCostPer10:price(wholeExpense,annualBudgetBayQ)};
 });
 if(Math.abs(mass-1)>1e-10)throw new RangeError('weights sum');
 const weightedQ=results.reduce((a,r)=>a+r.weight*r.annualBudgetQ,0),weightedBayQ=results.reduce((a,r)=>a+r.weight*r.annualBudgetBayQ,0),fav=results.find(r=>r.id==='favorable');
 const result={modelVersion,gift,wholeExpense,results,weightedQ,weightedBayQ,weightedGiftBayQ:weightedBayQ*gift/wholeExpense,bayCostPer10:price(wholeExpense,weightedBayQ),allCostPer10:price(wholeExpense,weightedQ),favorableShare:weightedBayQ>0&&fav?fav.weight*fav.annualBudgetBayQ/weightedBayQ:null,probabilityBelow1M:results.reduce((a,r)=>a+(r.bayCostPer10!==null&&r.bayCostPer10<1e6?r.weight:0),0),completeResourceCostPer10:null};
 const finite=x=>{if(typeof x==='number'&&!Number.isFinite(x))throw new RangeError('derived overflow');if(object(x)||Array.isArray(x))Object.values(x).forEach(finite);};finite(result);return result;
}
