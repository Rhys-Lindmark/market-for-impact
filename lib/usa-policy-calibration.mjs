// Reproducible conditional policy pathways; inputs are not measured donor returns.
function nonnegative(p, keys) {
 for (const key of keys) if (!Number.isFinite(p[key]) || p[key] < 0) throw new RangeError('Invalid '+key);
}
function probabilities(p, keys) {
 nonnegative(p, keys);
 for (const key of keys) if (p[key] > 1) throw new RangeError('Invalid probability '+key);
}
function result(costUSD, allPopulationQalys, usShare) {
 const editionQalys=allPopulationQalys*usShare;
 return {costUSD,allPopulationQalys,editionQalys,pricePerBetterLife:editionQalys>0?10*costUSD/editionQalys:null};
}
export function evaluateClinicalPolicy(p) {
 nonnegative(p,['costUSD','patients','annualQalyGain','earlierYears','delayYears','discountRate']);
 probabilities(p,['reformProbability','approvalProbability','incrementalBenefitProbability','organizationAttribution','fundingAdditionality','usShare']);
 if (!(p.costUSD>0)) throw new RangeError('Cost must be positive');
 const q=p.patients*p.annualQalyGain*p.earlierYears*p.reformProbability*p.approvalProbability*p.incrementalBenefitProbability*p.organizationAttribution*p.fundingAdditionality/(1+p.discountRate)**p.delayYears;
 return result(p.costUSD,q,p.usShare);
}
export function evaluateEnergyPolicy(p) {
 nonnegative(p,['costUSD','capacityGW','earlierYears','deathsPerTWh','qalyPerDeath','delayYears','discountRate']);
 probabilities(p,['capacityFactor','netDisplacement','reformProbability','buildProbability','organizationAttribution','fundingAdditionality','usShare']);
 if (!(p.costUSD>0)) throw new RangeError('Cost must be positive');
 const annualTWh=p.capacityGW*8760*p.capacityFactor/1000;
 const q=annualTWh*p.earlierYears*p.netDisplacement*p.deathsPerTWh*p.qalyPerDeath*p.reformProbability*p.buildProbability*p.organizationAttribution*p.fundingAdditionality/(1+p.discountRate)**p.delayYears;
 return {...result(p.costUSD,q,p.usShare),annualTWh};
}
