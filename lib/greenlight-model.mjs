export const modelVersion='greenlight-whole-org-v1';
export const inputs=Object.freeze({wholeExpense:345616,defaultGift:10000,maxGift:10000,financialYear:2024});
const central={weekly:77.5,weeks:48,attendedWeeks:24,dedup:.9,cash:.5,access:.6,benefiting:.5,utility:.06,years:.5,harm:.0005,bay:.98};
export const scenarios=Object.freeze([
 {id:'funding_null',weight:.2,...central,cash:0},
 {id:'clinical_null',weight:.15,...central,benefiting:0,harm:0},
 {id:'harm',weight:.1,...central,benefiting:0,harm:.003},
 {id:'cautious',weight:.2,weekly:75,weeks:44,attendedWeeks:30,dedup:.8,cash:.25,access:.4,benefiting:.35,utility:.04,years:.25,harm:.001,bay:.95},
 {id:'central',weight:.25,...central},
 {id:'favorable',weight:.1,weekly:80,weeks:50,attendedWeeks:16,dedup:.95,cash:.8,access:.8,benefiting:.75,utility:.10,years:.75,harm:.0002,bay:1}
].map(Object.freeze));
export function calculate({gift=inputs.defaultGift,wholeExpense=inputs.wholeExpense,worlds=scenarios}={}){
 if(!Number.isFinite(gift)||gift<=0||gift>inputs.maxGift)throw new RangeError('Gift must be positive and at most $10,000; larger scale unverified');
 if(!Number.isFinite(wholeExpense)||wholeExpense<=0)throw new RangeError('Positive whole expense required');
 if(!Array.isArray(worlds)||worlds.length===0)throw new TypeError('Worlds must be a nonempty array');
 const ids=new Set();
 for(const s of worlds){
  if(!s||typeof s!=='object'||Array.isArray(s))throw new TypeError('Each world must be an object');
  if(typeof s.id!=='string'||!s.id.trim()||ids.has(s.id))throw new TypeError('World ids must be nonempty and unique');
  ids.add(s.id);
  if(!Number.isFinite(s.weight)||s.weight<0||s.weight>1)throw new RangeError('weight');
 }
 if(Math.abs(worlds.reduce((a,s)=>a+s.weight,0)-1)>1e-9)throw new RangeError('Weights must sum to one');
 const finite=(obj)=>{for(const [key,value]of Object.entries(obj))if(typeof value==='number'&&!Number.isFinite(value))throw new RangeError('Nonfinite derived output: '+key);return obj;};
 const rows=worlds.map(s=>{
  for(const k of ['weight','dedup','cash','access','benefiting','utility','bay'])if(!Number.isFinite(s[k])||s[k]<0||s[k]>1)throw new RangeError(k);
  for(const k of ['weekly','weeks','attendedWeeks','years','harm'])if(!Number.isFinite(s[k])||s[k]<0)throw new RangeError(k);
  if(s.attendedWeeks===0||s.years>1||s.weeks>52)throw new RangeError('Finite time boundary');
  const annualEpisodeEquivalents=s.weekly*s.weeks/s.attendedWeeks*s.dedup;
  const deliveredEpisodeEquivalents=gift/wholeExpense*annualEpisodeEquivalents*s.cash;
  const benefit=deliveredEpisodeEquivalents*s.access*s.benefiting*s.utility*s.years;
  const harm=deliveredEpisodeEquivalents*s.harm;
  const allQalys=benefit-harm,bayQalys=allQalys*s.bay;
  return finite({...s,annualEpisodeEquivalents,deliveredEpisodeEquivalents,benefit,harmQalys:harm,allQalys,bayQalys,weightedBayQalys:s.weight*bayQalys,bayCostPer10:bayQalys>0?10*gift/bayQalys:null});
 });
 const weightedBayQalys=rows.reduce((a,s)=>a+s.weightedBayQalys,0),weightedAllQalys=rows.reduce((a,s)=>a+s.weight*s.allQalys,0);
 const favorable=rows.find(s=>s.id==='favorable');
 return finite({modelVersion,gift,wholeExpense,rows,weightedBayQalys,weightedAllQalys,bayCostPer10:weightedBayQalys>0?10*gift/weightedBayQalys:null,allCostPer10:weightedAllQalys>0?10*gift/weightedAllQalys:null,probabilityBelow1m:rows.filter(s=>s.bayCostPer10!==null&&s.bayCostPer10<1e6).reduce((a,s)=>a+s.weight,0),probabilityBelow100k:rows.filter(s=>s.bayCostPer10!==null&&s.bayCostPer10<1e5).reduce((a,s)=>a+s.weight,0),favorableShareOfSignedExpectation:weightedBayQalys>0&&favorable?favorable.weightedBayQalys/weightedBayQalys:null});
}
