import model from '../data/international/harmonized-calibration-v2.json' with {type:'json'};
export const data=model;
function number(x, name, min=0, max=Infinity) {
  if (!Number.isFinite(x) || x < min || x > max) throw new RangeError(`Invalid ${name}: ${x}`);
}
export function survivalQalys(curve, discountRate) {
  number(discountRate, 'discountRate');
  number(curve.years, 'years');
  if (!Number.isInteger(curve.years) || curve.years > 200) throw new RangeError('years must be integer0..200');
  number(curve.annualSurvival, 'annualSurvival', 0, 1);
  number(curve.utility, 'utility', 0, 1);
  let sum=0;
  for(let k=1;k<=curve.years;k++) sum += curve.utility * (curve.annualSurvival/(1+discountRate))**(k-.5);
  return sum;
}
function eventDiscount(years, r) {
  if (!Array.isArray(years) || !years.length) throw new RangeError('event schedule must be nonempty');
  years.forEach(t=>number(t,'eventYear'));
  return years.reduce((s,t)=>s+(1+r)**(-t),0)/years.length;
}
export function calculate(orgId, overrides={}) {
  const org=data.organizations[orgId];
  if(!org) throw new RangeError(`Unknown organization ${orgId}`);
  const allowed=new Set([...Object.keys(data.defaults),...Object.keys(org)]);
  for(const key of Object.keys(overrides)) if(!allowed.has(key)) throw new RangeError(`Unknown override ${key}`);
  const p={...data.defaults,...org,...overrides};
  for(const key of ['earlySurvival','olderSurvival']) p[key]={...data.defaults[key],...(overrides[key]??{})};
  number(p.giftUsd,'giftUsd',Number.MIN_VALUE);
  number(p.nativeUsdPerModeledDeath,'nativeUsdPerModeledDeath',Number.MIN_VALUE);
  number(p.discountRate,'discountRate');
  for(const key of ['coreShare','earlyDeathShare','survivalPersistenceMultiplier']) number(p[key],key,0,1);
  number(p.relativeMortalityYield,'relativeMortalityYield');
  for(const key of ['newSharedHarmPvQalysPerGift','newIndependentHarmPvQalysPerGift']) number(p[key],key);
  // This calibrated artifact does not parameterize unsupported local spillovers.
  if(p.directSfHealthShare!==0 || p.directBayHealthShare!==0) throw new RangeError('Direct local shares must remain zero');
  const earlyEventTimeQalys=survivalQalys(p.earlySurvival,p.discountRate);
  const olderEventTimeQalys=survivalQalys(p.olderSurvival,p.discountRate);
  const earlyGiftTimeQalys=earlyEventTimeQalys*eventDiscount(p.earlyEventYears,p.discountRate);
  const olderGiftTimeQalys=olderEventTimeQalys*eventDiscount(p.olderEventYears,p.discountRate);
  const giftTimeQalysPerNativeDeath=p.survivalPersistenceMultiplier*(p.earlyDeathShare*earlyGiftTimeQalys+(1-p.earlyDeathShare)*olderGiftTimeQalys);
  const nativeModeledDeaths=p.giftUsd*p.coreShare/p.nativeUsdPerModeledDeath*p.relativeMortalityYield;
  const grossQalys=nativeModeledDeaths*giftTimeQalysPerNativeDeath;
  const sharedHarmQalys=p.relativeMortalityYield*p.newSharedHarmPvQalysPerGift;
  const netQalys=grossQalys-sharedHarmQalys-p.newIndependentHarmPvQalysPerGift;
  return {orgId,inputs:p,earlyEventTimeQalys,olderEventTimeQalys,earlyGiftTimeQalys,olderGiftTimeQalys,giftTimeQalysPerNativeDeath,nativeModeledDeaths,grossQalys,sharedHarmQalys,independentHarmQalys:p.newIndependentHarmPvQalysPerGift,netQalys,usdPer10GlobalQalys:netQalys>0?10*p.giftUsd/netQalys:null,directSfQalys:0,directBayQalys:0,usdPer10DirectSfQalys:null,usdPer10DirectBayQalys:null,fullResourceUsdPer10Qalys:null};
}
export function scenarios(orgId) { return data.scenarios.map(s=>({scenarioId:s.id,...calculate(orgId,s.overrides)})); }
