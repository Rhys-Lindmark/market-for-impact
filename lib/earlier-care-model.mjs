export function earlierCareModel({costPerSupportedStart,utilityDifference,waitAvoidedYears,onsetFactor,transferRetention,additionality,giftUsd=100000}) {
 for(const [key,v]of Object.entries({costPerSupportedStart,utilityDifference,waitAvoidedYears,onsetFactor,transferRetention,additionality,giftUsd}))if(!Number.isFinite(v))throw new RangeError(key+' must be finite');
 if(costPerSupportedStart<=0||giftUsd<0||utilityDifference < -1||utilityDifference>1||waitAvoidedYears<0||waitAvoidedYears>.25||[onsetFactor,transferRetention,additionality].some(v=>v<0||v>1))throw new RangeError('Invalid bounded short-horizon input');
 const qalysPerSupportedStart=utilityDifference*waitAvoidedYears*onsetFactor*transferRetention*additionality;
 return {qalysPerSupportedStart,costPerTenQalys:qalysPerSupportedStart>0?10*costPerSupportedStart/qalysPerSupportedStart:null,additionalQalys:giftUsd/costPerSupportedStart*qalysPerSupportedStart};
}
