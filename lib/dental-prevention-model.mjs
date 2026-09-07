export function dentalPreventionModel({costPerCourse,controlRisk,controlToTreatmentOddsRatio,transferRetention,additionality,untreatedCycles,painProbability,painQalyLossPerCycle,giftUsd=100000}){
 for(const[k,v]of Object.entries({costPerCourse,controlRisk,controlToTreatmentOddsRatio,transferRetention,additionality,untreatedCycles,painProbability,painQalyLossPerCycle,giftUsd}))if(!Number.isFinite(v)||v<0)throw new RangeError(k+' must be finite and nonnegative');
 if(costPerCourse<=0||controlToTreatmentOddsRatio<=0||[controlRisk,transferRetention,additionality,painProbability].some(v=>v>1)||untreatedCycles>4||painQalyLossPerCycle>.5)throw new RangeError('Invalid probability, cost or two-year cycle bound');
 const treatedRisk=controlRisk/(controlToTreatmentOddsRatio*(1-controlRisk)+controlRisk),riskDifference=controlRisk-treatedRisk;
 const qalysPerCourse=riskDifference*transferRetention*additionality*untreatedCycles*painProbability*painQalyLossPerCycle;
 return{treatedRisk,riskDifference,qalysPerCourse,costPerTenQalys:qalysPerCourse>0?10*costPerCourse/qalysPerCourse:null,additionalQalys:giftUsd/costPerCourse*qalysPerCourse};
}
