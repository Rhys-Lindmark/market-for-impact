export function dentalAccessModel(s) {
 for(const k of ['cost','utilityGain','painYears','resolution','fundingAdditionality','harmQalys'])
  if(!Number.isFinite(s[k])||s[k]<0) throw new RangeError('Invalid '+k);
 for(const k of ['utilityGain','resolution','fundingAdditionality']) if(s[k]>1) throw new RangeError('Invalid '+k);
 // Pure replacement of identical care adds neither relief nor procedural harm.
 const relief=s.utilityGain*s.painYears*s.resolution;
 const netQalys=s.fundingAdditionality*(relief-s.harmQalys);
 return {donorCost:s.cost,netQalys,costPerTenQalys:netQalys>0?10*s.cost/netQalys:null,
 maximumCostFor100k:Math.max(0,netQalys)*10000,
 requiredPainYearsFor100k:s.utilityGain*s.resolution*s.fundingAdditionality>0?
 (s.cost/10000/s.fundingAdditionality+s.harmQalys)/(s.utilityGain*s.resolution):null};
}
