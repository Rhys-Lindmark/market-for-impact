export const modelVersion='acknowledge-alliance-whole-gift-finite-counseling-v1';
export const anchors=Object.freeze({expense:1599738,yearEnd:'2025-06-30',ein:'77-0393676',governmentRevenue:55000,feeRevenue:1116502,clients:24,sessions:484});
const c={clients:24,completion:.8,utilityGain:.06,duration:.5,transfer:.5,access:.5,funding:.4,bay:.98,harm:.001};
export const scenarios=Object.freeze([
 {id:'funding_null',weight:.2,...c,funding:0},
 {id:'clinical_null',weight:.15,...c,utilityGain:0,harm:0},
 {id:'harm',weight:.1,...c,utilityGain:0,harm:.005},
 {id:'cautious',weight:.25,clients:24,completion:.5,utilityGain:.03,duration:.25,transfer:.3,access:.3,funding:.2,bay:.98,harm:.002},
 {id:'central',weight:.2,...c},
 {id:'favorable',weight:.1,clients:24,completion:.95,utilityGain:.1,duration:1,transfer:.8,access:.7,funding:.65,bay:1,harm:.0005}
].map(Object.freeze));
const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const valid=(v,lo,hi,key)=>{if(typeof v!=='number'||!Number.isFinite(v)||v<lo||v>hi)throw new RangeError(key);};
const check=x=>{if(typeof x==='number'&&!Number.isFinite(x))throw new RangeError('nonfinite output');if(x&&typeof x==='object')Object.values(x).forEach(check);return x;};
const price=(cost,q)=>{let p=q>0?10*cost/q:null;if(p!==null&&!Number.isFinite(p))throw new RangeError('nonfinite price');return p;};
export function calculate(options={}){
 if(!object(options))throw new TypeError('options');const{gift=10000,expense=anchors.expense,worlds=scenarios}=options;
 valid(gift,0,10000,'gift');valid(expense,1,1e9,'expense');if(!Array.isArray(worlds)||!worlds.length||worlds.length>100)throw new TypeError('worlds');let mass=0;const ids=new Set();
 const rows=worlds.map(s=>{if(!object(s)||typeof s.id!=='string'||!s.id.trim()||ids.has(s.id.trim()))throw new TypeError('world id');ids.add(s.id.trim());for(const k of ['weight','completion','transfer','access','funding','bay'])valid(s[k],0,1,k);valid(s.clients,0,100000,'clients');valid(s.utilityGain,-.5,.5,'utilityGain');valid(s.duration,0,2,'duration');valid(s.harm,0,.1,'harm');mass+=s.weight;
 const starters=s.clients,completed=starters*s.completion,qPerComplete=s.utilityGain*s.duration*s.transfer,benefit=completed*qPerComplete*s.access,burden=starters*s.harm,annualQ=(benefit-burden)*s.funding,annualBayQ=annualQ*s.bay,giftQ=annualQ*gift/expense,giftBayQ=annualBayQ*gift/expense;
 return check({...s,starters,completed,qPerComplete,benefit,burden,annualQ,annualBayQ,giftQ,giftBayQ,bayCostPer10:price(expense,annualBayQ)});});
 if(Math.abs(mass-1)>1e-10)throw new RangeError('weight mass');const annualBayQ=rows.reduce((a,s)=>a+s.weight*s.annualBayQ,0),annualQ=rows.reduce((a,s)=>a+s.weight*s.annualQ,0);check({annualBayQ,annualQ});const f=rows.find(x=>x.id==='favorable'),others=rows.filter(x=>x.id!=='favorable'),otherMass=others.reduce((a,s)=>a+s.weight,0),without=otherMass?others.reduce((a,s)=>a+s.weight*s.annualBayQ,0)/otherMass:0;
 return check({modelVersion,anchors,gift,expense,rows,annualBayQ,annualQ,giftBayQ:annualBayQ*gift/expense,giftQ:annualQ*gift/expense,bayCostPer10:price(expense,annualBayQ),allCostPer10:price(expense,annualQ),favorableShare:annualBayQ>0&&f?f.weight*f.annualBayQ/annualBayQ:null,withoutFavorableBayCostPer10:price(expense,without),subjectiveMassBelow1m:rows.reduce((a,s)=>a+(s.bayCostPer10!==null&&s.bayCostPer10<1e6?s.weight:0),0),subjectiveMassBelow100k:rows.reduce((a,s)=>a+(s.bayCostPer10!==null&&s.bayCostPer10<1e5?s.weight:0),0),completeResourceCostPer10:null,verifiedMarginalCostPer10:null});
}
