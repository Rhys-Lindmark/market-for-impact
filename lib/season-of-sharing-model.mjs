export const modelVersion='season-of-sharing-whole-org-v1';
export const inputs=Object.freeze({wholeExpense:14799462,auditedResourceExpense:15130343,housingFamilyCash:11211805,serviceProviderGrants:32059,foodCash:2162002,anchorRiskDifference:.038,defaultGift:10000,maxGift:10000});
const central={grant:2500,dedup:.95,housing:.75,cash:.7,transfer:.75,persons:1.5,utility:.1,years:.5,harm:.0002,bay:.99};
export const scenarios=Object.freeze([
 {id:'funding_null',weight:.15,...central,cash:0},
 {id:'health_null',weight:.15,...central,utility:0,harm:0},
 {id:'harm',weight:.05,...central,utility:0,harm:.003},
 {id:'cautious',weight:.2,grant:3500,dedup:.9,housing:.5,cash:.3,transfer:.4,persons:1,utility:.05,years:.25,harm:.0005,bay:.97},
 {id:'central',weight:.3,...central},
 {id:'favorable',weight:.15,grant:2000,dedup:.98,housing:.9,cash:.9,transfer:1.5,persons:2.5,utility:.2,years:1,harm:.0001,bay:1}
].map(Object.freeze));
const finite=o=>{for(const[k,v]of Object.entries(o))if(typeof v==='number'&&!Number.isFinite(v))throw new RangeError('Nonfinite '+k);return o;};
export function calculate(options={}){
 if(options===null||typeof options!=='object'||Array.isArray(options))throw new TypeError('options must be an object');
 const {gift=inputs.defaultGift,wholeExpense=inputs.wholeExpense,worlds=scenarios}=options;
 if(!Number.isFinite(gift)||gift<=0||gift>inputs.maxGift||!Number.isFinite(wholeExpense)||wholeExpense<=0)throw new RangeError('Valid small gift and positive expense required');
 if(!Array.isArray(worlds)||!worlds.length)throw new TypeError('World array required');
 const ids=new Set();for(const s of worlds){if(!s||typeof s!=='object'||Array.isArray(s)||typeof s.id!=='string'||!s.id.trim()||ids.has(s.id))throw new TypeError('Unique world ids required');ids.add(s.id);for(const k of ['weight','dedup','housing','cash','utility','bay'])if(!Number.isFinite(s[k])||s[k]<0||s[k]>1)throw new RangeError(k);for(const k of ['grant','transfer','persons','years','harm'])if(!Number.isFinite(s[k])||s[k]<0)throw new RangeError(k);if(s.grant===0||s.years>1||s.transfer*inputs.anchorRiskDifference>1)throw new RangeError('Finite boundary');}
 if(Math.abs(worlds.reduce((a,s)=>a+s.weight,0)-1)>1e-9)throw new RangeError('Weights sum one');
 const rows=worlds.map(s=>{const annualGrantEquivalents=(inputs.housingFamilyCash-inputs.serviceProviderGrants)/s.grant*s.dedup;const delivered=gift/wholeExpense*annualGrantEquivalents*s.cash;const avoidedHomelessness=delivered*s.housing*inputs.anchorRiskDifference*s.transfer;const grossQalys=avoidedHomelessness*s.persons*s.utility*s.years;const harmQalys=delivered*s.harm;const allQalys=grossQalys-harmQalys,bayQalys=allQalys*s.bay;return finite({...s,annualGrantEquivalents,delivered,avoidedHomelessness,grossQalys,harmQalys,allQalys,bayQalys,weightedBayQalys:s.weight*bayQalys,bayCostPer10:bayQalys>0?10*gift/bayQalys:null});});
 const weightedBayQalys=rows.reduce((a,s)=>a+s.weightedBayQalys,0),weightedAllQalys=rows.reduce((a,s)=>a+s.weight*s.allQalys,0),fav=rows.find(s=>s.id==='favorable');
 return finite({modelVersion,gift,wholeExpense,rows,weightedBayQalys,weightedAllQalys,bayCostPer10:weightedBayQalys>0?10*gift/weightedBayQalys:null,allCostPer10:weightedAllQalys>0?10*gift/weightedAllQalys:null,probabilityBelow1m:rows.filter(s=>s.bayCostPer10!==null&&s.bayCostPer10<1e6).reduce((a,s)=>a+s.weight,0),probabilityBelow100k:rows.filter(s=>s.bayCostPer10!==null&&s.bayCostPer10<1e5).reduce((a,s)=>a+s.weight,0),favorableShare:weightedBayQalys>0&&fav?fav.weightedBayQalys/weightedBayQalys:null});
}
