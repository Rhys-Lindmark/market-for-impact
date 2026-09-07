export function youthMortalityModel({annualPlaceCost,annualFatalRisk,engagedRelativeReduction,engagement,additionality,discountedQalysPerDeath,giftUsd=100000}){
 for(const[k,v]of Object.entries({annualPlaceCost,annualFatalRisk,engagedRelativeReduction,engagement,additionality,discountedQalysPerDeath,giftUsd}))if(!Number.isFinite(v))throw new RangeError(k+' must be finite');
 if(annualPlaceCost<=0||giftUsd<0||discountedQalysPerDeath<0||engagedRelativeReduction < -1||engagedRelativeReduction>1||[annualFatalRisk,engagement,additionality].some(x=>x<0||x>1)||annualFatalRisk*(1-engagedRelativeReduction)>1)throw new RangeError('Invalid risk, effect or cost');
 const deathsAvertedPerPlace=annualFatalRisk*engagedRelativeReduction*engagement*additionality;
 const qalysPerPlace=deathsAvertedPerPlace*discountedQalysPerDeath;
 return{deathsAvertedPerPlace,qalysPerPlace,costPerTenQalys:qalysPerPlace>0?10*annualPlaceCost/qalysPerPlace:null,additionalQalys:giftUsd/annualPlaceCost*qalysPerPlace};
}
