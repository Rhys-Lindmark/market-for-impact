// Accepted independent planning anchor; current adapter owns report/ranking aliases.
// Explicit local planning priors, not measured reach, rescue or income effects.
export const central={giftUSD:1000,annualCashExpenseUSD:40000,annualTwoDevicePacks:1500,readyShare:.5,packsPerUniqueHolder:3,
 riskNetworkShare:.5,fundingResponse:.5,purchaserShare:.05,netPurchaserSavingUSD:19,baselineAnnualResourcesUSD:50000,
 annualOverdoseEvents:.5,fatalityWithoutRescue:.1,baselineEffectiveRescue:.8,rescueIncrement:.04,otherMortalityHazard:.06,
 postHazard:.07,activeYears:1,horizonYears:10,utility:.65,discount:.03,serviceDelayYears:0,harmPerAddedRiskPerson:.00002,
 incomeReceiptYear:.5,healthBayShare:.95,incomeBayShare:.95,burdenBayShare:.95,inducedBurdenExposure:0,burdenUSD:5,burdenReceiptYear:0,portfolioShare:1};
const integral=(h,t)=>h===0?t:-Math.expm1(-h*t)/h;
export function calculate(overrides={}){
 if(!overrides||typeof overrides!=='object'||Array.isArray(overrides))throw new RangeError('HOPE inputs must be an object');
 if(Object.keys(overrides).some(k=>!Object.hasOwn(central,k)))throw new RangeError('Unknown HOPE candidate input');
 const x={...central,...overrides};
 const signed=['rescueIncrement','netPurchaserSavingUSD'];
 if(Object.entries(x).some(([k,v])=>!Number.isFinite(v)||(!signed.includes(k)&&v<0))||
  ['readyShare','riskNetworkShare','fundingResponse','purchaserShare','fatalityWithoutRescue','baselineEffectiveRescue','utility','healthBayShare','incomeBayShare','burdenBayShare','inducedBurdenExposure','portfolioShare'].some(k=>x[k]>1)||
  x.giftUSD>1000||x.annualCashExpenseUSD<=0||x.packsPerUniqueHolder<1||x.annualTwoDevicePacks>100000||
  x.baselineAnnualResourcesUSD<=0||x.baselineAnnualResourcesUSD+x.netPurchaserSavingUSD<=0||x.burdenUSD>=x.baselineAnnualResourcesUSD||
  x.baselineEffectiveRescue+x.rescueIncrement<0||x.baselineEffectiveRescue+x.rescueIncrement>1||x.activeYears>1||
  x.horizonYears<1||x.horizonYears>20||x.harmPerAddedRiskPerson>.1||x.annualOverdoseEvents>10||x.otherMortalityHazard>1||x.postHazard>1||x.discount>1||x.serviceDelayYears>20||x.incomeReceiptYear>20||x.burdenReceiptYear>20)throw new RangeError('Invalid HOPE candidate scope');
 const rate=Math.log1p(x.discount);
 const baselineHazard=x.otherMortalityHazard+x.annualOverdoseEvents*x.fatalityWithoutRescue*(1-x.baselineEffectiveRescue);
 const netHazardGain=x.annualOverdoseEvents*x.fatalityWithoutRescue*x.rescueIncrement;
 const supportedHazard=baselineHazard-netHazardGain;
 const activeSurvivalYears=integral(supportedHazard+rate,x.activeYears)-integral(baselineHazard+rate,x.activeYears);
 const survivalGap=Math.exp(-supportedHazard*x.activeYears)-Math.exp(-baselineHazard*x.activeYears);
 const postSupportSurvivalYears=survivalGap*Math.exp(-rate*x.activeYears)*integral(x.postHazard+rate,x.horizonYears-x.activeYears);
 const qPerPerson=x.utility*(activeSurvivalYears+postSupportSurvivalYears)*Math.exp(-rate*x.serviceDelayYears);
 const attemptedHolderEquivalents=x.giftUSD/x.annualCashExpenseUSD*x.annualTwoDevicePacks*x.readyShare/x.packsPerUniqueHolder;
 const readyUniqueHolderEquivalents=attemptedHolderEquivalents*x.fundingResponse;
 const healthRiskPersonEquivalents=readyUniqueHolderEquivalents*(1-x.purchaserShare)*x.riskNetworkShare;
 const healthAllRegionsYears=healthRiskPersonEquivalents*(qPerPerson-x.harmPerAddedRiskPerson)*x.portfolioShare;
 const incomeAllRegionsYears=readyUniqueHolderEquivalents*x.purchaserShare*.5*Math.log1p(x.netPurchaserSavingUSD/x.baselineAnnualResourcesUSD)/(1+x.discount)**x.incomeReceiptYear*x.portfolioShare;
 const burdenAllRegionsYears=attemptedHolderEquivalents*x.inducedBurdenExposure*.5*Math.log1p(-x.burdenUSD/x.baselineAnnualResourcesUSD)/(1+x.discount)**x.burdenReceiptYear*x.portfolioShare;
 const healthBayYears=healthAllRegionsYears*x.healthBayShare,incomeBayYears=incomeAllRegionsYears*x.incomeBayShare,burdenBayYears=burdenAllRegionsYears*x.burdenBayShare;
 const bayEquivalentYears=healthBayYears+incomeBayYears+burdenBayYears;
 const bayPrice=bayEquivalentYears>0?10*x.giftUSD/bayEquivalentYears:null;
 const out={inputs:x,baselineHazard,netHazardGain,activeSurvivalYears,postSupportSurvivalYears,qPerPerson,readyUniqueHolderEquivalents,healthRiskPersonEquivalents,healthAllRegionsYears,incomeAllRegionsYears,burdenAllRegionsYears,healthBayYears,incomeBayYears,burdenBayYears,bayEquivalentYears,bayPrice};
 if(Object.values(out).some(v=>typeof v==='number'&&!Number.isFinite(v)))throw new RangeError('Nonfinite HOPE candidate output');
 return out;
}
