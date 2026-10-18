import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
export const defaults = Object.freeze({gift:100000,taShare:978529/1746919,fundingResponse:.5,packetHours:40,loadedHourCost:200,packetCapacity:5,withActivation:.65,withoutActivation:.5,staffedHoursWeek:4,capacityWeeks:16,qualifiedFill:.75,sessionHours:1,sessionsCourse:12,completion:.7,addedCareShare:.5,utility:.04,healthDays:112,careDelay:.25,discount:.03,overlap:0,intakeHarm:.0005,newCareCash:-40,relocatedCash:156,newDropoutCash:-40,relocatedDropoutCash:-20,baselineConsumption:30000,resourceYears:1,resourceDelay:.25,independentHealthHarm:0,independentCashHarm:0,providerHourCost:200,providerSetup:1000,healthUnknown:false,incomeUnknown:false});
export function calculate(o={}) {
 if(o===null||Array.isArray(o)||Object.getPrototypeOf(o)!==Object.prototype)throw Error('Plain overrides required');
 for(const k of Object.keys(o))if(!(k in defaults))throw Error('Unknown override '+k);
 const p={...defaults,...o};
 const probabilities=['taShare','fundingResponse','withActivation','withoutActivation','qualifiedFill','completion','addedCareShare','overlap'];
 for(const [k,v] of Object.entries(p)) {
  if(['healthUnknown','incomeUnknown'].includes(k)){if(typeof v!=='boolean')throw Error(k);continue;}
  if(typeof v!=='number'||!Number.isFinite(v))throw Error(k);
  if(probabilities.includes(k)&&(v<0||v>1))throw Error(k);
 }
 for(const k of ['gift','packetHours','loadedHourCost','sessionHours','sessionsCourse','baselineConsumption','resourceYears'])if(p[k]<=0)throw Error(k);
 for(const k of ['packetCapacity','staffedHoursWeek','capacityWeeks','healthDays','careDelay','resourceDelay','discount','intakeHarm','independentHealthHarm','independentCashHarm','providerHourCost','providerSetup'])if(p[k]<0)throw Error(k);
 if(p.discount>1||p.utility < -1||p.utility>1||p.healthDays>730||p.resourceYears>5||p.capacityWeeks>52||p.staffedHoursWeek>40||p.sessionsCourse>52||p.packetHours>1000||p.loadedHourCost>10000||p.sessionHours>8||p.careDelay>10||p.resourceDelay>10||p.newCareCash<=-p.baselineConsumption||p.relocatedCash<=-p.baselineConsumption||Math.abs(p.newCareCash)>100000||Math.abs(p.relocatedCash)>100000)throw Error('Incoherent bound');
 const packets=Math.min(p.packetCapacity,p.gift*p.taShare*p.fundingResponse/(p.packetHours*p.loadedHourCost));
 const activationDelta=p.withActivation-p.withoutActivation;
 const blocks=packets*activationDelta;
 const initiated=blocks*p.staffedHoursWeek*p.capacityWeeks*p.qualifiedFill/(p.sessionHours*p.sessionsCourse);
 const completed=initiated*p.completion;
 const added=completed*p.addedCareShare, relocated=completed-added;
 const df=t=>Math.pow(1+p.discount,-t);
 const grossHealth=added*p.utility*p.healthDays/365*df(p.careDelay+p.healthDays/730);
 const overlapRemoved=Math.max(0,grossHealth)*p.overlap;
 // Per-initiation procedural burden belongs to the signed with-minus-without branch;
 // independent harms do not disappear when funding or completion becomes zero.
 const treatmentHarm=initiated*p.intakeHarm*df(p.careDelay);
 const healthYears=p.healthUnknown?null:grossHealth-overlapRemoved-treatmentHarm-p.independentHealthHarm;
 const resourceDf=df(p.resourceDelay+p.resourceYears/2);
 // Cash amounts occur once during the care episode; distribute the amount over
 // resourceYears of consumption, never repeat the full receipt each year.
 if(p.newCareCash<=-p.resourceYears*p.baselineConsumption||p.relocatedCash<=-p.resourceYears*p.baselineConsumption||p.independentCashHarm>=p.resourceYears*p.baselineConsumption)throw Error('Cash exceeds exposure baseline');
 const newCareIncome=.5*added*p.resourceYears*Math.log1p(p.newCareCash/(p.resourceYears*p.baselineConsumption))*resourceDf;
 const relocatedIncome=.5*relocated*p.resourceYears*Math.log1p(p.relocatedCash/(p.resourceYears*p.baselineConsumption))*resourceDf;
 const independentIncomeHarm=.5*p.resourceYears*Math.log1p(-p.independentCashHarm/(p.resourceYears*p.baselineConsumption))*resourceDf;
 const newDropout=(initiated-completed)*p.addedCareShare,relocatedDropout=(initiated-completed)*(1-p.addedCareShare);
 for(const k of ['newDropoutCash','relocatedDropoutCash'])if(Math.abs(p[k])>100000||p[k]<=-p.resourceYears*p.baselineConsumption)throw Error(k);
 const dropoutIncome=.5*p.resourceYears*(newDropout*Math.log1p(p.newDropoutCash/(p.resourceYears*p.baselineConsumption))+relocatedDropout*Math.log1p(p.relocatedDropoutCash/(p.resourceYears*p.baselineConsumption)))*resourceDf;
 const incomeYears=p.incomeUnknown?null:newCareIncome+relocatedIncome+dropoutIncome+independentIncomeHarm;
 const combinedYears=healthYears===null||incomeYears===null?null:healthYears+incomeYears;
 const price=(cost,q)=>q===null||q<=0?null:10*cost/q;
 const providerResourceCost=blocks*(p.staffedHoursWeek*p.capacityWeeks*p.providerHourCost+p.providerSetup);
 const result={parameters:p,packets,activationDelta,blocks,initiated,completed,added,relocated,newDropout,relocatedDropout,grossHealth,overlapRemoved,treatmentHarm,healthYears,newCareIncome,relocatedIncome,dropoutIncome,independentIncomeHarm,incomeYears,combinedYears,price10:price(p.gift,combinedYears),healthOnlyPrice10:price(p.gift,healthYears),incomeOnlyPrice10:price(p.gift,incomeYears),providerResourceCost,donorPlusProviderPrice10:price(p.gift+providerResourceCost,combinedYears),identifiedDonorPrice10:null,completePortfolioPrice10:null};
 for(const [k,v]of Object.entries(result))if(typeof v==='number'&&!Number.isFinite(v))throw Error('Nonfinite output '+k);
 return result;
}
export const cases={central:{},retainedHistoricalFunding:{fundingResponse:.5},replacementHeavy:{fundingResponse:.1},fundingZero:{fundingResponse:0},capacityZero:{packetCapacity:0},activationNull:{withActivation:.5},activationNegative:{withActivation:.4},allRelocated:{addedCareShare:0},allAdded:{addedCareShare:1},completionZero:{completion:0},clinicalGrossZero:{utility:0},clinicalNegative:{utility:-.02},clinicalLow:{utility:.02},clinicalHigh:{utility:.08},shortHealth:{healthDays:56},longHealth:{healthDays:224},resourceZero:{newCareCash:0,relocatedCash:0},resourceBurden:{newCareCash:-100,relocatedCash:-50},overlapHalf:{overlap:.5},overlapFull:{overlap:1},healthUnknown:{healthUnknown:true},incomeUnknown:{incomeUnknown:true},bothUnknown:{healthUnknown:true,incomeUnknown:true},independentHarmsAtZeroFunding:{fundingResponse:0,independentHealthHarm:.005,independentCashHarm:500},incomeZeroIndependentHarms:{newCareCash:0,relocatedCash:0,independentCashHarm:500},packetCostLow:{loadedHourCost:100},packetCostHigh:{loadedHourCost:400},doublePacketHours:{packetHours:80},lowerQualifiedCompletion:{qualifiedFill:.5,completion:.5},strongerActivation:{withActivation:.8},fullResourceNoOverlap:{overlap:0}};
Object.assign(cases,{resourceZero:{newCareCash:0,relocatedCash:0,newDropoutCash:0,relocatedDropoutCash:0},incomeZeroIndependentHarms:{newCareCash:0,relocatedCash:0,newDropoutCash:0,relocatedDropoutCash:0,independentCashHarm:500},qualifiedZero:{qualifiedFill:0},fundingHigh:{fundingResponse:.8},baselineLow:{baselineConsumption:15000},baselineHigh:{baselineConsumption:60000},shortResourceExposure:{resourceYears:.5},futureCostInflation:{loadedHourCost:206}});
export function results(){const historicalHealth=2290208*.4/20000*20*.25*.25*.05*112/365/1.03;return{historical:{cost:2290208,healthYears:historicalHealth,price10:2290208*10/historicalHealth,currentPublishedPrice10:null},annualFinances:[1656677,2328566,2290208],meanAnnualExpense:2091817,scenarios:Object.fromEntries(Object.entries(cases).map(([k,v])=>[k,calculate(v)]))};}
export function tests(){const c=calculate();assert.equal(c.healthYears+c.incomeYears,c.combinedYears);assert.ok(c.added+c.relocated===c.completed);assert.ok(c.packets<=defaults.packetCapacity);assert.ok(c.price10>0);assert.equal(c.identifiedDonorPrice10,null);assert.equal(c.completePortfolioPrice10,null);assert.equal(calculate({healthUnknown:true}).price10,null);assert.equal(calculate({incomeUnknown:true}).price10,null);assert.ok(calculate({overlap:1}).healthYears<0);assert.ok(calculate({utility:-.02,overlap:1}).healthYears<0);assert.ok(calculate(cases.independentHarmsAtZeroFunding).combinedYears<0);assert.ok(calculate(cases.incomeZeroIndependentHarms).incomeYears<0);assert.equal(calculate({completion:0}).grossHealth,0);assert.ok(calculate({completion:0}).incomeYears<0);for(const o of [null,[],{foo:1},{gift:0},{withActivation:1.1},{healthDays:Infinity},{newCareCash:-30000},{loadedHourCost:-1}])assert.throws(()=>calculate(o));return '22 assertions passed';}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)console.log(JSON.stringify({test:tests(),...results()},null,2));
