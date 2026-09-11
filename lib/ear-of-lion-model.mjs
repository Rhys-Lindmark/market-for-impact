// Whole historical donor-cost proxy, partial hearing-aid health. No verified marginal offer.
export const modelVersion='ear-of-lion-whole-gift-partial-hearing-v1';
export const anchors=Object.freeze({expense:101368,financialYear:2024,revenue:61502,patientLoanFees:22524,currentPatientFeePerAid:150,netAssets:592022,unrestrictedNetAssets:142237,restrictedNetAssets:449785,cash:24609});
const c={courses:100,utility:.12,transfer:.5,completion:.8,years:.5,funding:.5,bay:.2,harm:.0005};
export const scenarios=Object.freeze([
 {id:'funding_null',weight:.2,...c,funding:0},
 {id:'clinical_null',weight:.2,...c,transfer:0,harm:0},
 {id:'harm',weight:.1,...c,transfer:0,harm:.003},
 {id:'cautious',weight:.2,...c,courses:60,transfer:.25,completion:.6,years:.25,funding:.25,bay:.1,harm:.001},
 {id:'central',weight:.2,...c},
 {id:'favorable',weight:.1,...c,courses:150,transfer:.75,completion:.9,years:2,funding:.75,bay:.4,harm:.0002}
].map(Object.freeze));
function finite(v,min,max,key){if(typeof v!=='number'||!Number.isFinite(v)||v<min||v>max)throw new RangeError(key);}
function price(g,q){const p=q>0?10*g/q:null;if(p!==null&&!Number.isFinite(p))throw new RangeError('price overflow');return p;}
export function calculate({gift=10000,expense=anchors.expense,worlds=scenarios}={}){
 finite(gift,0,10000,'gift: diagnostic domain only');finite(expense,Number.MIN_VALUE,Number.MAX_VALUE,'expense');
 if(!Array.isArray(worlds)||!worlds.length)throw new TypeError('worlds');
 const ids=new Set();let mass=0;
 for(const s of worlds){if(!s||typeof s!=='object'||Array.isArray(s)||typeof s.id!=='string'||!s.id.trim()||ids.has(s.id))throw new TypeError('world identity');ids.add(s.id);
  for(const k of ['weight','utility','transfer','completion','funding','bay'])finite(s[k],0,1,k);
  finite(s.courses,0,1000,'courses diagnostic bound');finite(s.years,0,2,'finite effective years');finite(s.harm,0,.1,'harm');mass+=s.weight;}
 if(Math.abs(mass-1)>1e-10)throw new RangeError('weight sum');
 const rows=worlds.map(s=>{const courseEquivalent=gift/expense*s.courses,additionalCourses=courseEquivalent*s.funding;
  const grossQ=additionalCourses*s.utility*s.transfer*s.completion*s.years,harmQ=additionalCourses*s.harm;
  const allQ=grossQ-harmQ,bayQ=allQ*s.bay;
  for(const v of [courseEquivalent,additionalCourses,grossQ,harmQ,allQ,bayQ])if(!Number.isFinite(v))throw new RangeError('derived overflow');
  return {...s,courseEquivalent,additionalCourses,grossQ,harmQ,allQ,bayQ,bayCostPer10:price(gift,bayQ),allCostPer10:price(gift,allQ)};});
 const bayQ=rows.reduce((a,s)=>a+s.weight*s.bayQ,0),allQ=rows.reduce((a,s)=>a+s.weight*s.allQ,0);
 if(!Number.isFinite(bayQ)||!Number.isFinite(allQ))throw new RangeError('aggregate overflow');
 const favorable=rows.find(s=>s.id==='favorable');
 const retained=rows.filter(s=>s.id!=='favorable'),retainedMass=retained.reduce((a,s)=>a+s.weight,0);
 const exTailQ=retainedMass?retained.reduce((a,s)=>a+s.weight*s.bayQ,0)/retainedMass:0;
 return {modelVersion,gift,expense,anchors,rows,bayQ,allQ,bayCostPer10:price(gift,bayQ),allCostPer10:price(gift,allQ),favorableShareOfSignedQ:bayQ>0&&favorable?favorable.weight*favorable.bayQ/bayQ:null,withoutFavorableBayCostPer10:price(gift,exTailQ),subjectiveMassBelow1m:rows.reduce((a,s)=>a+(s.bayCostPer10!==null&&s.bayCostPer10<1e6?s.weight:0),0),subjectiveMassBelow100k:rows.reduce((a,s)=>a+(s.bayCostPer10!==null&&s.bayCostPer10<1e5?s.weight:0),0),verifiedMarginalCostPer10:null,completeResourceCostPer10:null};
}
