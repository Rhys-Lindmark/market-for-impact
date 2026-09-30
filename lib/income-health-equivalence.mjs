// Coefficient Giving's published reference values, used as a welfare comparison
// rather than a claim that income is a measured clinical QALY or DALY.
export const referenceIncomeUSD=50000;
export const healthyYearValueCG=100000;

export function incomeHealthyYearEquivalent({people,annualIncomeBeforeUSD,annualIncomeGainUSD,years,causalShare=1,editionShare=1,independentShare=1}){
 const values=[people,annualIncomeBeforeUSD,annualIncomeGainUSD,years,causalShare,editionShare,independentShare];
 if(values.some(value=>!Number.isFinite(value))||people<=0||annualIncomeBeforeUSD<=0||annualIncomeBeforeUSD+annualIncomeGainUSD<=0||years<=0||[causalShare,editionShare,independentShare].some(value=>value<0||value>1))throw Error('Invalid income-equivalence inputs');
 return referenceIncomeUSD*people*years*Math.log1p(annualIncomeGainUSD/annualIncomeBeforeUSD)*causalShare*editionShare*independentShare/healthyYearValueCG;
}
