import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
export const defaults=Object.freeze({gift:100000,packetCost:100000,packetCapacity:1,rolloutProbability:.5,withProbability:.101,withoutProbability:.1,fastStart:6,slowStart:7,rate:.07,coverageCap:1,eventHorizon:25,residualOpportunity:.5,fatalAnnual:106,injuryAnnual:8058,geography:.99,discount:.03,survivalYears:20,survivalUtility:.9,injuryUtility:.12,injuryYears:.25,technologyHarmAnnual:20,injuryOverlap:0,householdsPerInjury:.8,cashAffectedShare:.3,injuryCash:500,baselineConsumption:50000,resourceYears:1,independentHealthHarm:0,independentCashHarm:0,healthUnknown:false,incomeUnknown:false});
export function calculate(o={}){
 if(o===null||Array.isArray(o)||typeof o!=='object'||Object.getPrototypeOf(o)!==Object.prototype)throw Error('Plain object required');
 for(const k of Object.keys(o))if(!Object.hasOwn(defaults,k))throw Error('Unknown '+k);
 const p={...defaults,...o};
 for(const[k,v]of Object.entries(p)){if(['healthUnknown','incomeUnknown'].includes(k)){if(typeof v!=='boolean')throw Error(k);}else if(typeof v!=='number'||!Number.isFinite(v))throw Error(k);}
 for(const k of ['rolloutProbability','withProbability','withoutProbability','rate','coverageCap','residualOpportunity','geography','injuryOverlap','householdsPerInjury','cashAffectedShare'])if(p[k]<0||p[k]>1)throw Error(k);
 if(p.withProbability>p.rolloutProbability||p.withoutProbability>p.rolloutProbability)throw Error('Incoherent joint probability');
 for(const k of ['gift','packetCost','rate','baselineConsumption','resourceYears'])if(p[k]<=0)throw Error(k);
 for(const k of ['packetCapacity','fatalAnnual','injuryAnnual','technologyHarmAnnual','independentHealthHarm','independentCashHarm','discount','survivalUtility','injuryYears'])if(p[k]<0)throw Error(k);
 for(const k of ['fastStart','slowStart','eventHorizon','survivalYears'])if(!Number.isInteger(p[k])||p[k]<1||p[k]>100)throw Error(k);
 if(p.eventHorizon<Math.max(p.fastStart,p.slowStart)+Math.ceil(p.coverageCap/p.rate)-1)throw Error('Must include fleet convergence');
 if(p.packetCapacity>10||p.discount>1||p.survivalUtility>1||p.survivalYears>60||p.injuryUtility < -1||p.injuryUtility>1||p.injuryYears>10||p.resourceYears>5||Math.abs(p.injuryCash)>100000||p.injuryCash<=-p.resourceYears*p.baselineConsumption||p.independentCashHarm>=p.resourceYears*p.baselineConsumption)throw Error('Incoherent bounds');
 const packets=Math.min(p.packetCapacity,p.gift/p.packetCost);
 if(packets>1)throw Error('Only one decision packet forecast; no independent repeated policy chances');
 const probabilityDelta=packets*(p.withProbability-p.withoutProbability),effectiveWith=p.withoutProbability+probabilityDelta;
 if(effectiveWith<0||effectiveWith>1)throw Error('Effective probability');
 const df=t=>(1+p.discount)**(-t),F=(t,L)=>Math.min(p.coverageCap,p.rate*Math.max(0,t-L+1));
 const paths=[];let physicalContrast=0,expectedContrast=0,fatalHealth=0,injuryHealth=0,incomeGross=0,undiscountedFatalities=0,undiscountedInjuries=0;
 let survivalQ=0;for(let s=0;s<p.survivalYears;s++)survivalQ+=p.survivalUtility*df(s+.5);
 for(let t=1;t<=p.eventHorizon;t++){
  const fast=F(t,p.fastStart),slow=F(t,p.slowStart),withGift=effectiveWith*fast+(p.rolloutProbability-effectiveWith)*slow,withoutGift=p.withoutProbability*fast+(p.rolloutProbability-p.withoutProbability)*slow;
  const contrast=probabilityDelta*(fast-slow),fatal=contrast*p.residualOpportunity*p.fatalAnnual*p.geography,injury=contrast*p.residualOpportunity*p.injuryAnnual*p.geography;
  paths.push({year:t,fast,slow,withGift,withoutGift,expectedCoverageDifference:contrast});
  physicalContrast+=(fast-slow)*df(t);expectedContrast+=contrast*df(t);
  undiscountedFatalities+=fatal;undiscountedInjuries+=injury;
  fatalHealth+=fatal*survivalQ*df(t);
  injuryHealth+=injury*p.injuryUtility*p.injuryYears*df(t+p.injuryYears/2);
  incomeGross+=.5*injury*p.householdsPerInjury*p.cashAffectedShare*p.resourceYears*Math.log1p(p.injuryCash/(p.resourceYears*p.baselineConsumption))*df(t+p.resourceYears/2);
 }
 const grossHealth=fatalHealth+injuryHealth;
 const technologyHarm=expectedContrast*p.residualOpportunity*p.geography*p.technologyHarmAnnual;
 const overlapRemoved=Math.max(0,injuryHealth)*p.injuryOverlap;
 const healthYears=p.healthUnknown?null:grossHealth-technologyHarm-overlapRemoved-p.independentHealthHarm;
 const independentIncomeHarm=.5*p.resourceYears*Math.log1p(-p.independentCashHarm/(p.resourceYears*p.baselineConsumption))*df(.5*p.resourceYears);
 const incomeYears=p.incomeUnknown?null:incomeGross+independentIncomeHarm;
 const combinedYears=healthYears===null||incomeYears===null?null:healthYears+incomeYears;
 const price=q=>q===null||q<=0?null:10*p.gift/q;
 const r={parameters:p,packets,effectiveWith,probabilityDelta,physicalContrast,expectedContrast,survivalQ,undiscountedFatalities,undiscountedInjuries,fatalHealth,injuryHealth,grossHealth,technologyHarm,overlapRemoved,healthYears,incomeGross,independentIncomeHarm,incomeYears,combinedYears,price10:price(combinedYears),healthOnlyPrice10:price(healthYears),incomeOnlyPrice10:price(incomeYears),identifiedDonorPrice10:null,completePortfolioPrice10:null,totalSocialCostPrice10:null,paths};
 for(const[k,v]of Object.entries(r))if(typeof v==='number'&&!Number.isFinite(v))throw Error('Nonfinite '+k);
 return r;
}
export const cases={central:{},initialHalfPointSketch:{withProbability:.105},lowDecisionDelta:{withProbability:.1001},strongDecisionDelta:{withProbability:.105},replacementNull:{withProbability:.1},adverseDecision:{withProbability:.099},capacityZero:{packetCapacity:0},shortSurvival:{survivalYears:10},longSurvival:{survivalYears:30},oneThirdResidual:{residualOpportunity:1/3},lowResidual:{residualOpportunity:.2},highResidual:{residualOpportunity:.8},noResidual:{residualOpportunity:0},twoYearAcceleration:{fastStart:5},laterDeployment:{fastStart:9,slowStart:10,eventHorizon:30},slowTurnover:{rate:.04,eventHorizon:35},fatalityZero:{fatalAnnual:0},nonfatalClinicalZero:{injuryUtility:0},nonfatalClinicalNegative:{injuryUtility:-.12},allHealthGrossZero:{fatalAnnual:0,injuryUtility:0},resourcesZero:{injuryCash:0},resourcesBurden:{injuryCash:-500},lowResourceIncidence:{cashAffectedShare:.1},highResourceCash:{injuryCash:2000},shortResource:{resourceYears:.5},overlapFull:{injuryOverlap:1},overlapHalf:{injuryOverlap:.5},technologyHarmLarge:{technologyHarmAnnual:200},healthUnknown:{healthUnknown:true},incomeUnknown:{incomeUnknown:true},bothUnknown:{healthUnknown:true,incomeUnknown:true},independentHarmsAtNull:{withProbability:.1,independentHealthHarm:.1,independentCashHarm:2000},independentHarmAtZeroCapacity:{packetCapacity:0,independentHealthHarm:.1,independentCashHarm:2000},resourceZeroIndependentHarm:{injuryCash:0,independentCashHarm:2000},moreExpensivePacket:{packetCost:150000},annualWholeRecipientCost:{gift:365248,packetCost:365248},meanAnnualWholeRecipientCost:{gift:(336891+286009+365248)/3,packetCost:(336891+286009+365248)/3}};
Object.assign(cases,{technologyHarmLarge:{technologyHarmAnnual:200},technologyHarmZero:{technologyHarmAnnual:0},uniqueHouseholdAll:{householdsPerInjury:1},uniqueHouseholdHalf:{householdsPerInjury:.5},noRollout:{rolloutProbability:0,withProbability:0,withoutProbability:0},grossHealthZeroWithHarm:{survivalUtility:0,injuryUtility:0},negativeClinicalFullOverlap:{survivalUtility:0,injuryUtility:-.12,injuryOverlap:1}});
export function results(){let A=0;for(let t=1;t<=25;t++)A+=(Math.min(1,.07*Math.max(0,t-5+1))-Math.min(1,.07*Math.max(0,t-7+1)))/1.03**t;const oldQ=.99*.5*.15*.1*106*.5*20*A;return{historical:{annualCost:365248,recipientYears:5,cost:1826240,A,healthYears:oldQ,price10:1826240*10/oldQ,currentPublishedPrice10:null},expenses:[336891,286009,365248],meanExpense:(336891+286009+365248)/3,scenarios:Object.fromEntries(Object.entries(cases).map(([k,v])=>{const r=calculate(v);if(k!=='central')delete r.paths;return[k,r];}))};}
export function tests(){const c=calculate();assert.equal(c.healthYears+c.incomeYears,c.combinedYears);assert.ok(c.paths.at(-1).expectedCoverageDifference===0);assert.ok(c.probabilityDelta>0);assert.ok(c.healthYears>0&&c.incomeYears>0);assert.ok(calculate(cases.adverseDecision).combinedYears<0);assert.ok(calculate(cases.independentHarmsAtNull).healthYears<0);assert.ok(calculate(cases.independentHarmAtZeroCapacity).incomeYears<0);assert.ok(calculate(cases.resourceZeroIndependentHarm).incomeYears<0);assert.equal(calculate(cases.healthUnknown).price10,null);assert.equal(calculate(cases.incomeUnknown).price10,null);assert.equal(calculate(cases.capacityZero).probabilityDelta,0);assert.equal(calculate(cases.resourcesZero).incomeYears,0);assert.equal(calculate(cases.overlapFull).technologyHarm,c.technologyHarm);for(const o of [null,[],{q:2},{gift:0},{withProbability:1.1},{independentCashHarm:50000},{injuryCash:-50000},{eventHorizon:10},{discount:Infinity},{packetCapacity:-1},{constructor:0},{toString:0}])assert.throws(()=>calculate(o));return '25 assertions passed';}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)console.log(JSON.stringify({test:tests(),...results()},null,2));
