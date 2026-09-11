export const modelVersion='melp-whole-org-v1';
export const inputs={giftUsd:10000,maxModeledGiftUsd:10000,paymentFeeUsd:0,plannedWholeOrgExpenseUsd:169269,alternativeTableBudgetUsd:166269,plannedDistrictClients:960,statedDistrictClientShare:.28,historical2024ExpenseUsd:104000,historical2024RevenueUsd:189551,historical2024CashSavingsInvestmentsUsd:193488,historical2024NetAssetsUsd:195635,externalResourceUsdPerUnique:null};
const mix=(a,b,c,d)=>[a,b,c,d].map((x,n)=>({name:['adult_mobility','bathing_transfer','pediatric_adaptive','consumables_other'][n],share:x[0],unmet:x[1],safeUse:x[2],utility:x[3],years:x[4]}));
const centralMix=()=>mix([.45,.4,.8,.03,.25],[.3,.35,.8,.02,.25],[.1,.4,.8,.02,.5],[.15,.25,.85,.002,.05]);
// Joint scenario weights locked in docs/melp-prior-lock.md before execution.
export const scenarios=[
 {name:'cash_neutral_null',weight:.4,planRealization:.75,cashAdditionality:0,uniqueFraction:.8,bayShare:.95,sfShare:.03,harmPerUnique:0,mix:centralMix()},
 {name:'clinical_null',weight:.15,planRealization:.75,cashAdditionality:.3,uniqueFraction:.8,bayShare:.95,sfShare:.03,harmPerUnique:0,mix:centralMix().map(d=>({...d,utility:0}))},
 {name:'harm',weight:.15,planRealization:.5,cashAdditionality:.25,uniqueFraction:.6,bayShare:.9,sfShare:.02,harmPerUnique:.002,mix:centralMix().map(d=>({...d,utility:0}))},
 {name:'cautious_positive',weight:.15,planRealization:.5,cashAdditionality:.15,uniqueFraction:.6,bayShare:.9,sfShare:.02,harmPerUnique:.0002,mix:mix([.35,.2,.6,.01,.1],[.3,.2,.6,.01,.1],[.1,.2,.6,.01,.25],[.25,.15,.7,.001,.03])},
 {name:'central',weight:.12,planRealization:.75,cashAdditionality:.3,uniqueFraction:.8,bayShare:.95,sfShare:.03,harmPerUnique:.00015,mix:centralMix()},
 {name:'favorable',weight:.03,planRealization:1,cashAdditionality:.5,uniqueFraction:.95,bayShare:.98,sfShare:.05,harmPerUnique:.0001,mix:mix([.5,.6,.9,.05,.5],[.25,.5,.9,.03,.5],[.15,.6,.9,.04,.75],[.1,.35,.9,.004,.08])}
];
const finite=(x,label)=>{if(!Number.isFinite(x))throw new RangeError(label);};
const probability=(x,label)=>{finite(x,label);if(x<0||x>1)throw new RangeError(label);};
const ratio=(g,q)=>q>0?10*g/q:null;
export function calculate(i=inputs,ss=scenarios){
 for(const k of ['giftUsd','maxModeledGiftUsd','paymentFeeUsd','plannedWholeOrgExpenseUsd','plannedDistrictClients'])finite(i[k],k);
 if(i.giftUsd<0||i.maxModeledGiftUsd!==10000||i.giftUsd>i.maxModeledGiftUsd||i.paymentFeeUsd<0||i.paymentFeeUsd>i.giftUsd||i.plannedWholeOrgExpenseUsd<=0||i.plannedDistrictClients<=0)throw new RangeError('cost or scale');
 probability(i.statedDistrictClientShare,'district share');if(i.statedDistrictClientShare===0)throw new RangeError('district share');
 if(i.externalResourceUsdPerUnique!==null){finite(i.externalResourceUsdPerUnique,'resources');if(i.externalResourceUsdPerUnique<0)throw new RangeError('resources');}
 if(!Array.isArray(ss)||!ss.length||Math.abs(ss.reduce((a,s)=>a+s.weight,0)-1)>1e-10)throw new RangeError('weights');
 const inferredPlanningClientEquivalents=i.plannedDistrictClients/i.statedDistrictClientShare;
 const plannedCostPerClientEquivalent=i.plannedWholeOrgExpenseUsd/inferredPlanningClientEquivalents;
 const baseClientEquivalents=(i.giftUsd-i.paymentFeeUsd)/plannedCostPerClientEquivalent;
 const rows=ss.map(s=>{
  for(const k of ['weight','planRealization','cashAdditionality','uniqueFraction','bayShare','sfShare'])probability(s[k],k);
  finite(s.harmPerUnique,'harm');if(s.harmPerUnique<0||s.sfShare>s.bayShare)throw new RangeError('harm or nesting');
  if(Math.abs(s.mix.reduce((a,d)=>a+d.share,0)-1)>1e-10)throw new RangeError('mix sums');
  const realizedClientEquivalents=baseClientEquivalents*s.planRealization;
  const additionalClientEquivalents=realizedClientEquivalents*s.cashAdditionality;
  const additionalUniqueRecipients=additionalClientEquivalents*s.uniqueFraction;
  const pathways=s.mix.map(d=>{for(const k of ['share','unmet','safeUse','utility'])probability(d[k],k);finite(d.years,'years');if(d.years<0||d.years>1)throw new RangeError('duration');return {...d,qaly:additionalUniqueRecipients*d.share*d.unmet*d.safeUse*d.utility*d.years};});
  const benefitQaly=pathways.reduce((a,p)=>a+p.qaly,0),harmQaly=additionalUniqueRecipients*s.harmPerUnique,netQaly=benefitQaly-harmQaly,bayQaly=netQaly*s.bayShare,sfQaly=netQaly*s.sfShare;
  const resourceSensitivityCostUsd=i.externalResourceUsdPerUnique===null?null:i.giftUsd+additionalUniqueRecipients*i.externalResourceUsdPerUnique;
  return {...s,realizedClientEquivalents,additionalClientEquivalents,additionalUniqueRecipients,pathways,benefitQaly,harmQaly,netQaly,bayQaly,sfQaly,donorCostPer10Qaly:ratio(i.giftUsd,netQaly),bayDonorCostPer10Qaly:ratio(i.giftUsd,bayQaly),sfDonorCostPer10Qaly:ratio(i.giftUsd,sfQaly),resourceSensitivityCostUsd,resourceSensitivityBayCostPer10Qaly:resourceSensitivityCostUsd===null?null:ratio(resourceSensitivityCostUsd,bayQaly)};
 });
 const weighted={};for(const k of ['additionalUniqueRecipients','benefitQaly','harmQaly','netQaly','bayQaly','sfQaly'])weighted[k]=rows.reduce((a,r)=>a+r.weight*r[k],0);
 Object.assign(weighted,{donorCostPer10Qaly:ratio(i.giftUsd,weighted.netQaly),bayDonorCostPer10Qaly:ratio(i.giftUsd,weighted.bayQaly),sfDonorCostPer10Qaly:ratio(i.giftUsd,weighted.sfQaly),completeSocietalCostPer10Qaly:null});
 const favorable=rows.find(r=>r.name==='favorable');weighted.favorableShareOfSignedBayQaly=weighted.bayQaly!==0&&favorable?favorable.weight*favorable.bayQaly/weighted.bayQaly:null;
 const noTail=rows.filter(r=>r.name!=='favorable'),mass=noTail.reduce((a,r)=>a+r.weight,0),noTailQ=mass>0?noTail.reduce((a,r)=>a+r.weight*r.bayQaly,0)/mass:null;
 const thresholdJudgments={probabilityBayBelow1m:rows.filter(r=>r.bayDonorCostPer10Qaly!==null&&r.bayDonorCostPer10Qaly<1000000).reduce((a,r)=>a+r.weight,0),probabilityBayBelow100k:rows.filter(r=>r.bayDonorCostPer10Qaly!==null&&r.bayDonorCostPer10Qaly<100000).reduce((a,r)=>a+r.weight,0),interpretation:'Sum of subjective discrete scenario weights, not statistical confidence or calibrated probabilities'};
 return {modelVersion,inputs:i,inferredPlanningClientEquivalents,plannedCostPerClientEquivalent,baseClientEquivalents,rows,weighted,noFavorable:{bayQaly:noTailQ,bayDonorCostPer10Qaly:noTailQ===null?null:ratio(i.giftUsd,noTailQ)},thresholdJudgments,verifiedMarginalOffer:null,measuredQaly:null,measuredAnnualUniqueRecipients:null,completeSocietalResourcesUsd:null,publicationStatus:'exploratory_published'};
}
