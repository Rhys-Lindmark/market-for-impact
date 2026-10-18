// Integrate as lib/nems-current-model.mjs. Static relative imports remain portable.
// Original engine and inputs are read-only historical dependencies, not rewritten.
import {hbvRetentionModel} from './hbv-retention-model.mjs';
import {incomeHealthyYearEquivalent} from './income-health-equivalence.mjs';
import oldInputs from '../data/san-francisco/nems-hbv-cea-v1.json' with {type:'json'};
export const modelVersion='nems-conditional-care-net-resources-2026-10-04';
export const centralInputs={...oldInputs.scenarios[1],bayShare:1,sfShare:null,healthIndependentShare:1,delayYears:0,baselineHouseholdResourcesUSD:50000,cashRows:null};
const fraction=(v,key,nullable=false)=>{if(nullable&&v===null)return;if(!Number.isFinite(v)||v<0||v>1)throw new RangeError(key);};
const finite=x=>{if(typeof x==='number'&&!Number.isFinite(x))throw new RangeError('nonfinite output');if(x&&typeof x==='object')Object.values(x).forEach(finite);};
// Net each mechanism BEFORE summing or applying a log. Positive common-path
// welfare may overlap health; a negative resource effect is never attenuated.
export function creditCashRows(rows){
 if(rows===null)return null;
 if(!Array.isArray(rows))throw new TypeError('cashRows must be array or null');
 return rows.map(row=>{
  if(!row||typeof row.mechanism!=='string'||!row.mechanism.trim()||!Number.isFinite(row.netResourceChangeUSD))throw new TypeError('cash row');
  fraction(row.positiveIndependentShare,'positiveIndependentShare');
  return {...row,creditedResourceChangeUSD:row.netResourceChangeUSD>0?row.netResourceChangeUSD*row.positiveIndependentShare:row.netResourceChangeUSD};
 });
}
export function calculate(overrides={}){
 if(!overrides||typeof overrides!=='object'||Array.isArray(overrides))throw new TypeError('overrides');
 const p={...centralInputs,...overrides};
 fraction(p.bayShare,'bayShare',true);fraction(p.sfShare,'sfShare',true);fraction(p.healthIndependentShare,'healthIndependentShare');
 if(p.sfShare!==null&&p.bayShare!==null&&p.sfShare>p.bayShare)throw new RangeError('SF cannot exceed Bay');
 if(!Number.isFinite(p.delayYears)||p.delayYears<0||!Number.isFinite(p.baselineHouseholdResourcesUSD)||p.baselineHouseholdResourcesUSD<=0)throw new RangeError('resources/delay');
 const old=hbvRetentionModel(p),rows=creditCashRows(p.cashRows);
 const netCashPerMonitoringPersonYearUSD=rows===null?null:rows.reduce((s,r)=>s+r.creditedResourceChangeUSD,0);
 if(netCashPerMonitoringPersonYearUSD!==null&&p.baselineHouseholdResourcesUSD+netCashPerMonitoringPersonYearUSD<=0)throw new RangeError('nonpositive post-change resources');
 // Same closed panel; annual monitoring people are repeated person-years,
 // never a unique-patient count or completed antiviral treatment count.
 const annualAdditionalMonitoringPeople=p.panelSize*p.localMonitoringIncrement*p.fundingAdditionality;
 const delayDiscount=(1+p.discountRate)**p.delayYears;
 const additionalMonitoringPersonYears=annualAdditionalMonitoringPeople*p.fundedYears;
 const discountedAdditionalMonitoringPersonYears=old.years.reduce((s,y)=>s+(y.year<=p.fundedYears?annualAdditionalMonitoringPeople/(1+p.discountRate)**(y.year+p.delayYears):0),0);
 // Explicit scenario harm belongs to everyone in the initial panel. Neither
 // positive overlap nor monitoring/funding additionality suppresses that harm.
 const signedHealthYears=(old.grossQalys*p.healthIndependentShare-p.harmQalysPerPerson)*p.panelSize/delayDiscount;
 let cashEquivalentYears=null;
 if(rows!==null){cashEquivalentYears=0;for(let year=1;year<=p.fundedYears;year++)if(annualAdditionalMonitoringPeople>0)cashEquivalentYears+=incomeHealthyYearEquivalent({people:annualAdditionalMonitoringPeople,annualIncomeBeforeUSD:p.baselineHouseholdResourcesUSD,annualIncomeGainUSD:netCashPerMonitoringPersonYearUSD,years:1,delayYears:year+p.delayYears,discountRate:p.discountRate});}
 const donorCostUSD=old.donorCost*p.panelSize;
 const combinedEquivalentYears=cashEquivalentYears===null?null:signedHealthYears+cashEquivalentYears;
 const regional=(share)=>share===null?{healthYears:null,cashEquivalentYears:null,combinedEquivalentYears:null,partialHealthUsdPerTen:null,combinedUsdPerTen:null}:({healthYears:signedHealthYears*share,cashEquivalentYears:cashEquivalentYears===null?null:cashEquivalentYears*share,combinedEquivalentYears:combinedEquivalentYears===null?null:combinedEquivalentYears*share,partialHealthUsdPerTen:signedHealthYears*share>0?10*donorCostUSD/(signedHealthYears*share):null,combinedUsdPerTen:combinedEquivalentYears!==null&&combinedEquivalentYears*share>0?10*donorCostUSD/(combinedEquivalentYears*share):null});
 const out={modelVersion,inputs:p,scope:'Hypothetical restricted recurring HBV navigation; health is an unvalidated lifetime-model timing adaptation',donorCostUSD,annualAdditionalMonitoringPeople,additionalMonitoringPersonYears,discountedAdditionalMonitoringPersonYears,nativeUSDPerDiscountedAdditionalMonitoringPersonYear:discountedAdditionalMonitoringPersonYears>0?donorCostUSD/discountedAdditionalMonitoringPersonYears:null,cashRows:rows,netCashPerMonitoringPersonYearUSD,healthYears:signedHealthYears,cashEquivalentYears,combinedEquivalentYears,bay:regional(p.bayShare),sf:regional(p.sfShare),conditionalBayGeography:true,ordinaryFoundationGift:{allocationToHBV:null,bayShare:null,sfShare:null,netCashUSD:null,totalEquivalentYears:null,usdPerTen:null},knowledge:{marginalOffer:'unverified',monitoringIncrement:'judgment',healthTiming:'judgment',causalTransfer:'judgment',fundingAdditionality:'judgment',cash:rows===null?'unknown':'explicit conditional judgment',householdResources:'judgment',wholeGift:'unknown',capacity:'unknown',scenarioProbabilities:'not elicited'},historical:{costPerTenQalys:hbvRetentionModel(oldInputs.scenarios[1]).costPerTenQalys},weightedExpectation:null};
 finite(out);return out;
}
const row=(mechanism,netResourceChangeUSD,positiveIndependentShare=1)=>({mechanism,netResourceChangeUSD,positiveIndependentShare});
export const scenarios={central:{},explicitZeroCash:{cashRows:[]},positiveCash:{cashRows:[row('avoided illness costs net of care fees',100,.5),row('extra travel',-10),row('lost take-home pay/caregiver burden',-20)]},adverseCash:{cashRows:[row('extra uncovered fees',-100),row('extra travel',-50),row('lost take-home pay/caregiver burden',-100)]},severeCashHarm:{cashRows:[row('stress: net fees, travel and take-home pay loss',-2000)]},cashOnly:{causalTransfer:0,cashRows:[row('independent net household resource gain',100)]},allNull:{localMonitoringIncrement:0,causalTransfer:0,cashRows:[]},replacementHarm:{fundingAdditionality:0,harmQalysPerPerson:.01,cashRows:[]},overlapHarm:{healthIndependentShare:0,harmQalysPerPerson:.01,cashRows:[row('negative burden unaffected by overlap',-100,0)]},fiveYear:{fundedYears:5},oneYear:{fundedYears:1},noFundedYears:{fundedYears:0},costStress:{costMultiplier:3},delayFive:{delayYears:5},halfBay:{bayShare:.5},unknownGeography:{bayShare:null,sfShare:null},sfCohort:{bayShare:1,sfShare:1},optimistic:{...oldInputs.scenarios[0]},pessimistic:{...oldInputs.scenarios[2]}};
export function diagnostics(){return Object.fromEntries(Object.entries(scenarios).map(([k,v])=>[k,calculate(v)]));}
