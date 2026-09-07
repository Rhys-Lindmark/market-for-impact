export function fallsCourseModel({courseCost,hypothesizedEndpointUtility,horizonYears,onsetFraction,localTransfer,additionality,giftUsd=100000}) {
  for(const [key,value] of Object.entries({courseCost,hypothesizedEndpointUtility,horizonYears,onsetFraction,localTransfer,additionality,giftUsd})) if(!Number.isFinite(value)) throw new RangeError(key+' must be finite');
  if(courseCost<=0||horizonYears<0||giftUsd<0||[onsetFraction,localTransfer,additionality].some(x=>x<0||x>1)) throw new RangeError('Invalid cost, horizon or fraction');
  const qalysPerCourse=hypothesizedEndpointUtility*horizonYears*onsetFraction*localTransfer*additionality;
  return {qalysPerCourse,costPerTenQalys:qalysPerCourse>0?10*courseCost/qalysPerCourse:null,additionalQalys:giftUsd/courseCost*qalysPerCourse};
}
