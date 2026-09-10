
export const inputs = {
  modelVersion: "calyouth-v1",
  gift: 100000,
  fy2025Expense: 1214190,
  fy2025Revenue: 1350074,
  fy2025NetAssets: 432706,
  annualCrisisContacts: 16740,
  contactPeriod: "2014-2023 annual average; calls, not unique people"
};

export const scenarios = [
  {name:"harm",weight:.10,giftDeployability:.20,nonDisplacedAccess:.25,qalyPerAdditionalContact:-.005,realization:.75,grossMultiplier:1.30,bayShare:.20,sfShare:.02},
  {name:"null",weight:.45,giftDeployability:.20,nonDisplacedAccess:0,qalyPerAdditionalContact:0,realization:.75,grossMultiplier:1.15,bayShare:.20,sfShare:.02},
  {name:"central",weight:.35,giftDeployability:.45,nonDisplacedAccess:.35,qalyPerAdditionalContact:.010,realization:.85,grossMultiplier:1.20,bayShare:.20,sfShare:.02},
  {name:"favorableStress",weight:.10,giftDeployability:.70,nonDisplacedAccess:.60,qalyPerAdditionalContact:.030,realization:.95,grossMultiplier:1.30,bayShare:.20,sfShare:.02}
];

export function calculate(i=inputs, ss=scenarios) {
const giftShare = i.gift / i.fy2025Expense;
const contactEquivalentsBeforeMarginality = i.annualCrisisContacts * giftShare;
const results = ss.map(s => {
  const giftLinkedContacts = contactEquivalentsBeforeMarginality * s.giftDeployability * s.nonDisplacedAccess * s.realization;
  const giftQaly = giftLinkedContacts * s.qalyPerAdditionalContact;
  const grossResources = i.gift * s.grossMultiplier;
  return {...s,giftShare,contactEquivalentsBeforeMarginality,giftLinkedContacts,giftQaly,grossResources,
    donorCostPer10Qaly: giftQaly > 0 ? i.gift * 10 / giftQaly : null,
    grossCostPer10Qaly: giftQaly > 0 ? grossResources * 10 / giftQaly : null,
    bayQaly: giftQaly * s.bayShare,
    sfQaly: giftQaly * s.sfShare
  };
});

const weighted = results.reduce((a,r) => {
  a.giftQaly += r.weight * r.giftQaly;
  a.grossResources += r.weight * r.grossResources;
  a.bayQaly += r.weight * r.bayQaly;
  a.sfQaly += r.weight * r.sfQaly;
  return a;
},{giftQaly:0,grossResources:0,bayQaly:0,sfQaly:0});
weighted.donorCostPer10Qaly = weighted.giftQaly>0 ? i.gift * 10 / weighted.giftQaly : null;
weighted.grossCostPer10Qaly = weighted.giftQaly>0 ? weighted.grossResources * 10 / weighted.giftQaly : null;
weighted.bayImpactShare = weighted.giftQaly>0 ? weighted.bayQaly / weighted.giftQaly : null;
weighted.sfImpactShare = weighted.giftQaly>0 ? weighted.sfQaly / weighted.giftQaly : null;
weighted.favorableShareOfSignedExpectedQaly = weighted.giftQaly>0 ? results[3].weight * results[3].giftQaly / weighted.giftQaly : null;

const noFavWeight = ss.slice(0,3).reduce((a,s)=>a+s.weight,0);
const noFavQaly = results.slice(0,3).reduce((a,r)=>a+r.weight*r.giftQaly,0)/noFavWeight;
const noFavGross = results.slice(0,3).reduce((a,r)=>a+r.weight*r.grossResources,0)/noFavWeight;

return {inputs:i,scenarios:results,weighted,noFavorable:{giftQaly:noFavQaly,grossResources:noFavGross,donorCostPer10Qaly:noFavQaly>0?i.gift*10/noFavQaly:null,grossCostPer10Qaly:noFavQaly>0?noFavGross*10/noFavQaly:null},verifiedMarginalGiftCostPer10Qaly:null,verifiedMarginalGrossCostPer10Qaly:null};
}
