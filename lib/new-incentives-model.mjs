export function newIncentivesModel(s,giftUsd=10000){
 const keys=['coreAllocation','cashCostPerEligibleCatchmentInfant','fundingAdditionality','effectiveBundleCoverageIncrease','residualUnvaccinatedDiseaseDeathRisk','bundleDiseaseMortalityEfficacy','survivalYears','persistentSurvivalFraction','utility','annualSurvival','discount','implementationDelayYears','sharedHarmQalyPerEligibleInfant','independentGiftHarmQaly','otherResourcesPerEligibleInfant','cashTransferPerEligibleInfant'];
 if(!Number.isFinite(giftUsd)||giftUsd<0||keys.some(k=>!Number.isFinite(s[k])||s[k]<0)||s.cashCostPerEligibleCatchmentInfant===0)throw new RangeError('Invalid or missing input');
 if(!Number.isInteger(s.survivalYears)||s.survivalYears>150||s.implementationDelayYears>150)throw new RangeError('Invalid horizon');
 for(const key of ['coreAllocation','fundingAdditionality','effectiveBundleCoverageIncrease','residualUnvaccinatedDiseaseDeathRisk','bundleDiseaseMortalityEfficacy','persistentSurvivalFraction','utility','annualSurvival'])if(s[key]>1)throw new RangeError('Invalid probability or utility');
 if(s.cashTransferPerEligibleInfant>s.cashCostPerEligibleCatchmentInfant)throw new RangeError('Transfers exceed included cash cost');
 const n=giftUsd*s.coreAllocation/s.cashCostPerEligibleCatchmentInfant;
 const deaths=n*s.fundingAdditionality*s.effectiveBundleCoverageIncrease*s.residualUnvaccinatedDiseaseDeathRisk*s.bundleDiseaseMortalityEfficacy;
 let life=0,calendar=0;for(let k=1;k<=s.survivalYears;k++)life+=s.persistentSurvivalFraction*s.utility*(s.annualSurvival/(1+s.discount))**(k-.5);
 for(let j=0;j<4;j++)calendar+=.25/(1+s.discount)**(s.implementationDelayYears+j+1);
 const q=deaths*life*calendar-n*s.fundingAdditionality*s.sharedHarmQalyPerEligibleInfant/(1+s.discount)**s.implementationDelayYears-s.independentGiftHarmQaly;
 const gross=giftUsd+n*s.otherResourcesPerEligibleInfant,proxy=gross-n*s.cashTransferPerEligibleInfant;
 const ratio=c=>q>0?10*c/q:null;
 return {eligibleCatchmentInfants:n,netGlobalQaly:q,donorCashUsd:giftUsd,globalUsdPerQaly:q>0?giftUsd/q:null,globalUsdPer10Qaly:ratio(giftUsd),grossAssociatedFiscalPackageUsd:gross,grossFiscalUsdPer10Qaly:ratio(gross),transferExcludedGrossResourceProxyUsd:proxy,transferExcludedProxyUsdPer10Qaly:ratio(proxy),directBayQaly:0,bayUsdPer10Qaly:null};
}
