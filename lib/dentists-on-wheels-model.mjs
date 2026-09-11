export const modelVersion='dentists-on-wheels-whole-gift-symptomatic-health-v1';
export const anchors=Object.freeze({expense:103749,year:2024,patients:249,procedures:512,extractions:179,fillings:228,rootCanals:14,crownsBridges:50,dentures:41,revenue:196470,governmentGrants:30980,unrestrictedNetAssets:729582,cash:229364,savings:500218,volunteerHours:10685,reportedServiceFeeValue:621424});
const c={unique:.9,symptomatic:.6,relief:.85,utility:.05,years:.25,funding:.3,bay:.98,harm:.0002};
export const scenarios=Object.freeze([
 {id:'funding_null',weight:.2,...c,funding:0},{id:'clinical_null',weight:.15,...c,relief:0,harm:0},{id:'harm',weight:.05,...c,relief:0,harm:.003},
 {id:'cautious',weight:.25,unique:.75,symptomatic:.3,relief:.6,utility:.025,years:.05,funding:.1,bay:.95,harm:.0005},
 {id:'central',weight:.25,...c},
 {id:'favorable',weight:.1,unique:1,symptomatic:.8,relief:.95,utility:.1,years:.5,funding:.6,bay:1,harm:.0001}
].map(Object.freeze));
function finite(x,lo,hi,k){if(typeof x!=='number'||!Number.isFinite(x)||x<lo||x>hi)throw new RangeError(k)}
function price(g,q){const p=q>0?10*g/q:null;if(p!==null&&!Number.isFinite(p))throw new RangeError('price overflow');return p}
export function calculate(options={}){
 if(!options||typeof options!=='object'||Array.isArray(options))throw new TypeError('options');const{gift=10000,expense=anchors.expense,patients=anchors.patients,worlds=scenarios}=options;
 finite(gift,0,10000,'gift cap');finite(expense,Number.MIN_VALUE,Number.MAX_VALUE,'expense');finite(patients,0,10000,'patients');
 if(!Array.isArray(worlds)||!worlds.length)throw new TypeError('worlds');const ids=new Set();let mass=0;
 for(const s of worlds){if(!s||typeof s!=='object'||Array.isArray(s)||typeof s.id!=='string'||!s.id.trim()||ids.has(s.id))throw new TypeError('world identity');ids.add(s.id);for(const k of['weight','unique','symptomatic','relief','utility','funding','bay'])finite(s[k],0,1,k);finite(s.years,0,.5,'years');finite(s.harm,0,.1,'harm');mass+=s.weight}if(Math.abs(mass-1)>1e-10)throw new RangeError('weight sum');
 const rows=worlds.map(s=>{const patientEquivalent=gift/expense*patients,additionalPatients=patientEquivalent*s.funding,grossQ=additionalPatients*s.unique*s.symptomatic*s.relief*s.utility*s.years,harmQ=additionalPatients*s.harm,allQ=grossQ-harmQ,bayQ=allQ*s.bay;for(const x of[patientEquivalent,additionalPatients,grossQ,harmQ,allQ,bayQ])if(!Number.isFinite(x))throw new RangeError('derived overflow');return{...s,patientEquivalent,additionalPatients,grossQ,harmQ,allQ,bayQ,bayCostPer10:price(gift,bayQ)}});
 const bayQ=rows.reduce((a,s)=>a+s.weight*s.bayQ,0),allQ=rows.reduce((a,s)=>a+s.weight*s.allQ,0);if(!Number.isFinite(bayQ)||!Number.isFinite(allQ))throw new RangeError('aggregate overflow');const f=rows.find(s=>s.id==='favorable'),other=rows.filter(s=>s.id!=='favorable'),massOther=other.reduce((a,s)=>a+s.weight,0),ex=massOther?other.reduce((a,s)=>a+s.weight*s.bayQ,0)/massOther:0;
 return{modelVersion,anchors,gift,expense,patients,rows,bayQ,allQ,bayCostPer10:price(gift,bayQ),allCostPer10:price(gift,allQ),favorableShareOfSignedQ:bayQ>0&&f?f.weight*f.bayQ/bayQ:null,withoutFavorableBayCostPer10:price(gift,ex),subjectiveMassBelow1m:rows.reduce((a,s)=>a+(s.bayCostPer10!==null&&s.bayCostPer10<1e6?s.weight:0),0),subjectiveMassBelow100k:rows.reduce((a,s)=>a+(s.bayCostPer10!==null&&s.bayCostPer10<1e5?s.weight:0),0),completeResourceCostPer10:null,verifiedMarginalCostPer10:null};
}
