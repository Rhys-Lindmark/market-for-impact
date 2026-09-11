import {calculate as historicalCalculate,anchors,scenarios,modelVersion as historicalVersion} from './pacific-hearing-connection-model.mjs';
export {anchors,scenarios};
export const modelVersion='pacific-hearing-connection-depth-v2-unchanged-base';
// The returned historical modelVersion is deliberately retained for exact full-result parity.
// V2 metadata and diagnostics are outside that frozen result, not a covert coefficient revision.
export function calculate(options={}) {
 if(!options||typeof options!=='object'||Array.isArray(options))throw new TypeError('options');
 const worlds=options.worlds??scenarios;
 if(options.worlds===null||!Array.isArray(worlds)||!worlds.length)throw new TypeError('worlds');
 const ids=new Set();
 for(const s of worlds){if(!s||typeof s!=='object'||Array.isArray(s)||typeof s.id!=='string'||!s.id.trim()||ids.has(s.id.trim()))throw new TypeError('world identity');ids.add(s.id.trim());}
 const result=historicalCalculate(options);
 if(result.favorableShareOfSignedQ!==null&&!Number.isFinite(result.favorableShareOfSignedQ))throw new RangeError('favorable share overflow');
 return result;
}
export const finances=Object.freeze([
 {year:2022,filing:'202333069349202103',submitted:'2023-11-02',contributions:73611,fees:9484,revenue:83095,grants:0,salariesBenefits:65988,contractors:14619,occupancy:0,printing:708,other:6832,expense:88147,programExpense:72243,cashSavingsInvestments:226077,otherAssets:14689,assets:240766,liabilities:1768,netAssets:238998,inventory:0,pledgesReceivable:0},
 {year:2023,filing:'202442749349200414',submitted:'2024-09-30',contributions:141182,fees:14813,revenue:155995,grants:0,salariesBenefits:87715,contractors:10387,occupancy:205,printing:591,other:26332,expense:125230,programExpense:106445,cashSavingsInvestments:197081,otherAssets:74780,assets:271861,liabilities:2098,netAssets:269763,inventory:60200,pledgesReceivable:870},
 {year:2024,filing:'202502889349201655',submitted:'2025-10-15',contributions:140523,fees:15604,revenue:156127,grants:5000,salariesBenefits:85572,contractors:29475,occupancy:0,printing:847,other:63205,expense:184099,programExpense:157150,cashSavingsInvestments:163983,otherAssets:84281,assets:248264,liabilities:6473,netAssets:241791,inventory:45050,pledgesReceivable:26500,inventoryCostAdjustment:45900}
].map(Object.freeze));
const changed=fn=>scenarios.map(s=>fn({...s}));
export function diagnostics(){
 const cases={historical:historicalCalculate(),current:calculate(),
  noInventoryAdjustment:calculate({expense:anchors.expense-45900}),
  historical2023Expense:calculate({expense:125230}),
  doubleExpense:calculate({expense:anchors.expense*2}),
  utility06:calculate({worlds:changed(s=>({...s,utility:.06}))}),
  genericUtility01:calculate({worlds:changed(s=>({...s,utility:.01}))}),
  quarterYearCap:calculate({worlds:changed(s=>({...s,years:Math.min(s.years,.25)}))}),
  oneYearCap:calculate({worlds:changed(s=>({...s,years:Math.min(s.years,1)}))}),
  halfCourses:calculate({worlds:changed(s=>({...s,courses:s.courses*.5}))}),
  halfFunding:calculate({worlds:changed(s=>({...s,funding:s.funding*.5}))}),
  resourceAllowance50pct:calculate({expense:anchors.expense*1.5}),
  genericQuarterYear:calculate({worlds:changed(s=>({...s,utility:.01,years:Math.min(s.years,.25)}))})};
 const c=scenarios.find(s=>s.id==='central'), perAdditionalOffer=(c.utility*c.transfer*c.completion*c.years-c.harm)*c.bay;
 return{cases,thresholds:{centralNetBayQPerAdditionalOffer:perAdditionalOffer,additionalOffersPer10000GiftFor1m:.1/perAdditionalOffer,additionalOffersPer10000GiftFor100k:1/perAdditionalOffer,annualGrossOffersAtCentralFundingFor1m:anchors.expense/100000/perAdditionalOffer/c.funding,annualGrossOffersAtCentralFundingFor100k:anchors.expense/10000/perAdditionalOffer/c.funding},historicalVersion,verifiedCurrentBudget:null,verifiedUniqueFits:null,verifiedMarginalCapacity:null,completeResourceCost:null};
}
