export const modelVersion='recares-whole-org-v2';
export const inputs={giftUsd:10000,maxModeledGiftUsd:10000,paymentFeeUsd:0,totalExpenseUsd:111205,programExpenseUsd:103400,reportedRecipientEquivalents:9770,reportedItems:42000,equipmentDonors:4521,cashSavingsInvestmentsUsd:176715,netAssetsUsd:188533,externalResourceCostPerIncrementalUnique:null};
// Priors specified before evaluating outputs. Weights reflect substantial uncertainty,
// not a fitted distribution or a target cost-effectiveness rank.
const mix=(mobility,bathing,supplies)=>[
 {name:'mobility',share:mobility[0],unmet:mobility[1],safeUse:mobility[2],utility:mobility[3],years:mobility[4]},
 {name:'bathing_transfer',share:bathing[0],unmet:bathing[1],safeUse:bathing[2],utility:bathing[3],years:bathing[4]},
 {name:'supplies_other',share:supplies[0],unmet:supplies[1],safeUse:supplies[2],utility:supplies[3],years:supplies[4]}];
export const scenarios=[
 {name:'harm',weight:.15,throughput:.25,uniqueFraction:.5,harmPerUnique:.002,bayShare:.9,sfShare:.25,mix:mix([.15,.3,.7,0,.25],[.1,.3,.7,0,.25],[.75,.2,.8,0,.05])},
 {name:'null',weight:.35,throughput:.25,uniqueFraction:.5,harmPerUnique:0,bayShare:.95,sfShare:.3,mix:mix([.2,.5,.85,0,.5],[.15,.4,.85,0,.5],[.65,.3,.9,0,.08])},
 {name:'cautious_positive',weight:.2,throughput:.3,uniqueFraction:.5,harmPerUnique:.0001,bayShare:.85,sfShare:.2,mix:mix([.1,.25,.7,.02,.25],[.1,.25,.7,.01,.25],[.8,.15,.8,.002,.05])},
 {name:'central',weight:.25,throughput:.5,uniqueFraction:.65,harmPerUnique:.0001,bayShare:.95,sfShare:.3,mix:mix([.2,.5,.85,.05,.5],[.15,.4,.85,.03,.5],[.65,.3,.9,.005,.08])},
 {name:'favorable',weight:.05,throughput:.75,uniqueFraction:.8,harmPerUnique:.00005,bayShare:.98,sfShare:.4,mix:mix([.3,.7,.95,.08,.75],[.2,.6,.95,.04,.5],[.5,.4,.95,.01,.12])}
];
const prob=(v,label)=>{if(!Number.isFinite(v)||v<0||v>1)throw new RangeError(label);};
const ratio=(cost,q)=>q>0?cost*10/q:null;
export function calculate(i=inputs,ss=scenarios){
 if(!Number.isFinite(i.giftUsd)||i.giftUsd<0||i.giftUsd>i.maxModeledGiftUsd)throw new RangeError('gift outside bounded 0–10000 scale');
 if(i.paymentFeeUsd<0||i.paymentFeeUsd>i.giftUsd||!(i.totalExpenseUsd>0)||!(i.reportedRecipientEquivalents>0))throw new RangeError('cost inputs');
 if(i.externalResourceCostPerIncrementalUnique!==null&&(!Number.isFinite(i.externalResourceCostPerIncrementalUnique)||i.externalResourceCostPerIncrementalUnique<0))throw new RangeError('resource sensitivity');
 if(Math.abs(ss.reduce((x,s)=>x+s.weight,0)-1)>1e-10)throw new RangeError('weights');
 const costPerReportedRecipient=i.totalExpenseUsd/i.reportedRecipientEquivalents;
 const baseRecipientEquivalents=(i.giftUsd-i.paymentFeeUsd)/costPerReportedRecipient;
 const rows=ss.map(s=>{
  for(const k of ['weight','throughput','uniqueFraction','bayShare','sfShare'])prob(s[k],k);
  if(s.sfShare>s.bayShare||!Number.isFinite(s.harmPerUnique)||s.harmPerUnique<0)throw new RangeError('geography/harm');
  if(Math.abs(s.mix.reduce((x,d)=>x+d.share,0)-1)>1e-10)throw new RangeError('mix');
  const marginalRecipientEquivalents=baseRecipientEquivalents*s.throughput;
  const incrementalUniqueRecipients=marginalRecipientEquivalents*s.uniqueFraction;
  const pathways=s.mix.map(d=>{for(const k of ['share','unmet','safeUse','utility'])prob(d[k],k);if(!Number.isFinite(d.years)||d.years<0||d.years>1)throw new RangeError('finite duration');return {...d,benefitQaly:incrementalUniqueRecipients*d.share*d.unmet*d.safeUse*d.utility*d.years};});
  const benefitQaly=pathways.reduce((a,d)=>a+d.benefitQaly,0);
  const harmQaly=incrementalUniqueRecipients*s.harmPerUnique;
  const netQaly=benefitQaly-harmQaly,bayQaly=netQaly*s.bayShare,sfQaly=netQaly*s.sfShare;
  const resourceSensitivityUsd=i.externalResourceCostPerIncrementalUnique===null?null:i.giftUsd+incrementalUniqueRecipients*i.externalResourceCostPerIncrementalUnique;
  return {...s,pathways,marginalRecipientEquivalents,incrementalUniqueRecipients,benefitQaly,harmQaly,netQaly,bayQaly,sfQaly,donorCostPer10Qaly:ratio(i.giftUsd,netQaly),bayDonorCostPer10Qaly:ratio(i.giftUsd,bayQaly),sfDonorCostPer10Qaly:ratio(i.giftUsd,sfQaly),completeSocietalResourceCostPer10Qaly:null,resourceSensitivityUsd,resourceSensitivityBayCostPer10Qaly:resourceSensitivityUsd===null?null:ratio(resourceSensitivityUsd,bayQaly)};
 });
 const weighted={};for(const k of ['netQaly','bayQaly','sfQaly','benefitQaly','harmQaly','incrementalUniqueRecipients'])weighted[k]=rows.reduce((a,r)=>a+r.weight*r[k],0);
 weighted.donorCostPer10Qaly=ratio(i.giftUsd,weighted.netQaly);weighted.bayDonorCostPer10Qaly=ratio(i.giftUsd,weighted.bayQaly);weighted.sfDonorCostPer10Qaly=ratio(i.giftUsd,weighted.sfQaly);
 weighted.completeSocietalResourceCostPer10Qaly=null;
 weighted.bayImpactShare=weighted.netQaly===0?null:weighted.bayQaly/weighted.netQaly;weighted.sfImpactShare=weighted.netQaly===0?null:weighted.sfQaly/weighted.netQaly;
 const favorable=rows.find(r=>r.name==='favorable');weighted.favorableShareOfNetBayQaly=weighted.bayQaly===0?null:(favorable?favorable.bayQaly*favorable.weight:0)/weighted.bayQaly;
 const noTail=rows.filter(r=>r.name!=='favorable'),w=noTail.reduce((a,r)=>a+r.weight,0);const noFavorableBayQaly=noTail.reduce((a,r)=>a+r.weight*r.bayQaly,0)/w;
 return {modelVersion,publicationStatus:'draft_for_independent_audit',inputs:i,costPerReportedRecipient,baseRecipientEquivalents,rows,weighted,noFavorable:{bayQaly:noFavorableBayQaly,bayDonorCostPer10Qaly:ratio(i.giftUsd,noFavorableBayQaly)},verifiedMarginalFundingOffer:null,measuredQaly:null,measuredUniqueRecipientCount:null,measuredResidentShares:null,completeSocietalResourcesUsd:null};
}
