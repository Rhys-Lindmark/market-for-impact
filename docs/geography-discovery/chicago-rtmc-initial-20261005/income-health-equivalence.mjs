// Coefficient Giving's published reference values, used as a welfare comparison
// rather than a claim that income is a measured clinical QALY or DALY.
export const referenceIncomeUSD=50000;
export const healthyYearValueCG=100000;

export function incomeHealthyYearEquivalent({people,annualIncomeBeforeUSD,annualIncomeGainUSD,years,causalShare=1,editionShare=1,independentShare=1,delayYears=0,discountRate=0}){
 const values=[people,annualIncomeBeforeUSD,annualIncomeGainUSD,years,causalShare,editionShare,independentShare];
 if(values.some(value=>!Number.isFinite(value))||people<=0||annualIncomeBeforeUSD<=0||annualIncomeBeforeUSD+annualIncomeGainUSD<=0||years<=0||[causalShare,editionShare,independentShare].some(value=>value<0||value>1)||!Number.isFinite(delayYears)||delayYears<0||!Number.isFinite(discountRate)||discountRate<0)throw Error('Invalid income-equivalence inputs');
 // Annual income is a flow: discount each benefit year, not the whole duration
 // at the same date. A fractional final year receives proportional weight.
 let discountedYears=0;
 for(let i=0;i<Math.ceil(years);i++)discountedYears+=Math.min(1,years-i)/(1+discountRate)**(delayYears+i);
 return referenceIncomeUSD*people*discountedYears*Math.log1p(annualIncomeGainUSD/annualIncomeBeforeUSD)*causalShare*editionShare*independentShare/healthyYearValueCG;
}
