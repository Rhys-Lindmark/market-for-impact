export const modelVersion='pacific-hearing-connection-whole-gift-partial-hearing-v1';
export const anchors=Object.freeze({expense:184099,year:2024,revenue:156127,netAssets:241791,cashSavingsInvestments:163983,programRevenue:15604,inventoryAdjustment:45900});
const c={courses:75,utility:.12,transfer:.5,completion:.8,years:.5,funding:.5,bay:.95,harm:.0005};
export const scenarios=Object.freeze([
 {id:'funding_null',weight:.2,...c,funding:0},
 {id:'clinical_null',weight:.2,...c,transfer:0,harm:0},
 {id:'harm',weight:.1,...c,transfer:0,harm:.003},
 {id:'cautious',weight:.2,...c,courses:30,transfer:.25,completion:.6,years:.25,funding:.25,bay:.85,harm:.001},
 {id:'central',weight:.2,...c},
 {id:'favorable',weight:.1,...c,courses:150,transfer:.75,completion:.9,years:2,funding:.75,bay:.99,harm:.0002}
].map(Object.freeze));
function finite(x,lo,hi,key){if(typeof x!=='number'||!Number.isFinite(x)||x<lo||x>hi)throw new RangeError(key);}
function price(g,q){const p=q>0?10*g/q:null;if(p!==null&&!Number.isFinite(p))throw new RangeError('price overflow');return p;}
export function calculate(options={}){
 if(!options||typeof options!=='object'||Array.isArray(options))throw new TypeError('options');
 const{gift=10000,expense=anchors.expense,worlds=scenarios}=options;
 finite(gift,0,10000,'gift domain');finite(expense,Number.MIN_VALUE,Number.MAX_VALUE,'expense');
 if(!Array.isArray(worlds)||!worlds.length)throw new TypeError('worlds');let mass=0;const ids=new Set();
 for(const s of worlds){if(!s||typeof s!=='object'||Array.isArray(s)||typeof s.id!=='string'||!s.id.trim()||ids.has(s.id))throw new TypeError('world identity');ids.add(s.id);
  for(const k of['weight','utility','transfer','completion','funding','bay'])finite(s[k],0,1,k);
  finite(s.courses,0,1000,'courses');finite(s.years,0,2,'effective years');finite(s.harm,0,.1,'harm');mass+=s.weight;}
 if(Math.abs(mass-1)>1e-10)throw new RangeError('weight sum');
 const rows=worlds.map(s=>{const courseEquivalent=gift/expense*s.courses,additionalCourses=courseEquivalent*s.funding,grossQ=additionalCourses*s.utility*s.transfer*s.completion*s.years,harmQ=additionalCourses*s.harm,allQ=grossQ-harmQ,bayQ=allQ*s.bay;
  for(const x of[courseEquivalent,additionalCourses,grossQ,harmQ,allQ,bayQ])if(!Number.isFinite(x))throw new RangeError('derived overflow');
  return{...s,courseEquivalent,additionalCourses,grossQ,harmQ,allQ,bayQ,bayCostPer10:price(gift,bayQ),allCostPer10:price(gift,allQ)};});
 const bayQ=rows.reduce((a,s)=>a+s.weight*s.bayQ,0),allQ=rows.reduce((a,s)=>a+s.weight*s.allQ,0);if(!Number.isFinite(bayQ)||!Number.isFinite(allQ))throw new RangeError('aggregate overflow');
 const f=rows.find(s=>s.id==='favorable'),other=rows.filter(s=>s.id!=='favorable'),otherMass=other.reduce((a,s)=>a+s.weight,0),exTail=otherMass?other.reduce((a,s)=>a+s.weight*s.bayQ,0)/otherMass:0;
 return{modelVersion,gift,expense,anchors,rows,bayQ,allQ,bayCostPer10:price(gift,bayQ),allCostPer10:price(gift,allQ),favorableShareOfSignedQ:bayQ>0&&f?f.weight*f.bayQ/bayQ:null,withoutFavorableBayCostPer10:price(gift,exTail),subjectiveMassBelow1m:rows.reduce((a,s)=>a+(s.bayCostPer10!==null&&s.bayCostPer10<1e6?s.weight:0),0),subjectiveMassBelow100k:rows.reduce((a,s)=>a+(s.bayCostPer10!==null&&s.bayCostPer10<1e5?s.weight:0),0),verifiedMarginalCostPer10:null,completeResourceCostPer10:null};
}
