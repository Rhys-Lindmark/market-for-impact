export function signedCourseQalyModel({costPerOfferedCourse,referenceQalys,transferRetention,additionality,giftUsd=100000}) {
  for (const [key,value] of Object.entries({costPerOfferedCourse,referenceQalys,transferRetention,additionality,giftUsd})) if (!Number.isFinite(value)) throw new RangeError(key+' must be finite');
  if (costPerOfferedCourse<=0 || giftUsd<0 || [transferRetention,additionality].some(value=>value<0||value>1)) throw new RangeError('Positive course cost and bounded fractions required');
  const qalysPerOfferedCourse=referenceQalys*transferRetention*additionality;
  return {qalysPerOfferedCourse,costPerTenQalys:qalysPerOfferedCourse>0?10*costPerOfferedCourse/qalysPerOfferedCourse:null,additionalQalys:giftUsd/costPerOfferedCourse*qalysPerOfferedCourse};
}
