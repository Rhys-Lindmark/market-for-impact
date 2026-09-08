// Benchmark conversions, not GiveWell-produced QALYs or forecasts for unrestricted gifts.
export function benchmarkConversion(costPerLife,qalyPerLife,delayYears=0,discount=.03){
 if(![costPerLife,qalyPerLife,delayYears,discount].every(Number.isFinite)||costPerLife<=0||qalyPerLife<=0||delayYears<0||delayYears>150||discount<0||discount>1)throw Error('Invalid benchmark conversion');
 const giftTimeQalyPerLife=qalyPerLife/(1+discount)**delayYears;
 return {giftTimeQalyPerLife,usdPerQaly:costPerLife/giftTimeQalyPerLife,usdPer10Qalys:10*costPerLife/giftTimeQalyPerLife};
}
export function finiteSurvivalQaly({years=40,survival=.99,utility=.85,persistence=.8,discount=.03}={}){
 if(!Number.isInteger(years)||years<0||years>150||![survival,utility,persistence,discount].every(n=>Number.isFinite(n)&&n>=0&&n<=1))throw Error('Invalid survival prior');
 let q=0;for(let k=1;k<=years;k++)q+=utility*persistence*(survival/(1+discount))**(k-.5);return q;
}
export const givewellBenchmarks=[
 {slug:'against-malaria-foundation',organization:'Against Malaria Foundation',givewellCostPerLife:5500,independentCash:3000,independentDeaths:.240975,independentUsdPer10Qalys:9720.187},
 {slug:'new-incentives',organization:'New Incentives',givewellCostPerLife:4500,independentCash:10000,independentDeaths:.1944,independentUsdPer10Qalys:43072.99777},
].map(r=>({...r,independentCostPerLife:r.independentCash/r.independentDeaths,finiteQalyPerLife:finiteSurvivalQaly(),sameSurvivalConversion:benchmarkConversion(r.givewellCostPerLife,finiteSurvivalQaly()),illustrative50Conversion:benchmarkConversion(r.givewellCostPerLife,50)}));
