export const modelVersion='micahs-hugs-whole-gift-network-cohort-v1';
export const anchors=Object.freeze({expense:66076,reportedExpense:61176,nettedEventCost:4900,doses:15000,year:'2025',ein:'87-1150505',giftCap:10000});
const central={unitsPerCarrier:4,stationShare:.25,stationReach:.25,schoolReach:.01,dedup:.5,hazardGain:.001,baselineHazard:.07,postHazard:.07,horizon:10,utility:.65,funding:.3,bay:.98,harm:.0002};
export const worlds=Object.freeze([
 {id:'funding_null',weight:.2,...central,funding:0},
 {id:'clinical_null',weight:.2,...central,hazardGain:0,harm:0},
 {id:'harm',weight:.1,...central,hazardGain:-.0002,harm:.002},
 {id:'cautious',weight:.2,unitsPerCarrier:6,stationShare:.1,stationReach:.1,schoolReach:.002,dedup:.3,hazardGain:.0002,baselineHazard:.1,postHazard:.1,horizon:5,utility:.55,funding:.1,bay:.95,harm:.0003},
 {id:'central',weight:.2,...central},
 {id:'favorable',weight:.1,unitsPerCarrier:2,stationShare:.5,stationReach:.5,schoolReach:.05,dedup:.65,hazardGain:.003,baselineHazard:.04,postHazard:.04,horizon:15,utility:.75,funding:.6,bay:1,harm:.0001}
].map(Object.freeze));
const integral=(h,t)=>h===0?t:-Math.expm1(-h*t)/h;
const valid=(v,lo,hi,k)=>{if(typeof v!=='number'||!Number.isFinite(v)||v<lo||v>hi)throw new RangeError(k);};
const finite=v=>{if(typeof v==='number'&&!Number.isFinite(v))throw new RangeError('nonfinite derived');if(v&&typeof v==='object')Object.values(v).forEach(finite);return v;};
const price=(cost,q)=>{const v=q>0?10*cost/q:null;if(v!==null&&!Number.isFinite(v))throw new RangeError('price overflow');return v;};
export function trajectory(s){if(!s||typeof s!=='object'||Array.isArray(s))throw new TypeError('trajectory');valid(s.baselineHazard,0,2,'baselineHazard');valid(s.hazardGain,-1,s.baselineHazard,'hazardGain');valid(s.postHazard,0,2,'postHazard');valid(s.horizon,1,30,'horizon');valid(s.utility,0,1,'utility');const d=Math.log1p(.03),a=s.baselineHazard-s.hazardGain,b=s.baselineHazard;return finite(s.utility*(integral(a+d,1)-integral(b+d,1)+(Math.exp(-a)-Math.exp(-b))*Math.exp(-d)*integral(s.postHazard+d,s.horizon-1)));}
export function calculate(options={}){
 if(!options||typeof options!=='object'||Array.isArray(options))throw new TypeError('options');
 const{gift=10000,expense=anchors.expense,doses=anchors.doses,scenarios=worlds}=options;
 valid(gift,0,anchors.giftCap,'gift');valid(expense,Number.MIN_VALUE,Number.MAX_VALUE,'expense');valid(doses,0,1e8,'doses');
 if(!Array.isArray(scenarios)||!scenarios.length)throw new TypeError('scenarios');let mass=0;const ids=new Set();
 for(const s of scenarios){if(!s||typeof s!=='object'||Array.isArray(s)||typeof s.id!=='string'||!s.id.trim()||ids.has(s.id))throw new TypeError('scenario');ids.add(s.id);for(const k of ['weight','stationShare','stationReach','schoolReach','dedup','utility','funding','bay'])valid(s[k],0,1,k);valid(s.unitsPerCarrier,1,1000,'unitsPerCarrier');valid(s.baselineHazard,0,2,'baselineHazard');valid(s.postHazard,0,2,'postHazard');valid(s.hazardGain,-1,s.baselineHazard,'hazardGain');valid(s.horizon,1,30,'horizon');valid(s.harm,0,.1,'harm');mass+=s.weight;}
 if(Math.abs(mass-1)>1e-10)throw new RangeError('weight mass');
 const rows=scenarios.map(s=>{const carriers=doses/s.unitsPerCarrier,stationNetwork=carriers*s.stationShare*s.stationReach,schoolNetwork=carriers*(1-s.stationShare)*s.schoolReach,uniqueRiskPeople=(stationNetwork+schoolNetwork)*s.dedup,qPerPerson=trajectory(s),additionalPeople=gift/expense*uniqueRiskPeople*s.funding,allQ=additionalPeople*(qPerPerson-s.harm),bayQ=allQ*s.bay;return finite({...s,carriers,stationNetwork,schoolNetwork,uniqueRiskPeople,qPerPerson,additionalPeople,allQ,bayQ,bayCostPer10:price(gift,bayQ)});});
 const bayQ=rows.reduce((a,s)=>a+s.weight*s.bayQ,0),allQ=rows.reduce((a,s)=>a+s.weight*s.allQ,0);finite({bayQ,allQ});
 const favorable=rows.find(s=>s.id==='favorable'),remaining=rows.filter(s=>s.id!=='favorable'),remainingMass=remaining.reduce((a,s)=>a+s.weight,0),without=remainingMass?remaining.reduce((a,s)=>a+s.weight*s.bayQ,0)/remainingMass:0;
 return finite({modelVersion,anchors,gift,expense,doses,rows,bayQ,allQ,bayCostPer10:price(gift,bayQ),allCostPer10:price(gift,allQ),favorableShare:bayQ>0&&favorable?favorable.weight*favorable.bayQ/bayQ:null,withoutFavorableBayCostPer10:price(gift,without),subjectiveMassBelow1m:rows.reduce((a,s)=>a+(s.bayCostPer10!==null&&s.bayCostPer10<1e6?s.weight:0),0),subjectiveMassBelow100k:rows.reduce((a,s)=>a+(s.bayCostPer10!==null&&s.bayCostPer10<1e5?s.weight:0),0),verifiedMarginalCostPer10:null,completeResourceCostPer10:null});
}
