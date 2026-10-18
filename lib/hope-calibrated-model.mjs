// Current adapter for the independent HOPE planning anchor.
// Root must preserve the replaced October1 wrapper as history before integration.
import {calculate as independent,central as anchorInputs} from './hope-independent-anchor.mjs';
import {calculate as frozenHistorical,costWorlds as historicalCostWorlds,deliveryWorlds as historicalDeliveryWorlds} from './hope-v2-model.mjs';
export {historicalCostWorlds,historicalDeliveryWorlds};
export const modelVersion='hope-independent-health-income-current-2026-10-01';
export const defaultInputs=Object.freeze({...anchorInputs});
export const rankingStatistic='central marginal scenario';
export const comparisonUnit='combined health/income-equivalent years';
export const currentEvidence=Object.freeze({reviewDate:'2026-10-01',listedSites:9,cumulativeClaimLowerBound:6000,
 annualExpense:null,annualUniqueRiskPeople:null,annualRescues:null,currentMarginalOffer:null});
export const incomeJudgment=Object.freeze({purchaseShare:.05,netSavingsUSD:19,baselineUSD:50000});
const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const price=(cost,years)=>{const p=years>0?10*cost/years:null;if(p!==null&&!Number.isFinite(p))throw new RangeError('Nonfinite HOPE price');return p;};
function resolvedInputs(options){
 if(!object(options))throw new TypeError('HOPE options must be an object.');
 for(const key of Object.keys(options))if(!['scope','inputs','gift','income'].includes(key))throw new TypeError('Unknown current HOPE option: '+key+'; old worlds/costs belong to the historical model.');
 const scope=options.scope??'marginal';if(!['marginal','annual'].includes(scope))throw new RangeError('scope');
 if(options.inputs!==undefined&&!object(options.inputs))throw new TypeError('inputs');
 const inputs={...defaultInputs,...options.inputs};
 for(const key of Object.keys(inputs))if(!Object.hasOwn(defaultInputs,key))throw new TypeError('Unknown anchor input: '+key);
 if(options.gift!==undefined){if(options.inputs&&Object.hasOwn(options.inputs,'giftUSD'))throw new TypeError('Specify gift once.');inputs.giftUSD=options.gift;}
 if(options.income!==undefined){
  if(!object(options.income))throw new TypeError('income');
  const map={purchaseShare:'purchaserShare',netSavingsUSD:'netPurchaserSavingUSD',baselineUSD:'baselineAnnualResourcesUSD'};
  for(const key of Object.keys(options.income)){
   if(!Object.hasOwn(map,key))throw new TypeError('Unknown income input');
   if(options.inputs&&Object.hasOwn(options.inputs,map[key]))throw new TypeError('Specify income once.');
   inputs[map[key]]=options.income[key];
  }
 }
 // Bound the additional clinical/planning controls to finite diagnostic scope.
 for(const [key,max] of Object.entries({annualOverdoseEvents:20,otherMortalityHazard:5,postHazard:5,
  discount:1,serviceDelayYears:10,incomeReceiptYear:10,burdenReceiptYear:10,packsPerUniqueHolder:10000}))
  if(typeof inputs[key]!=='number'||!Number.isFinite(inputs[key])||inputs[key]<0||inputs[key]>max)throw new RangeError(key+' outside supported diagnostic scope');
 if(scope==='annual'){
  if(options.gift!==undefined||(options.inputs&&Object.hasOwn(options.inputs,'giftUSD')))throw new TypeError('Annual linear diagnostic uses the supported $1,000 reference gift; do not supply a second gift.');
  inputs.giftUSD=1000;
 }
 return {scope,inputs};
}
function rowFrom(anchor,scale,costUSD,scope){
 const p=anchor.inputs;
 const healthYears=anchor.healthBayYears*scale;
 const incomeSavingsYears=anchor.incomeBayYears*scale,recipientBurdenYears=anchor.burdenBayYears*scale;
 const incomeYears=incomeSavingsYears+recipientBurdenYears,totalYears=anchor.bayEquivalentYears*scale;
 const healthAllYears=anchor.healthAllRegionsYears*scale,incomeAllYears=(anchor.incomeAllRegionsYears+anchor.burdenAllRegionsYears)*scale;
 const allQ=healthAllYears+incomeAllYears;
 const grossQ=anchor.healthRiskPersonEquivalents*anchor.qPerPerson*p.portfolioShare*scale;
 const harmQ=anchor.healthRiskPersonEquivalents*p.harmPerAddedRiskPerson*p.portfolioShare*scale;
 return {...anchor,id:'independent-central',costId:'planning_cost',deliveryId:'independent-central',
  scope,costUSD,scale,inputs:{...p},additionalPeople:anchor.healthRiskPersonEquivalents*scale,
  healthRiskPersonEquivalents:anchor.healthRiskPersonEquivalents*scale,
  readyUniqueHolderEquivalents:anchor.readyUniqueHolderEquivalents*scale,
  holderEquivalents:anchor.readyUniqueHolderEquivalents*scale,
  grossQ,harmQ,healthAllYears,incomeAllYears,allQ,
  healthYears,incomeYears,incomeSavingsYears,recipientBurdenYears,totalYears,
  // Legacy ranking/API aliases are combined welfare, NOT clinical net QALYs.
  bayQ:totalYears,bayCostPer10:price(costUSD,totalYears),usdPerBetterLife:price(costUSD,totalYears),
  healthBayYears:healthYears,incomeBayYears:incomeSavingsYears,burdenBayYears:recipientBurdenYears,
  bayEquivalentYears:totalYears,bayPrice:price(costUSD,totalYears),
  healthAllRegionsYears:healthAllYears,incomeAllRegionsYears:anchor.incomeAllRegionsYears*scale,
  burdenAllRegionsYears:anchor.burdenAllRegionsYears*scale,comparisonUnit,
  scaleBasis:scope==='annual'?'Linear replication of the supported small-gift planning estimate, with unchanged funding response; not validated annual output or donation capacity.':'Exploratory marginal gift, maximum $1,000; no verified tranche.',
 };
}
export function calculate(options={}){
 const {scope,inputs}=resolvedInputs(options),anchor=independent(inputs);
 const scale=scope==='annual'?inputs.annualCashExpenseUSD/1000:1;
 const costUSD=scope==='annual'?inputs.annualCashExpenseUSD:inputs.giftUSD;
 const centralScenario=rowFrom(anchor,scale,costUSD,scope);
 return {modelVersion,currentEvidence,rankingStatistic,comparisonUnit,scope,
  gift:costUSD,centralScenario,rows:[centralScenario],scenarioWeighting:'None; single conditional central, not the historical subjective matrix.',
  healthYears:centralScenario.healthYears,incomeYears:centralScenario.incomeYears,totalYears:centralScenario.totalYears,
  bayQ:centralScenario.bayQ,bayCostPer10:centralScenario.bayCostPer10,
  allQ:centralScenario.allQ,allCostPer10:price(costUSD,centralScenario.allQ),
  income:{purchaseShare:inputs.purchaserShare,netSavingsUSD:inputs.netPurchaserSavingUSD,baselineUSD:inputs.baselineAnnualResourcesUSD},
  verifiedMarginalFundingOffer:null,
  // History is separately labelled, never used in current rows or ranking.
  historicalHealthOnly:frozenHistorical(),
  historyNotice:'Frozen V2 health-only worlds remain historical. Root also preserves the replaced October1 health/income wrapper separately.',
  incomeBasis:'5% purchaser incidence and $50K baseline are explicit judgments; $19 retail anchor, one midpoint receipt, purchaser health removed. Signed extra-attempt burden independent of funding.',
 };
}
export function diagnostics(){
 const run=inputs=>calculate({inputs}).centralScenario;
 const values=(key,list)=>Object.fromEntries(list.map(v=>[v,run({[key]:v})]));
 return {
  basis:'Independent, finite, unweighted planning diagnostics; no empirical scenario probabilities.',
  horizonCases:values('horizonYears',[1,2,5,10,20]),
  activePeriodCases:values('activeYears',[.25,.5,1]),
  fundingCases:values('fundingResponse',[0,.1,.25,.5,1]),
  reachCases:values('riskNetworkShare',[.25,.5,.8]),
  purchaserCases:values('purchaserShare',[0,.05,.1,.2]),
  postHazardCases:values('postHazard',[.02,.047,.07,.1,.2]),
  expenseCases:values('annualCashExpenseUSD',[20000,40000,100000]),
  incomeCases:{
   central:run({}),zeroSavingsPurchasers:run({netPurchaserSavingUSD:0}),
   counterfactualPurchase:run({purchaserShare:.1,netPurchaserSavingUSD:19}),
   adversePickup:run({inducedBurdenExposure:1,burdenUSD:5}),
   negativeCash:run({netPurchaserSavingUSD:-5}),
   nullHealthPositiveIncome:run({rescueIncrement:0,harmPerAddedRiskPerson:0}),
   jointAdverse:run({rescueIncrement:0,inducedBurdenExposure:1,burdenUSD:5}),
  },
  noChange:run({fundingResponse:0,inducedBurdenExposure:0}),
  failedInducedAttempt:run({fundingResponse:0,inducedBurdenExposure:1}),
  noAssignment:run({portfolioShare:0}),
  negativeRescue:run({rescueIncrement:-.01}),
  annualLinearDiagnostic:calculate({scope:'annual'}),
  historicalHealthOnly:frozenHistorical(),
 };
}
