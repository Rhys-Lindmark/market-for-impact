export function supportiveHealthModel({costPerPlace,utilityGain,effectiveYears,engagement,additionality,horizonYears=1,giftUsd=100000}){
 for(const[k,v]of Object.entries({costPerPlace,utilityGain,effectiveYears,engagement,additionality,horizonYears,giftUsd}))if(!Number.isFinite(v))throw new RangeError(k+' must be finite');
 if(costPerPlace<=0||horizonYears<=0||effectiveYears<0||effectiveYears>horizonYears||utilityGain < -1||utilityGain>1||giftUsd<0||[engagement,additionality].some(v=>v<0||v>1))throw new RangeError('Invalid bounded input');
 const qalysPerPlace=utilityGain*effectiveYears*engagement*additionality;return{qalysPerPlace,costPerTenQalys:qalysPerPlace>0?10*costPerPlace/qalysPerPlace:null,additionalQalys:giftUsd/costPerPlace*qalysPerPlace};
}
