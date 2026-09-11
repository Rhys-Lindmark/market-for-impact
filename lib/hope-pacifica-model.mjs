export const modelVersion='hope-pacifica-whole-gift-v1';
export const anchors=Object.freeze({ein:'99-2104067',observedAnnualExpense:null,observedAnnualUniqueRiskPeople:null,observedAnnualRescues:null,cumulativeNarcanClaims:[3000,6000],listedSites:5,countyGrantMaximum:10000,grantEnd:'2026-06-30',reviewDate:'2026-09-11'});
export const costWorlds=Object.freeze([{id:'lean',expense:20000,weight:.2},{id:'central_cost',expense:40000,weight:.5},{id:'high_cost',expense:100000,weight:.3}].map(Object.freeze));
const central={packs:1500,ready:.5,repeats:3,riskNetwork:.8,baseHazard:.07,hazardGain:.002,postHazard:.07,horizon:10,utility:.65,funding:.5,bay:.95,harm:.00002};
export const deliveryWorlds=Object.freeze([{id:'funding_null',weight:.2,...central,funding:0},{id:'access_null',weight:.2,...central,hazardGain:0,harm:0},{id:'harm',weight:.1,...central,hazardGain:0,harm:.0005},{id:'cautious',weight:.2,packs:750,ready:.3,repeats:5,riskNetwork:.5,baseHazard:.1,hazardGain:.0005,postHazard:.1,horizon:5,utility:.6,funding:.2,bay:.9,harm:.00002},{id:'central',weight:.25,...central},{id:'favorable',weight:.05,packs:3000,ready:.8,repeats:3,riskNetwork:.75,baseHazard:.07,hazardGain:.004,postHazard:.07,horizon:10,utility:.7,funding:.7,bay:.98,harm:.00001}].map(Object.freeze));
const integral=(h,t)=>h===0?t:-Math.expm1(-h*t)/h;
function number(v,lo,hi,k){if(typeof v!=='number'||!Number.isFinite(v)||v<lo||v>hi)throw new RangeError(k);}
function finite(x){if(typeof x==='number'&&!Number.isFinite(x))throw new RangeError('nonfinite derived output');if(x&&typeof x==='object')Object.values(x).forEach(finite);}
function identities(rows){if(!Array.isArray(rows)||!rows.length)throw new TypeError('worlds');let mass=0;const ids=new Set();for(const s of rows){if(!s||typeof s!=='object'||Array.isArray(s)||typeof s.id!=='string'||!s.id.trim()||ids.has(s.id))throw new TypeError('world identity');ids.add(s.id);number(s.weight,0,1,'weight');mass+=s.weight;}if(Math.abs(mass-1)>1e-10)throw new RangeError('weight sum');}
const price=(gift,q)=>{const p=q>0?10*gift/q:null;finite(p);return p;};
export function calculate(options={}){
 if(!options||typeof options!=='object'||Array.isArray(options))throw new TypeError('options');
 const{gift=1000,costs=costWorlds,worlds=deliveryWorlds}=options;number(gift,0,1000,'gift');identities(costs);identities(worlds);
 for(const c of costs)number(c.expense,Number.MIN_VALUE,Number.MAX_VALUE,'expense');
 for(const s of worlds){for(const k of['ready','riskNetwork','utility','funding','bay'])number(s[k],0,1,k);number(s.packs,0,100000,'packs');number(s.repeats,1,10000,'repeats');number(s.baseHazard,0,5,'baseHazard');number(s.hazardGain,-1,1,'hazardGain');if(s.baseHazard-s.hazardGain<0)throw new RangeError('supported hazard');number(s.postHazard,0,5,'postHazard');number(s.horizon,1,20,'horizon');number(s.harm,0,.1,'harm');}
 const rows=costs.flatMap(c=>worlds.map(s=>{
  const discount=Math.log1p(.03),active=integral(s.baseHazard-s.hazardGain+discount,1)-integral(s.baseHazard+discount,1),gap=Math.exp(-(s.baseHazard-s.hazardGain))-Math.exp(-s.baseHazard),tail=gap*Math.exp(-discount)*integral(s.postHazard+discount,s.horizon-1);
  const qPerPerson=s.utility*(active+tail),riskPeople=s.packs*s.ready/s.repeats*s.riskNetwork,additionalPeople=gift/c.expense*riskPeople*s.funding,grossQ=additionalPeople*qPerPerson,harmQ=additionalPeople*s.harm,allQ=grossQ-harmQ,bayQ=allQ*s.bay;
  const bound=additionalPeople*s.utility*integral(discount,s.horizon);if(Math.abs(grossQ)>bound+1e-9)throw new RangeError('person time bound');
  const r={id:c.id+'__'+s.id,costId:c.id,deliveryId:s.id,weight:c.weight*s.weight,expense:c.expense,inputs:{...s},riskPeople,additionalPeople,activeSurvivalYears:active,postSupportSurvivalYears:tail,survivalGap:gap,qPerPerson,grossQ,harmQ,allQ,bayQ,bayCostPer10:price(gift,bayQ)};finite(r);return r;
 }));
 const allQ=rows.reduce((a,r)=>a+r.weight*r.allQ,0),bayQ=rows.reduce((a,r)=>a+r.weight*r.bayQ,0),fav=rows.filter(r=>r.deliveryId==='favorable').reduce((a,r)=>a+r.weight*r.bayQ,0),rest=rows.filter(r=>r.deliveryId!=='favorable'),mass=rest.reduce((a,r)=>a+r.weight,0),withoutQ=mass?rest.reduce((a,r)=>a+r.weight*r.bayQ,0)/mass:0;
 const result={modelVersion,anchors,gift,rows,allQ,bayQ,allCostPer10:price(gift,allQ),bayCostPer10:price(gift,bayQ),centralScenario:rows.find(r=>r.costId==='central_cost'&&r.deliveryId==='central')??null,favorableShareOfSignedQ:bayQ>0?fav/bayQ:null,withoutFavorableBayCostPer10:price(gift,withoutQ),subjectiveMassBelow1m:rows.reduce((a,r)=>a+(r.bayCostPer10!==null&&r.bayCostPer10<1e6?r.weight:0),0),subjectiveMassBelow100k:rows.reduce((a,r)=>a+(r.bayCostPer10!==null&&r.bayCostPer10<1e5?r.weight:0),0),verifiedMarginalCostPer10:null,completeResourceCostPer10:null};finite(result);return result;
}
