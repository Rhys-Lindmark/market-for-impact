export const modelVersion='cca-ca-independent-at-berth-proposal-20261002';
export const defaultInputs=Object.freeze({gift:10000,fee:0,annualExpense:2494912,policyShare:.4,funding:.5,response:.05,realization:.5,assignment:1,activeYears:5,delay:.25,tailYears:10,hazard:.035,utility:.75,discount:.03,annualDeaths:230/12,annualAdmissions:72/12,annualED:116/12,resourceIncidence:0,admissionNet:100,edNet:25,annualHouseholds:0,annualNet:0,baseline:50000,resourceCA:1,healthCA:1,inducedHouseholds:0,inducedNet:0,inducedExposure:0});
const fractions=['policyShare','funding','response','realization','assignment','resourceIncidence','resourceCA','healthCA','inducedExposure','fee'];
export function calculate(overrides={}){
 if(!overrides||Array.isArray(overrides)||Object.getPrototypeOf(overrides)!==Object.prototype)throw Error('Plain overrides required');
 for(const[k,v]of Object.entries(overrides))if(!Object.hasOwn(defaultInputs,k)||!Number.isFinite(v))throw Error('Unknown/nonfinite input '+k);
 const i={...defaultInputs,...overrides};
 for(const k of fractions)if(i[k]<0||i[k]>1)throw Error('Invalid fraction '+k);
 if(i.gift<=0||i.gift>100000||i.annualExpense<=0||i.baseline<=0||i.admissionNet<=-i.baseline||i.edNet<=-i.baseline||i.annualNet<=-i.baseline||i.inducedNet<=-i.baseline||Math.abs(i.utility)>1||i.activeYears<0||i.activeYears>10||i.tailYears<0||i.tailYears>50||i.delay<0||i.delay>10||i.hazard<0||i.hazard>1||i.discount<0||i.discount>1||Math.abs(i.annualDeaths)>1000000||i.annualAdmissions<0||i.annualED<0||i.inducedHouseholds<0||i.annualHouseholds<0)throw Error('Invalid domain');
 const rho=Math.log1p(i.discount),rate=i.hazard+rho;
 const qDeath=i.utility*(rate? -Math.expm1(-rate*i.tailYears)/rate:i.tailYears);
 let exposureDiscount=0;
 for(let t=0;t<i.activeYears;t++){const y=Math.min(1,i.activeYears-t);exposureDiscount+=y/(1+i.discount)**(i.delay+t+y/2);}
 const annualEffort=i.gift*i.policyShare/i.annualExpense;
 const incrementalProbability=annualEffort*i.funding*i.response;
 if(!Number.isFinite(incrementalProbability)||incrementalProbability>1)throw Error('Incremental preservation probability must not exceed 1');
 const policyWeight=incrementalProbability*i.realization*i.assignment;
 const healthYears=policyWeight*i.annualDeaths*qDeath*exposureDiscount;
 // Admission/ED resource cohorts are baseline-alive, not earnings of extra survivors.
 // Counts are event-equivalents; unique-household conversion is an explicit incidence prior.
 const resourceYears=policyWeight*.5*(i.resourceIncidence*(i.annualAdmissions*Math.log1p(i.admissionNet/i.baseline)+i.annualED*Math.log1p(i.edNet/i.baseline))+i.annualHouseholds*Math.log1p(i.annualNet/i.baseline))*exposureDiscount;
 const inducedResourceYears=.5*i.inducedHouseholds*i.inducedExposure*Math.log1p(i.inducedNet/i.baseline)/(1+i.discount)**i.delay;
 const caHealthYears=healthYears*i.healthCA;
 const caIncomeEquivalentYears=resourceYears*i.resourceCA+inducedResourceYears;
 const total=caHealthYears+caIncomeEquivalentYears;
 const donorCost=i.gift*(1+i.fee);
 const result={inputs:i,annualEffort,incrementalProbability,policyWeight,qDeath,exposureDiscount,healthYears,incomeEquivalentYears:resourceYears,inducedResourceYears,caHealthYears,caIncomeEquivalentYears,caCombinedYears:total,editionQalys:caHealthYears,caUsdPerBetterLife:total>0?donorCost*10/total:null,donorCost};
 const finite=o=>{for(const v of Object.values(o))if(typeof v==='number'&&!Number.isFinite(v))throw Error('Nonfinite output');else if(v&&typeof v==='object')finite(v);};finite(result);return result;
}
export const scenarios=Object.freeze({central:{},noFunding:{funding:0},noPolicyResponse:{response:0},noPublicCounterfactualLoss:{realization:0},noAssignment:{assignment:0},healthNull:{utility:0},adverseHealth:{utility:-.05},halfResponse:{response:.025},higherResponse:{response:.1},lowerFutureProfile:{annualDeaths:230/24,annualAdmissions:3,annualED:116/24},higherFutureProfile:{annualDeaths:230/8,annualAdmissions:9,annualED:116/8},shortActive:{activeYears:2},longActive:{activeYears:10},fiveYearTail:{tailYears:5},twentyYearTail:{tailYears:20},thirtyYearTail:{tailYears:30},meanExpense:{annualExpense:2043139},positiveHouseholdResources:{resourceIncidence:.25,admissionNet:100,edNet:25},adverseHouseholdResources:{resourceIncidence:.25,admissionNet:-100,edNet:-25},baselineAliveProductivity:{annualHouseholds:1000,annualNet:50},consumerComplianceCosts:{annualHouseholds:1000000,annualNet:-.1},resourceOnly:{utility:0,resourceIncidence:.25},noEffect:{funding:0,inducedExposure:0},inducedFailedAccessCost:{funding:0,inducedHouseholds:1,inducedExposure:1,inducedNet:-50},halfCA:{healthCA:.5,resourceCA:.5},reference25K:{baseline:25000,resourceIncidence:.25},zeroDiscount:{discount:0}});
export const diagnostics=()=>Object.fromEntries([...Object.entries(scenarios),['adversePolicyMortality',{annualDeaths:-230/12}],['fullPhysicalLoss',{realization:1}]].map(([k,v])=>[k,calculate(v)]));
