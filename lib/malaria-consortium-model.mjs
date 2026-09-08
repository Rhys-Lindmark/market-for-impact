import data from '../data/international/malaria-consortium-v1.json' with {type:'json'};
export {data};
export function calculate(o={}){
 const p={...data.defaults,...o};
 for(const [k,v] of Object.entries(p)) if(!Number.isFinite(v)||v<0) throw new RangeError(k);
 for(const k of Object.keys(o)) if(!(k in data.defaults)) throw new RangeError(k);
 for(const k of ['coreShare','earlyShare','earlyAnnualSurvival','olderAnnualSurvival','earlyUtility','olderUtility']) if(p[k]>1)throw new RangeError(k);
 if(!p.giftUsd||!p.nativeUsdPerDeath)throw new RangeError('positivecost');
 for(const k of ['earlyYears','olderYears'])if(!Number.isInteger(p[k])||p[k]>200)throw new RangeError(k);
 const life=(n,s,u)=>Array.from({length:n},(_,i)=>u*(s/(1+p.discountRate))**(i+.5)).reduce((a,b)=>a+b,0);
 const qPerDeath=(p.earlyShare*life(p.earlyYears,p.earlyAnnualSurvival,p.earlyUtility)+(1-p.earlyShare)*life(p.olderYears,p.olderAnnualSurvival,p.olderUtility))/(1+p.discountRate)**p.delayYears;
 const deaths=p.giftUsd*p.coreShare/p.nativeUsdPerDeath*p.relativeYield;
 const q=deaths*qPerDeath-p.relativeYield*p.sharedHarmPv-p.independentHarmPv;
 return {inputs:p,qPerDeath,deaths,globalQalys:q,usdPer10GlobalQalys:q>0?10*p.giftUsd/q:null,grossAssociatedUsdPer10Qalys:q>0?10*(p.giftUsd+p.extraGrossResourcesUsd)/q:null,fullResourceUsdPer10Qalys:null,sfQalys:0,bayQalys:0,usdPer10SfQalys:null,usdPer10BayQalys:null};
}
