import model from '../data/san-francisco/ymca-portfolio-v1.json' with {type:'json'};
export {model as ymcaPortfolio};
export function ymcaPortfolioModel(s){
 const a=model.budget.allocations,gift=model.budget.giftUsd;
 for(const k of ['fitness','mental','family','dpp']){
  for(const [key,v] of Object.entries(s[k]))if(!Number.isFinite(v)||v<0||(key==='cost'&&v===0))throw new RangeError('Invalid '+k+'.'+key);
  for(const key of ['additionality','response','utility','transfer','baselineThreeYearRisk','relativeReduction','utilityLossPerYear'])if(key in s[k]&&s[k][key]>1)throw new RangeError(key);
 }
 if(!Number.isFinite(s.sfShare)||s.sfShare<0||s.sfShare>1)throw new RangeError('sfShare');
 for(const v of Object.values(s.donorHarm))if(!Number.isFinite(v)||v<0)throw new RangeError('harm');
 const f=s.fitness,n=s.mental,h=s.family,d=s.dpp;
 if(!Number.isInteger(d.diabetesDelayYears)||d.diabetesDelayYears>150)throw new RangeError('duration');
 const df=Array.from({length:d.diabetesDelayYears},(_,i)=>1.03**(-(3+i))).reduce((x,y)=>x+y,0);
 const fitnessQaly=a.fitness/f.cost*f.additionality*f.trialQaly*f.transfer;
 const mentalQaly=a.mental/n.cost*n.additionality*n.response*n.utility*n.effectiveYears;
 const familyQaly=a.family/h.cost*h.additionality*h.response*h.utility*h.effectiveYears;
 const dppQaly=a.dpp/d.cost*d.additionality*d.baselineThreeYearRisk*d.relativeReduction*d.utilityLossPerYear*df;
 const grossBayQaly=fitnessQaly+mentalQaly+familyQaly+dppQaly;
 const sfNetQaly=grossBayQaly*s.sfShare-s.donorHarm.sf,restBayNetQaly=grossBayQaly*(1-s.sfShare)-s.donorHarm.restBay;
 const bayIncludingSfNetQaly=sfNetQaly+restBayNetQaly,price=q=>q>0?10*gift/q:null;
 return {fitnessQaly,mentalQaly,familyQaly,dppQaly,grossBayQaly,sfNetQaly,restBayNetQaly,bayIncludingSfNetQaly,donorCost:gift,sfUsdPer10Qaly:price(sfNetQaly),bayUsdPer10Qaly:price(bayIncludingSfNetQaly)};
}
