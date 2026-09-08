export function diabetesAccessModel(s){
 for(const k of ['cost','sourceQalys','transfer','fundingAdditionality','harmQalys'])
 if(!Number.isFinite(s[k])||s[k]<0)throw new RangeError('Invalid '+k);
 if(s.transfer>1||s.fundingAdditionality>1)throw new RangeError('Invalid fraction');
 // Source QALYs already integrate20 years, waning and3% discounting.
 const netQalys=s.fundingAdditionality===0?0:s.fundingAdditionality*(s.sourceQalys*s.transfer-s.harmQalys);
 return {donorCost:s.cost,netQalys,costPerTenQalys:netQalys>0?10*s.cost/netQalys:null,maximumCostFor100k:10000*Math.max(0,netQalys)};
}
