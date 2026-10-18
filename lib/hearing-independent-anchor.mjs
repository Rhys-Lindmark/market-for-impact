export const central={costUSD:1500,utility:.11,clinicalTransfer:.5,completion:.8,funding:.5,delay:.25,duration:.75,retainedClinicalBenefit:.85,withoutEquivalentCare:.8,survival:.98,discount:.03,earnerShare:.1,netResourceGain:.02,incomeExposure:.8,incomeDelay:.25,incomeDuration:.75,overlapHealthRetention:.9,sharedHarm:0,donorHarm:0,portfolioShare:1,bayShare:1,sfShare:1};
export function calculate(overrides={}){
 if(!overrides||typeof overrides!=='object'||Array.isArray(overrides)||Object.keys(overrides).some(k=>!Object.hasOwn(central,k)))throw new RangeError('inputs');
 const x={...central,...overrides};
 if(Object.entries(x).some(([k,v])=>!Number.isFinite(v)||(k!=='netResourceGain'&&k!=='utility'&&v<0))||x.costUSD<=0||Math.abs(x.utility)>1||x.netResourceGain<=-1||x.netResourceGain>1||x.delay>1||x.duration>1||x.delay+x.duration>1||x.discount>1||x.sfShare>x.bayShare||['clinicalTransfer','completion','funding','retainedClinicalBenefit','withoutEquivalentCare','survival','earnerShare','incomeExposure','overlapHealthRetention','portfolioShare','bayShare','sfShare'].some(k=>x[k]>1))throw new RangeError('scope');
 const r=Math.log1p(x.discount),integral=Math.exp(-r*x.delay)*(r===0?x.duration:-Math.expm1(-r*x.duration)/r);
 const clinicalYears=integral*x.retainedClinicalBenefit*x.withoutEquivalentCare*x.survival;
 if(x.incomeDelay>1||x.incomeDuration>1||x.incomeDelay+x.incomeDuration>1)throw new RangeError('income horizon');
 const incomeIntegral=Math.exp(-r*x.incomeDelay)*(r===0?x.incomeDuration:-Math.expm1(-r*x.incomeDuration)/r);
 const income=.5*x.funding*x.completion*x.earnerShare*(incomeIntegral*x.incomeExposure)*Math.log1p(x.netResourceGain)*x.portfolioShare;
 const clinicalCredit=x.utility*x.clinicalTransfer*x.completion*clinicalYears;
 const overlap=clinicalCredit>0&&income>0?x.overlapHealthRetention:1;
 const health=(x.funding*(clinicalCredit*overlap-x.sharedHarm))*x.portfolioShare-x.donorHarm;
 const bayHealth=health*x.bayShare,bayIncome=income*x.bayShare,total=bayHealth+bayIncome;
 const result={inputs:x,discountedCalendarYears:integral,clinicalYears,incomeExposureYears:incomeIntegral*x.incomeExposure,health,income,bayHealth,bayIncome,total,price:total>0?10*x.costUSD/total:null};
 if(Object.values(result).some(v=>typeof v==='number'&&!Number.isFinite(v)))throw new RangeError('nonfinite output');
 return result;
}
