// Berkeley NEED: whole-cost, partial-health, distribution-to-unique-cohort v1.
// Survival integral adapted from the accepted HEPPAC unique-cohort helper.
// No HEPPAC event counts, selected-rescuer risks, or calibrated defaults copied.
export const modelVersion='berkeley-need-whole-gift-unique-cohort-v1';
export const anchors=Object.freeze({wholeExpense:357858,historicalKits:2135,kitYear:2022,expenseYearEnd:'2025-06-30'});
const base={kitScale:1,exposureShare:.6,kitsPerPerson:3,opportunities:.2,otherwiseFatal:.1,baselineRescue:.65,rescueIncrement:.1,otherHazard:.04,postHazard:.06,activeYears:1,horizon:10,utility:.7,discount:.03,funding:.5,bayShare:.95,harmPerPerson:.0002};
export const scenarios=Object.freeze([
 {id:'funding-null',weight:.25,...base,funding:0,harmPerPerson:0},
 {id:'harm',weight:.1,...base,rescueIncrement:0,harmPerPerson:.002},
 {id:'cautious',weight:.25,...base,kitScale:.5,exposureShare:.4,kitsPerPerson:5,opportunities:.1,otherwiseFatal:.05,baselineRescue:.8,rescueIncrement:.03,otherHazard:.07,postHazard:.1,horizon:5,utility:.6,funding:.25,bayShare:.9,harmPerPerson:.0001},
 {id:'central',weight:.3,...base},
 {id:'favorable',weight:.1,...base,kitScale:1.5,exposureShare:.8,kitsPerPerson:2,opportunities:.3,otherwiseFatal:.15,baselineRescue:.6,rescueIncrement:.2,otherHazard:.03,postHazard:.04,horizon:15,utility:.75,funding:.75,bayShare:.99}
].map(Object.freeze));
const limits={weight:[0,1],kitScale:[0,3],exposureShare:[0,1],kitsPerPerson:[1,100],opportunities:[0,2],otherwiseFatal:[0,1],baselineRescue:[0,1],rescueIncrement:[-1,1],otherHazard:[0,1],postHazard:[0,1],activeYears:[0,3],horizon:[0,20],utility:[0,1],discount:[0,1],funding:[0,1],bayShare:[0,1],harmPerPerson:[0,.1]};
const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const number=(v,lo,hi,key)=>{if(typeof v!=='number'||!Number.isFinite(v)||v<lo||v>hi)throw new RangeError(key);};
const integral=(h,t)=>h===0?t:-Math.expm1(-h*t)/h;
const price=(cost,q)=>{if(q<=0)return null;const p=10*cost/q;if(!Number.isFinite(p))throw new RangeError('nonfinite price');return p;};
export function calculate(options={}){
 if(!object(options))throw new TypeError('options object required');
 const{gift=10000,wholeExpense=anchors.wholeExpense,historicalKits=anchors.historicalKits,worlds=scenarios}=options;
 number(gift,0,10000,'gift');number(wholeExpense,1,1e9,'wholeExpense');number(historicalKits,0,1e6,'historicalKits');
 if(!Array.isArray(worlds)||!worlds.length||worlds.length>100)throw new TypeError('worlds');
 const ids=new Set();let weights=0;
 const results=worlds.map(s=>{
  if(!object(s)||typeof s.id!=='string'||!s.id.trim()||ids.has(s.id))throw new TypeError('unique nonblank world id');ids.add(s.id);
  for(const[k,[lo,hi]]of Object.entries(limits))number(s[k],lo,hi,k);
  if(s.baselineRescue+s.rescueIncrement<0||s.baselineRescue+s.rescueIncrement>1||s.activeYears>s.horizon)throw new RangeError('rescue or horizon consistency');
  weights+=s.weight;
  const uniquePeople=historicalKits*s.kitScale*s.exposureShare/s.kitsPerPerson;
  const lethalHazard=s.opportunities*s.otherwiseFatal;
  const baseHazard=s.otherHazard+lethalHazard*(1-s.baselineRescue);
  const supportedHazard=s.otherHazard+lethalHazard*(1-s.baselineRescue-s.rescueIncrement);
  const d=Math.log1p(s.discount),t=s.activeYears;
  const active=integral(supportedHazard+d,t)-integral(baseHazard+d,t);
  const gap=Math.exp(-supportedHazard*t)-Math.exp(-baseHazard*t);
  const tail=gap*Math.exp(-d*t)*integral(s.postHazard+d,s.horizon-t);
  const qPerPerson=s.utility*(active+tail);
  const maxPerPerson=s.utility*integral(d,s.horizon);
  if(Math.abs(qPerPerson)>maxPerPerson+1e-10)throw new RangeError('finite person-time bound');
  const naloxoneQ=uniquePeople*qPerPerson;
  const independentHarmQ=uniquePeople*s.harmPerPerson;
  const annualQ=(naloxoneQ-independentHarmQ)*s.funding;
  const annualBayQ=annualQ*s.bayShare;
  const giftQ=annualQ*gift/wholeExpense,giftBayQ=annualBayQ*gift/wholeExpense;
  return{id:s.id,weight:s.weight,uniquePeople,baseHazard,supportedHazard,qPerPerson,maxPerPerson,naloxoneQ,independentHarmQ,annualQ,annualBayQ,giftQ,giftBayQ,bayCostPer10:price(wholeExpense,annualBayQ)};
 });
 if(Math.abs(weights-1)>1e-10)throw new RangeError('weights must sum to one');
 const weightedAnnualBayQ=results.reduce((v,r)=>v+r.weight*r.annualBayQ,0);
 const weightedAnnualQ=results.reduce((v,r)=>v+r.weight*r.annualQ,0);
 const favorable=results.find(r=>r.id==='favorable');
 const result={modelVersion,gift,wholeExpense,historicalKits,results,weightedAnnualBayQ,weightedAnnualQ,weightedGiftBayQ:weightedAnnualBayQ*gift/wholeExpense,bayCostPer10:price(wholeExpense,weightedAnnualBayQ),allCostPer10:price(wholeExpense,weightedAnnualQ),favorableShare:weightedAnnualBayQ>0&&favorable?favorable.weight*favorable.annualBayQ/weightedAnnualBayQ:null,probabilityBelow1M:results.reduce((v,r)=>v+(r.bayCostPer10!==null&&r.bayCostPer10<1e6?r.weight:0),0),probabilityBelow100K:results.reduce((v,r)=>v+(r.bayCostPer10!==null&&r.bayCostPer10<1e5?r.weight:0),0),grossResourceCostPer10:null};
 const check=x=>{if(typeof x==='number'&&!Number.isFinite(x))throw new RangeError('nonfinite result');if(object(x)||Array.isArray(x))Object.values(x).forEach(check);};check(result);return result;
}
