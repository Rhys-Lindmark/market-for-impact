export function roomTurnoverModel({costPerTurnover,daysAccelerated,occupancyRealization,additionality,utilityGain,giftUsd=100000}){
 for(const[k,v]of Object.entries({costPerTurnover,daysAccelerated,occupancyRealization,additionality,utilityGain,giftUsd}))if(!Number.isFinite(v))throw new RangeError(k+' must be finite');
 if(costPerTurnover<=0||daysAccelerated<0||daysAccelerated>365||giftUsd<0||utilityGain < -1||utilityGain>1||[occupancyRealization,additionality].some(x=>x<0||x>1))throw new RangeError('Invalid bounded input');
 const qalysPerTurnover=daysAccelerated/365*occupancyRealization*additionality*utilityGain;
 return{qalysPerTurnover,costPerTenQalys:qalysPerTurnover>0?10*costPerTurnover/qalysPerTurnover:null,additionalQalys:giftUsd/costPerTurnover*qalysPerTurnover};
}
