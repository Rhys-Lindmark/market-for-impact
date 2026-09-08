function validate(s, keys) {
  for(const k of keys) if(!Number.isFinite(s[k]) || s[k]<0) throw new RangeError('Invalid '+k);
  for(const k of ['transfer','fundingAdditionality']) if(s[k]>1) throw new RangeError('Invalid '+k);
}
function result(cost,netQalys) {
  return { donorCost:cost,netQalys,costPerTenQalys:netQalys>0?10*cost/netQalys:null,
    maximumCostFor100k:10000*Math.max(0,netQalys),qalysPer100k:cost>0?100000*netQalys/cost:null };
}
export function cessationModel(s) {
  validate(s,['cost','extraQuitProbability','qalysPerQuitter','transfer','fundingAdditionality','harmQalys']);
  if(s.extraQuitProbability>1) throw new RangeError('Invalid quit probability');
  // Already discounted lifetime yield includes source relapse/background quitting. No second duration/relapse multiplier.
  return result(s.cost,s.extraQuitProbability*s.qalysPerQuitter*s.transfer*s.fundingAdditionality-s.harmQalys);
}
export function asthmaModel(s) {
  validate(s,['cost','extraSymptomFreeDays','utilityGap','equivalentYears','transfer','fundingAdditionality','harmQalys']);
  if(s.extraSymptomFreeDays>365||s.utilityGap>1||s.equivalentYears>1) throw new RangeError('Invalid asthma horizon or health state');
  return result(s.cost,s.extraSymptomFreeDays/365*s.utilityGap*s.equivalentYears*s.transfer*s.fundingAdditionality-s.harmQalys);
}
