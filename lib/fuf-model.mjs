export const inputs={
  giftUsd:100000,
  fy2024ExpenseUsd:5673426,
  fy2024RevenueUsd:5006971,
  fy2024NetAssetsUsd:2595103,
  fy2025RevenueUsd:5142060,
  fy2025ExpenseUsd:5410095,
  fy2025NetAssetsUsd:2327068,
  fy2024TreesPlanted:1412,
  historicDisclosedPackageCostPerTreeUsd:2500,
  bayShare:1,
  sfShare:1,
  discountRate:.03
};

export const scenarios=[
  {name:'harm',weight:.25,fundingAdditionality:.15,establishmentSurvival:.50,annualPostEstablishmentMortality:.093,horizonYears:8,qalyPerSurvivingTreeYear:0,harmQalyPerIncrementalTree:.020,grossResourceMultiplier:1.05},
  {name:'null',weight:.35,fundingAdditionality:.10,establishmentSurvival:.50,annualPostEstablishmentMortality:.093,horizonYears:8,qalyPerSurvivingTreeYear:0,harmQalyPerIncrementalTree:0,grossResourceMultiplier:1.10},
  {name:'central',weight:.30,fundingAdditionality:.40,establishmentSurvival:.75,annualPostEstablishmentMortality:.060,horizonYears:12,qalyPerSurvivingTreeYear:.010,harmQalyPerIncrementalTree:.002,grossResourceMultiplier:1.20},
  {name:'favorable',weight:.10,fundingAdditionality:.75,establishmentSurvival:.90,annualPostEstablishmentMortality:.028,horizonYears:20,qalyPerSurvivingTreeYear:.040,harmQalyPerIncrementalTree:.0006,grossResourceMultiplier:1.50}
];

export function finiteDiscountedSurvivingTreeYears(establishmentSurvival,annualMortality,horizonYears,discountRate=.03){
  if(!Number.isInteger(horizonYears)||horizonYears<0||discountRate<0||establishmentSurvival<0||establishmentSurvival>1||annualMortality<0||annualMortality>1)throw new RangeError('finite tree-year inputs');
  let total=0;
  for(let t=1;t<=horizonYears;t+=1)total+=establishmentSurvival*(1-annualMortality)**(t-1)/(1+discountRate)**(t-.5);
  return total;
}

export function calculate(i=inputs,ss=scenarios){
  const weight=ss.reduce((a,s)=>a+s.weight,0);if(Math.abs(weight-1)>1e-12)throw new RangeError('scenario weights');
  const giftShare=i.giftUsd/i.fy2024ExpenseUsd;
  const realizedWholeOrganizationExpensePerTree=i.fy2024ExpenseUsd/i.fy2024TreesPlanted;
  const giftLinkedTreeEquivalents=i.fy2024TreesPlanted*giftShare;
  const rows=ss.map(s=>{
    const incrementalTrees=giftLinkedTreeEquivalents*s.fundingAdditionality;
    const finiteTreeYears=finiteDiscountedSurvivingTreeYears(s.establishmentSurvival,s.annualPostEstablishmentMortality,s.horizonYears,i.discountRate);
    const survivingDiscountedTreeYears=incrementalTrees*finiteTreeYears;
    const benefitQaly=survivingDiscountedTreeYears*s.qalyPerSurvivingTreeYear;
    const harmQaly=incrementalTrees*s.harmQalyPerIncrementalTree;
    const netQaly=benefitQaly-harmQaly;
    const modeledGrossResourcesUsd=i.giftUsd*s.grossResourceMultiplier;
    return {...s,incrementalTrees,finiteTreeYears,survivingDiscountedTreeYears,benefitQaly,harmQaly,netQaly,modeledGrossResourcesUsd,
      modeledOrdinaryGiftCostPer10Qaly:netQaly>0?i.giftUsd*10/netQaly:null,
      modeledGrossResourceCostPer10Qaly:netQaly>0?modeledGrossResourcesUsd*10/netQaly:null,
      verifiedMarginalGiftCostPer10Qaly:null,verifiedMarginalGrossCostPer10Qaly:null,
      bayQaly:netQaly*i.bayShare,sfQaly:netQaly*i.sfShare};
  });
  const weighted=rows.reduce((a,r)=>{a.netQaly+=r.weight*r.netQaly;a.positiveQaly+=r.weight*Math.max(r.netQaly,0);a.modeledGrossResourcesUsd+=r.weight*r.modeledGrossResourcesUsd;return a;},{netQaly:0,positiveQaly:0,modeledGrossResourcesUsd:0});
  weighted.modeledOrdinaryGiftCostPer10Qaly=weighted.netQaly>0?i.giftUsd*10/weighted.netQaly:null;
  weighted.positiveOnlyModeledGiftCostPer10Qaly=weighted.positiveQaly>0?i.giftUsd*10/weighted.positiveQaly:null;
  weighted.modeledGrossResourceCostPer10Qaly=weighted.netQaly>0?weighted.modeledGrossResourcesUsd*10/weighted.netQaly:null;
  const favorable=rows.find(r=>r.name==='favorable');
  weighted.favorableTailQalyContribution=favorable?favorable.weight*favorable.netQaly:0;
  weighted.favorableTailShareOfNetQaly=weighted.netQaly===0?null:weighted.favorableTailQalyContribution/weighted.netQaly;
  weighted.bayImpactShare=weighted.netQaly===0?null:i.bayShare;weighted.sfImpactShare=weighted.netQaly===0?null:i.sfShare;
  weighted.verifiedMarginalGiftCostPer10Qaly=null;weighted.verifiedMarginalGrossCostPer10Qaly=null;
  const nonFavorable=rows.filter(r=>r.name!=='favorable');const nonFavorableWeight=nonFavorable.reduce((a,r)=>a+r.weight,0);const nonFavorableQaly=nonFavorable.reduce((a,r)=>a+r.weight*r.netQaly,0)/nonFavorableWeight;
  return {inputs:i,giftShare,realizedWholeOrganizationExpensePerTree,giftLinkedTreeEquivalents,scenarios:rows,weighted,
    noFavorableTail:{netQaly:nonFavorableQaly,modeledOrdinaryGiftCostPer10Qaly:nonFavorableQaly>0?i.giftUsd*10/nonFavorableQaly:null},
    unknownExternalResources:['volunteer time not reported in a matched FY2024 valuation','city tree maintenance after FUF establishment care','resident and property-owner time','water and downstream sidewalk or infrastructure costs'],
    verdict:'PUBLISH AS UNFAVORABLE/UNCERTAIN: verified SF implementation, but QALY per surviving tree-year is an unvalidated analyst bridge.'};
}

if(import.meta.url===`file://${process.argv[1]}`)console.log(JSON.stringify(calculate(),null,2));
