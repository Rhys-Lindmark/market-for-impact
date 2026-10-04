import {incomeHealthyYearEquivalent} from './income-health-equivalence.mjs';
export const personYears=[99515.4453125,99426.9375,99394.09375,99370.96875,99352.515625,99336.90625,99322.828125,99309.8671875,99297.9296875,99287.0625,99277.03125,99266.9375,99254.921875,99238.4296875,99215.109375,99183.71875,99144.1328125,99096.8125,99042.3828125,98981.515625,98914.2265625,98840.2109375,98759.953125,98674.828125,98586.1328125,98494.578125,98400.015625,98301.328125,98196.7734375,98084.75,97964.5234375,97836.203125,97700.1875,97556.78125,97406.1015625,97247.9375,97081.796875,96906.9453125,96722.625,96528.1875,96322.796875,96105.65625,95876.984375,95637.765625,95388.59375,95128.796875,94856.328125,94568.21875,94261.25,93932.5859375,93579.75,93200.609375,92793.6171875,92357.4375,91889.90625,91388.953125,90851.828125,90272.2734375,89641.75,88953.625,88205.7265625,87399.25,86535.7734375,85615.5,84637.1953125,83598.0703125,82490.4375,81313.03125,80068.6328125,78755.40625,77374.546875,75920.421875,74378.921875,72740.609375,70993.515625,69123.5390625,67121.6015625,65001.6015625,62720.3203125,60260.23828125,57635.15625,54835.16796875,51859.1796875,48721.53125,45448.8203125,42058.78125,38561.1328125,34959.2890625,31299.6484375,27636.396484375,24029.65234375,20542.7109375,17238.43359375,14175.068359375,11401.912109375,8955.375,6856.05615234375,5107.365234375,3695.98681640625,2594.1875,4708.6064453125];
export const survivorsAgeOne=99446.859375;
export const modelVersion='cribs-usa-donation-safe-sleep-resources-judgment-20261002';
export const defaults={gift:10000,allocation:.35,cashPackage:225,responseProbability:.5,conditionalAdditionality:.7,saferSleepShare:.18,mortalityRisk:.0015,riskRemoved:.4,geography:.995,partnerResource:125,purchaseShare:.2,purchaseCash:100,burdenCash:10,incomeBaseline:30000,incomeDelay:0,incomeDiscount:0,lifeUtility:.9,healthDiscount:.03,savedAge:.25,beneficiaryLifeFactor:1,independentHealthHarm:0,independentCashHarm:0,healthKnown:true,incomeKnown:true,responseKnown:true};
// A modest-gift conditional thought experiment, not a verified tranche or
// unlimited linear capacity. Every coefficient except the native Lx is judged.
export function calculate(overrides={}){
 if(!overrides||typeof overrides!=='object'||Array.isArray(overrides)||Object.getPrototypeOf(overrides)!==Object.prototype)throw Error('Plain overrides required');
 for(const key of Object.keys(overrides))if(!Object.hasOwn(defaults,key))throw Error('Unknown input '+key);
 const p={...defaults,...overrides};
 for(const[k,v]of Object.entries(p))if(k.endsWith('Known')){if(typeof v!=='boolean')throw Error(k);}else if(!Number.isFinite(v))throw Error(k);
 const bound=(k,low,high)=>{if(p[k]<low||p[k]>high)throw Error('Invalid '+k);};
 for(const k of ['allocation','responseProbability','conditionalAdditionality','saferSleepShare','mortalityRisk','geography','purchaseShare','lifeUtility','beneficiaryLifeFactor'])bound(k,0,1);
 bound('gift',1,10000);bound('cashPackage',1,1e6);bound('riskRemoved',-1,1);
 bound('incomeBaseline',1,1e9);bound('purchaseCash',0,p.incomeBaseline*10);
 bound('burdenCash',0,p.incomeBaseline*.99);bound('partnerResource',0,1e6);
 bound('incomeDelay',0,5);bound('incomeDiscount',0,.2);bound('healthDiscount',0,.2);bound('savedAge',0,1);
 bound('independentHealthHarm',0,1);bound('independentCashHarm',0,p.incomeBaseline*.99);
 if(p.saferSleepShare+p.purchaseShare>1)throw Error('Disjoint unsafe-sleep and safe-alternative purchaser shares exceed one');
 const packages=p.gift*p.allocation/p.cashPackage*p.responseProbability*p.conditionalAdditionality;
 const changed=packages*p.saferSleepShare,deaths=changed*p.mortalityRisk*p.riskRemoved;
 // Selected 2024 period-table age1 survivor proxy, not exact saved-infant
 // prognosis. No credit before judged prevented death age. Assumes remaining
 // first-year survival; later high-risk prognosis is tested separately.
 const life=(p.lifeUtility*(1-p.savedAge)/(1+p.healthDiscount)+personYears.slice(1).reduce((sum,lx,i)=>sum+p.lifeUtility*lx/survivorsAgeOne/(1+p.healthDiscount)**(i+2),0))*p.beneficiaryLifeFactor;
 const clinical=deaths*life*p.geography,independentHealthHarm=p.independentHealthHarm*p.gift/10000;
 const pathways=[
  {id:'safe-alternative-purchasers',people:packages*p.purchaseShare,gain:p.purchaseCash-p.burdenCash,delay:p.incomeDelay,discount:p.incomeDiscount},
  {id:'nonpurchasers',people:packages*(1-p.purchaseShare),gain:-p.burdenCash,delay:p.incomeDelay,discount:p.incomeDiscount},
  {id:'independent-cash-burden',people:p.gift/10000,gain:-p.independentCashHarm,delay:p.incomeDelay,discount:p.incomeDiscount}
 ].filter(x=>x.people>0&&x.gain!==0).map(x=>({...x,baseline:p.incomeBaseline,geography:p.geography,years:1}));
 const resource=pathways.reduce((sum,x)=>sum+incomeHealthyYearEquivalent({people:x.people,annualIncomeBeforeUSD:x.baseline,annualIncomeGainUSD:x.gain,years:x.years,causalShare:1,editionShare:x.geography,independentShare:1,delayYears:x.delay,discountRate:x.discount}),0);
 const health=p.healthKnown&&p.responseKnown?clinical-independentHealthHarm*p.geography:null;
 const income=p.incomeKnown&&p.responseKnown?resource:null;
 const combined=health===null||income===null?null:health+income;
 const institutionalCost=p.gift+packages*p.partnerResource;
 const price=(q,cost=p.gift)=>q!==null&&q>0?10*cost/q:null;
 const out={parameters:p,additionalPackages:packages,saferSleepTransitions:changed,deathsPrevented:deaths,lifeQalys:life,clinicalHealthYears:clinical,independentHealthHarm:independentHealthHarm*p.geography,healthYears:health,incomeYears:income,combinedYears:combined,price10:price(combined),healthOnlyPrice10:price(health),institutionalCost,institutionalPrice10:price(combined,institutionalCost),householdCashSavings:packages*p.purchaseShare*p.purchaseCash*p.geography,householdCashBurden:(packages*p.burdenCash+p.gift/10000*p.independentCashHarm)*p.geography,householdNetCash:(packages*(p.purchaseShare*p.purchaseCash-p.burdenCash)-p.gift/10000*p.independentCashHarm)*p.geography,pathways};
 for(const[k,v]of Object.entries(out))if(typeof v==='number'&&!Number.isFinite(v))throw Error('Nonfinite '+k);
 return out;
}
export const cases={
 central:{},
 favorable:{allocation:.7,cashPackage:175,responseProbability:.85,conditionalAdditionality:.9,saferSleepShare:.4,mortalityRisk:.003,riskRemoved:.6,geography:1,partnerResource:75,purchaseShare:.4,purchaseCash:150,incomeBaseline:25000},
 downside:{allocation:.2,cashPackage:450,responseProbability:.2,conditionalAdditionality:.3,saferSleepShare:.05,mortalityRisk:.0008,riskRemoved:.2,geography:.98,partnerResource:200,purchaseShare:.05,purchaseCash:75,burdenCash:25},
 allocationZero:{allocation:0},
 fundingZero:{responseProbability:0},
 provisionReplacement:{conditionalAdditionality:0},
 adverseSubstitution:{riskRemoved:-.1,purchaseShare:0,purchaseCash:0,burdenCash:25},
 safeAlternativesOnly:{saferSleepShare:0},
 mortalityNull:{riskRemoved:0},
 lowHazardRisk:{mortalityRisk:.000375},
 saferSleepHalf:{saferSleepShare:.09},
 suppliedCribUseIsNotCausal:{saferSleepShare:.93,purchaseShare:0},
 noPurchaseSaving:{purchaseShare:0},
 noHouseholdCash:{purchaseCash:0,burdenCash:0},
 noParticipationCash:{burdenCash:0},
 lowPurchaseIncidence:{purchaseShare:.1},
 lowBaselineIncome:{incomeBaseline:15000},
 cashReceiptOneYearLater:{incomeDelay:1,incomeDiscount:.03},
 utilityLower:{lifeUtility:.7},
 healthDiscountFivePercent:{healthDiscount:.05},
 undiscountedLife:{healthDiscount:0},
 beneficiarySurvivalUtilityLower:{beneficiaryLifeFactor:.7},
 savedAtBirth:{savedAge:0},
 savedAtSixMonths:{savedAge:.5},
 clinicalUtilityNull:{lifeUtility:0},
 geographyLower:{geography:.98},
 partnerResourceExcluded:{partnerResource:0},
 independentHarmsAtZero:{responseProbability:0,independentHealthHarm:.001,independentCashHarm:10},
 incomeUnknown:{incomeKnown:false},
 healthUnknown:{healthKnown:false},
 responseUnknown:{responseKnown:false},
 allUnknown:{healthKnown:false,incomeKnown:false,responseKnown:false}
};
