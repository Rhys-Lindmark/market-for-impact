import {calculateCandidate,organizationInputs} from './prevention-independent-anchor.mjs';
export function createCurrentPreventionModel(organization,firstCalibration){
 const central=organizationInputs[organization];
 const modelVersion=`${organization}-independent-health-income-2026-10-01`;
 const sharedSupportLoading=organization==='compass'?1+6951080/38222158:1+4976124/13822877;
 const calculate=(overrides={})=>{
  const r=calculateCandidate(organization,overrides),old=firstCalibration();
  const cashEquivalentYears=r.additionalCases*r.incomePerCase;
  const recipientBurdenYears=r.incomeEquivalentYears-cashEquivalentYears;
  const region=share=>({...r[share],noncashProxyYears:r.noncashHealthProxyYears*r.inputs[share+'Share'],incomeEquivalentYears:r.incomeEquivalentYears*r.inputs[share+'Share']});
  return {...r,modelVersion,cashPerCase:r.incomePerCase,healthPerCase:r.healthPerCase,
   noncashProxyYears:r.noncashHealthProxyYears,cashEquivalentYears,recipientBurdenYears,
   sf:region('sf'),bay:region('bay'),historical:{...old.historical,firstHealthIncomePriceUSD:old.costPerBetterLifeUSD}};
 };
 const scenarios={central:{},cashOnly:{noncashHealthGap:0},lowResources:{baselineHouseholdResourcesUSD:25000},highResources:{baselineHouseholdResourcesUSD:100000},
  lowerCapture:{netTenantShare:.5},higherHealth:{avoidedEpisodeProbability:.04,avoidedExposureYears:.5,noncashHealthGap:.1},
  cautious:{costPerCaseUSD:25000,transferPerCaseUSD:8000,netTenantShare:.5,baselineHouseholdResourcesUSD:75000,avoidedEpisodeProbability:.01,avoidedExposureYears:.1,noncashHealthGap:.01,fundingAdditionality:.5,recipientBurdenUSD:100,inducedBurdenExposureShare:1},
  favorable:{costPerCaseUSD:organization==='compass'?2008658/207:5000,transferPerCaseUSD:organization==='compass'?1095985/207:4000,netTenantShare:1,baselineHouseholdResourcesUSD:25000,avoidedEpisodeProbability:.04,avoidedExposureYears:.5,noncashHealthGap:.1},
  noFunding:{fundingAdditionality:0},replacementHarm:{fundingAdditionality:0,recipientBurdenUSD:250,inducedBurdenExposureShare:1},
  noCompletion:{completionShare:0},noPortfolio:{portfolioShare:0},noCash:{netTenantShare:0},allNull:{netTenantShare:0,noncashHealthGap:0},
  noTransfer:{transferPerCaseUSD:0,avoidedEpisodeProbability:0},higherDose:{costPerCaseUSD:15000,transferPerCaseUSD:12000},halfFunding:{fundingAdditionality:.5},
  alternativeCost:{costPerCaseUSD:organization==='compass'?central.costPerCaseUSD/sharedSupportLoading:central.costPerCaseUSD*sharedSupportLoading},
 };
 const diagnostics=()=>Object.fromEntries(Object.entries(scenarios).map(([id,x])=>[id,calculate(x)]));
 return {modelVersion,central,calculate,scenarios,diagnostics,sharedSupportLoading};
}
