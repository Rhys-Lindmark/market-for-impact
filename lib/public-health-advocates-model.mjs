// `historicalDppResourcePerParticipant` is an approximate US-dollar, three-year
// original efficacy-trial proxy, not a current Medi-Cal marginal delivery cost.
export const inputs={modelVersion:"public-health-advocates-v1",gift:100000,fy2024Expense:7533361,fy2024Revenue:8276428,fy2024NetAssets:2010180,fy2023Deficit:1628224,historicalDppResourcePerParticipant:2250};
export const scenarios=[
 {name:"harm",weight:.10,annualDppCoverageEquivalentCompleters:50,organizationAttribution:.02,qalyPerCompleter:-.005,giftDeployability:.15,realization:.70,partnerResourceMultiplier:1.10,bayShare:.20,sfShare:.02},
 {name:"null",weight:.40,annualDppCoverageEquivalentCompleters:0,organizationAttribution:0,qalyPerCompleter:0,giftDeployability:.20,realization:.75,partnerResourceMultiplier:1.10,bayShare:.20,sfShare:.02},
 {name:"central",weight:.45,annualDppCoverageEquivalentCompleters:500,organizationAttribution:.05,qalyPerCompleter:.05,giftDeployability:.25,realization:.80,partnerResourceMultiplier:1.25,bayShare:.20,sfShare:.02},
 {name:"favorableStress",weight:.05,annualDppCoverageEquivalentCompleters:2500,organizationAttribution:.15,qalyPerCompleter:.10,giftDeployability:.50,realization:.90,partnerResourceMultiplier:1.50,bayShare:.20,sfShare:.02}
];
export function calculate(i=inputs,ss=scenarios){
const inputs=i,scenarios=ss;
if(Math.abs(ss.reduce((a,s)=>a+s.weight,0)-1)>1e-12)throw new RangeError('scenario weights');
const giftShare=inputs.gift/inputs.fy2024Expense;
const results=scenarios.map(s=>{const annualAttributedCompleters=s.annualDppCoverageEquivalentCompleters*s.organizationAttribution;const annualOrganizationQaly=annualAttributedCompleters*s.qalyPerCompleter;const giftAttributedCompleters=annualAttributedCompleters*giftShare*s.giftDeployability*s.realization;const giftQaly=giftAttributedCompleters*s.qalyPerCompleter;const deliveryResource=Math.abs(giftAttributedCompleters)*inputs.historicalDppResourcePerParticipant;const grossResources=inputs.gift*s.partnerResourceMultiplier+deliveryResource;return {...s,giftShare,annualAttributedCompleters,annualOrganizationQaly,giftAttributedCompleters,giftQaly,deliveryResource,grossResources,bayQaly:giftQaly*s.bayShare,sfQaly:giftQaly*s.sfShare,donorCostPer10Qaly:giftQaly>0?inputs.gift*10/giftQaly:null,grossCostPer10Qaly:giftQaly>0?grossResources*10/giftQaly:null,wholeOrgExpensePer10ScenarioQaly:annualOrganizationQaly>0?inputs.fy2024Expense*10/annualOrganizationQaly:null};});
const weighted=results.reduce((a,r)=>{a.giftQaly+=r.weight*r.giftQaly;a.bayQaly+=r.weight*r.bayQaly;a.sfQaly+=r.weight*r.sfQaly;a.grossResources+=r.weight*r.grossResources;return a;},{giftQaly:0,bayQaly:0,sfQaly:0,grossResources:0});
weighted.donorCostPer10Qaly=weighted.giftQaly>0?inputs.gift*10/weighted.giftQaly:null;weighted.grossCostPer10Qaly=weighted.giftQaly>0?weighted.grossResources*10/weighted.giftQaly:null;weighted.bayImpactShare=weighted.giftQaly>0?weighted.bayQaly/weighted.giftQaly:null;weighted.sfImpactShare=weighted.giftQaly>0?weighted.sfQaly/weighted.giftQaly:null;weighted.favorableShareOfSignedExpectedQaly=weighted.giftQaly>0?results[3].weight*results[3].giftQaly/weighted.giftQaly:null;
const nw=scenarios[0].weight+scenarios[1].weight+scenarios[2].weight;const nq=(results[0].weight*results[0].giftQaly+results[1].weight*results[1].giftQaly+results[2].weight*results[2].giftQaly)/nw;
return {inputs,scenarios:results,weighted,noFavorable:{giftQaly:nq,donorCostPer10Qaly:nq>0?inputs.gift*10/nq:null}};
}
