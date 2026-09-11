export const modelVersion='hif-whole-cost-ehf-health-v1';
export const inputs=Object.freeze({wholeExpense:4039790,households:502,assistance:931044,anchorDays:7.5,defaultGift:10000,maxGift:10000});
const c={cash:.5,prevention:.66,transfer:.5,persons:1,utility:.1,harm:.0002,bay:.99};
export const scenarios=Object.freeze([
 {id:'funding_null',weight:.2,...c,cash:0},
 {id:'health_null',weight:.2,...c,utility:0,harm:0},
 {id:'harm',weight:.05,...c,transfer:0,utility:0,harm:.003},
 {id:'cautious',weight:.2,cash:.25,prevention:.5,transfer:.25,persons:1,utility:.05,harm:.0005,bay:.97},
 {id:'central',weight:.25,...c},
 {id:'favorable',weight:.1,cash:.9,prevention:.8,transfer:1.5,persons:2.34,utility:.2,harm:.0001,bay:1}
].map(Object.freeze));
export function calculate(options={}){
 if(!options||typeof options!=='object'||Array.isArray(options))throw new TypeError('Object required');
 const {gift=10000,wholeExpense=inputs.wholeExpense,anchorDays=inputs.anchorDays,worlds=scenarios}=options;
 if(!Number.isFinite(gift)||gift<=0||gift>inputs.maxGift||!Number.isFinite(wholeExpense)||wholeExpense<=0||!Number.isFinite(anchorDays)||anchorDays<0||anchorDays>365)throw new RangeError('Finite small-gift boundary');
 if(!Array.isArray(worlds)||!worlds.length)throw new TypeError('Worlds required');
 const ids=new Set();for(const s of worlds){if(!s||typeof s!=='object'||Array.isArray(s)||typeof s.id!=='string'||!s.id.trim()||ids.has(s.id))throw new TypeError('Unique ids required');ids.add(s.id);for(const k of ['weight','cash','prevention','utility','bay'])if(!Number.isFinite(s[k])||s[k]<0||s[k]>1)throw new RangeError(k);for(const[k,max]of [['transfer',2],['persons',2.35],['harm',1]])if(!Number.isFinite(s[k])||s[k]<0||s[k]>max)throw new RangeError(k);if(anchorDays*s.transfer>365)throw new RangeError('One-year horizon');}
 if(Math.abs(worlds.reduce((a,s)=>a+s.weight,0)-1)>1e-9)throw new RangeError('Weights sum one');
 const rows=worlds.map(s=>{const delivered=gift/wholeExpense*inputs.households*s.cash;const avoidedPersonDays=delivered*s.prevention*anchorDays*s.transfer*s.persons;const grossQalys=avoidedPersonDays/365*s.utility;const harmQalys=delivered*s.harm;const allQalys=grossQalys-harmQalys,bayQalys=allQalys*s.bay;return {...s,delivered,avoidedPersonDays,grossQalys,harmQalys,allQalys,bayQalys,weightedBayQalys:s.weight*bayQalys,bayCostPer10:bayQalys>0?10*gift/bayQalys:null};});
 for(const row of rows)for(const v of Object.values(row))if(typeof v==='number'&&!Number.isFinite(v))throw new RangeError('Numerical overflow');
 const weightedBayQalys=rows.reduce((a,s)=>a+s.weightedBayQalys,0),weightedAllQalys=rows.reduce((a,s)=>a+s.weight*s.allQalys,0);const fav=rows.find(s=>s.id==='favorable');
 const result={modelVersion,gift,wholeExpense,anchorDays,rows,weightedBayQalys,weightedAllQalys,bayCostPer10:weightedBayQalys>0?10*gift/weightedBayQalys:null,allCostPer10:weightedAllQalys>0?10*gift/weightedAllQalys:null,probabilityBelow1m:rows.filter(s=>s.bayCostPer10!==null&&s.bayCostPer10<1e6).reduce((a,s)=>a+s.weight,0),favorableShare:weightedBayQalys>0&&fav?fav.weightedBayQalys/weightedBayQalys:null};
 for(const v of Object.values(result))if(typeof v==='number'&&!Number.isFinite(v))throw new RangeError('Aggregate numerical overflow');
 return result;
}
