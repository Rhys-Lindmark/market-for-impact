// Conditional marginal unrestricted-gift proxy. Values are judgments unless frozen original.
export const inputs={C:13035827,Y:3,N:1900000,r:.5,u:.5,q:.02,p:.1,a:.1,b:.25,start:2,T:2,discount:.03,g:474/1900,h:0,before:20000,avoidedOop:600,premiums:0,taxBenefitLoss:0,travelTime:100,otherBurden:0,positiveIndependentShare:.5,payerPeople:0,payerBefore:50000,payerLoss:0};
export function calculate(overrides={}){
 const x={...inputs,...overrides}; let A=0;for(let t=0;t<x.T;t++)A+=(1+x.discount)**-(x.start+t);
 const people=x.N*x.r*x.u*x.p*x.a*x.b*x.g;
 const rawNet=x.avoidedOop-x.premiums-x.taxBenefitLoss-x.travelTime-x.otherBurden;
 // Joint recipient ledger before logarithm; positive overlap only. Negative net entirely retained.
 const net=x.avoidedOop*x.positiveIndependentShare-x.premiums-x.taxBenefitLoss-x.travelTime-x.otherBurden;
 const editionQalys=x.g*x.b*(x.N*x.r*x.u*A*x.q*x.p*x.a-x.h);
 const incomeEquivalent=.5*people*A*Math.log1p(net/x.before)+.5*x.payerPeople*A*Math.log1p(-x.payerLoss/x.payerBefore);
 const costUSD=x.C*x.Y,combined=editionQalys+incomeEquivalent;
 return {x,A,people,rawNet,net,costUSD,editionQalys,allPopulationQalys:editionQalys/x.g,incomeEquivalent,combined,price10:combined>0?10*costUSD/combined:null};
}
export const scenarios=[['central',{}],['clinical-null-financial-only',{q:0}],['financial-null',{avoidedOop:0,travelTime:0}],['income-unknown',{}],['no-policy-change',{p:0}],['no-capacity-change',{b:0}],['negative-household-cost',{avoidedOop:0,travelTime:100}],['public-payer-displacement',{payerPeople:10000,payerLoss:100}],['positive-overlap-full',{positiveIndependentShare:1}],['annual-capacity-not-marginal',{b:1}],['no-clinical-with-household-burden',{q:0,avoidedOop:0,travelTime:100}]];
export function pathway(result,payer=false){const x=result.x;return {people:payer?x.payerPeople:result.people,annualIncomeBeforeUSD:payer?x.payerBefore:x.before,annualIncomeGainUSD:payer?-x.payerLoss:result.net,years:x.T,delayYears:x.start,discountRate:x.discount,causalShare:1,editionShare:1,independentShare:1,sourceIds:['california','hca','nhelp-income-oregon'],rationale:payer?'Signed hypothetical displaced taxpayer consumption attributable to funded work; numbers not observed. Disjoint CA payer group; no benefit credit for public gross payments.':'Joint household ledger: .5*$600 avoided spending less FULL $100 time/travel = $200 annually. All quantities including $20k baseline are hypothetical; no face-value debt credited. Negative costs counted fully.',counterfactual:'Other counsel, grants, administrators, alternative coverage and household behavior continue; people incorporate separate policy and funding additionality. Public/program costs remain excluded from recipient numerator.'};}
