// Independent candidate, NOT wired into published rankings pending acceptance.
// All local prevention, duration and health-gap inputs are analyst judgments.
// No health value is derived by subtracting cash from an inherited welfare total.
export const candidateVersion='prevention-independent-anchor-2026-10-01';
export const common={donorBudgetUSD:100000,netTenantShare:.8,baselineHouseholdResourcesUSD:50000,
 receiptDelayYears:.25,discountRate:.03,avoidedEpisodeProbability:.02,
 avoidedExposureYears:.25,noncashHealthGap:.025,adultEquivalentCount:1,
 fundingAdditionality:1,completionShare:1,portfolioShare:1,sfShare:1,bayShare:1,
 inducedBurdenExposureShare:0,recipientBurdenUSD:0,burdenDelayYears:.25};
export const organizationInputs={
 compass:{...common,costPerCaseUSD:(2008658/207)*(1+6951080/38222158),transferPerCaseUSD:1095985/207},
 hamilton:{...common,costPerCaseUSD:10000,transferPerCaseUSD:5000},
};
export function calculateCandidate(organization,overrides={}){
 if(!Object.hasOwn(organizationInputs,organization))throw new RangeError('Unknown prevention organization');
 const base=organizationInputs[organization];
 if(Object.keys(overrides).some(k=>!Object.hasOwn(base,k)))throw new RangeError('Unknown candidate input');
 const x={...base,...overrides};
 const shares=['netTenantShare','avoidedEpisodeProbability','noncashHealthGap','fundingAdditionality','completionShare','portfolioShare','sfShare','bayShare','inducedBurdenExposureShare'];
 if(Object.values(x).some(v=>!Number.isFinite(v)||v<0)||shares.some(k=>x[k]>1)||
  x.donorBudgetUSD<=0||x.donorBudgetUSD>100000||x.costPerCaseUSD<=0||x.baselineHouseholdResourcesUSD<=0||
  x.transferPerCaseUSD>x.costPerCaseUSD||x.recipientBurdenUSD>=x.baselineHouseholdResourcesUSD||x.sfShare>x.bayShare||
  x.avoidedExposureYears>.5||x.adultEquivalentCount>1||
  (x.transferPerCaseUSD===0&&x.avoidedEpisodeProbability>0))throw new RangeError('Invalid cost, dose, geography or benefit input');
 const cases=x.donorBudgetUSD/x.costPerCaseUSD;
 const assignedCases=cases*x.portfolioShare,additionalCases=assignedCases*x.fundingAdditionality*x.completionShare;
 const incomePerCase=.5*Math.log1p(x.netTenantShare*x.transferPerCaseUSD/x.baselineHouseholdResourcesUSD)/(1+x.discountRate)**x.receiptDelayYears;
 const healthPerCase=x.avoidedEpisodeProbability*x.avoidedExposureYears*x.noncashHealthGap*x.adultEquivalentCount/(1+x.discountRate)**(x.receiptDelayYears+x.avoidedExposureYears/2);
 const burdenPerCase=.5*Math.log1p(-x.recipientBurdenUSD/x.baselineHouseholdResourcesUSD)/(1+x.discountRate)**x.burdenDelayYears;
 const incomeEquivalentYears=additionalCases*incomePerCase+assignedCases*x.inducedBurdenExposureShare*burdenPerCase;
 const noncashHealthProxyYears=additionalCases*healthPerCase;
 const combinedYears=incomeEquivalentYears+noncashHealthProxyYears;
 const region=share=>{
  const years=combinedYears*share,price=years>0?10*x.donorBudgetUSD/years:null;
  if(!Number.isFinite(years)||(price!==null&&!Number.isFinite(price)))throw new RangeError('Nonfinite regional candidate result');
  return {combinedYears:years,costPerBetterLifeUSD:price};
 };
 const result={candidateVersion,organization,inputs:x,cases,additionalCases,incomePerCase,healthPerCase,burdenPerCase,
  incomeEquivalentYears,noncashHealthProxyYears,combinedYears,status:combinedYears>0?'positive':combinedYears<0?'harm':'null',
  costPerBetterLifeUSD:region(1).costPerBetterLifeUSD,sf:region(x.sfShare),bay:region(x.bayShare)};
 if(Object.values(result).some(v=>typeof v==='number'&&!Number.isFinite(v)))throw new RangeError('Nonfinite candidate result');
 return result;
}
