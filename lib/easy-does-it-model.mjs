export const modelVersion='edi-whole-gift-v1';
export const wholeExpense=2166918;
export const worlds=Object.freeze([
 {id:'funding_null',weight:.25,funding:0,careHoursPerEpisode:1.5,repairHoursPerEpisode:2,overlap:.8,careUtility:.15,careDays:.5,repairUtility:.05,repairDays:3,harm:.00001,bay:1},
 {id:'clinical_null',weight:.15,funding:.25,careHoursPerEpisode:1.5,repairHoursPerEpisode:2,overlap:.8,careUtility:0,careDays:.5,repairUtility:0,repairDays:3,harm:0,bay:1},
 {id:'harm',weight:.1,funding:.25,careHoursPerEpisode:1.5,repairHoursPerEpisode:2,overlap:.8,careUtility:0,careDays:.5,repairUtility:0,repairDays:3,harm:.0001,bay:1},
 {id:'cautious',weight:.2,funding:.1,careHoursPerEpisode:2,repairHoursPerEpisode:3,overlap:.6,careUtility:.05,careDays:.125,repairUtility:.02,repairDays:1,harm:.00002,bay:1},
 {id:'central',weight:.25,funding:.25,careHoursPerEpisode:1.5,repairHoursPerEpisode:2,overlap:.8,careUtility:.15,careDays:.5,repairUtility:.05,repairDays:3,harm:.00001,bay:1},
 {id:'favorable',weight:.05,funding:.6,careHoursPerEpisode:1,repairHoursPerEpisode:1,overlap:.9,careUtility:.3,careDays:2,repairUtility:.15,repairDays:14,harm:.000005,bay:1}
].map(Object.freeze));
const finite=(x,n,min=0,max=Number.MAX_VALUE)=>{if(typeof x!=='number'||!Number.isFinite(x)||x<min||x>max)throw new RangeError(n);return x;};
const price=q=>{finite(q,'perDollar',-Number.MAX_VALUE);return q>0?finite(10/q,'price'):null;};
export function calculate(options={}) {
 if(!options||typeof options!=='object'||Array.isArray(options))throw new TypeError('options');
 const {gift=1000,expense=wholeExpense,careHours=872,repairHours=476,scenarios=worlds}=options;
 finite(gift,'gift',0,10000);finite(expense,'expense',Number.MIN_VALUE);finite(careHours,'careHours');finite(repairHours,'repairHours');
 if(!Array.isArray(scenarios)||!scenarios.length)throw new TypeError('scenarios');
 const ids=new Set();let weights=0;
 const rows=scenarios.map(w=>{
  if(!w||typeof w!=='object'||Array.isArray(w)||typeof w.id!=='string'||!w.id.trim()||ids.has(w.id.trim()))throw new TypeError('world/id');w={...w,id:w.id.trim()};ids.add(w.id);
  for(const k of ['weight','funding','overlap','careUtility','repairUtility','harm','bay'])finite(w[k],k,0,1);
  for(const k of ['careHoursPerEpisode','repairHoursPerEpisode'])finite(w[k],k,Number.MIN_VALUE);
  for(const k of ['careDays','repairDays'])finite(w[k],k,0,365);
  weights+=w.weight;
  const careEpisodes=finite(careHours/w.careHoursPerEpisode,'careEpisodes'),repairEpisodes=finite(repairHours/w.repairHoursPerEpisode,'repairEpisodes');
  const careQ=finite(careEpisodes*w.careUtility*w.careDays/365,'careQ'),repairQ=finite(repairEpisodes*w.repairUtility*w.repairDays/365,'repairQ');
  const harmQ=finite((careEpisodes+repairEpisodes)*w.harm,'harmQ');
  const response=finite(gift/expense*w.funding*w.overlap,'response');
  const allQ=finite(response*(careQ+repairQ-harmQ),'allQ',-Number.MAX_VALUE),bayQ=finite(allQ*w.bay,'bayQ',-Number.MAX_VALUE);
  return {...w,careEpisodes,repairEpisodes,careQ,repairQ,harmQ,allQ,bayQ,bayQPerDollar:gift?finite(bayQ/gift,'perDollar',-Number.MAX_VALUE):0,bayCostPer10:gift&&bayQ>0?price(bayQ/gift):null};
 });
 if(Math.abs(weights-1)>1e-10)throw new RangeError('weights');
 const allQ=finite(rows.reduce((s,r)=>s+r.weight*r.allQ,0),'weightedAll',-Number.MAX_VALUE),bayQ=finite(rows.reduce((s,r)=>s+r.weight*r.bayQ,0),'weightedBay',-Number.MAX_VALUE);
 const f=rows.find(r=>r.id==='favorable'),nonFavWeight=1-(f?.weight||0),withoutFavorableQ=nonFavWeight?finite((bayQ-(f?f.weight*f.bayQ:0))/nonFavWeight,'without',-Number.MAX_VALUE):0;
 return {modelVersion,gift,expense,careHours,repairHours,rows,allQ,bayQ,bayCostPer10:gift&&bayQ>0?price(bayQ/gift):null,central:rows.find(r=>r.id==='central')||null,withoutFavorableQ,withoutFavorableBayCostPer10:gift&&withoutFavorableQ>0?price(withoutFavorableQ/gift):null,favorableShare:bayQ>0&&f?finite(f.weight*f.bayQ/bayQ,'favorableShare',-Number.MAX_VALUE):null,subjectiveMassBelow1m:rows.reduce((s,r)=>s+(r.bayCostPer10!==null&&r.bayCostPer10<1e6?r.weight:0),0),subjectiveMassBelow100k:rows.reduce((s,r)=>s+(r.bayCostPer10!==null&&r.bayCostPer10<1e5?r.weight:0),0)};
}
