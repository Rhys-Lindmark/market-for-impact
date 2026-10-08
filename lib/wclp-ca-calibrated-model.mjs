// Conditional annual technical-assistance pathway, not an identified marginal-gift return.
export const modelVersion='wclp-ca-annual-technical-assistance-judgment-20261002';
export const defaultInputs=Object.freeze({annualCost:7097648,responses:1208,healthRequestShare:2154071/7409717,relevantShare:.25,uniqueAdults:5,withResolution:.8,withoutResolution:.6,coverageDays:90,healthPerYear:.05,annualNetResources:569,baselineResources:9214*2.91,discount:.03,delay:0,replacement:0,overlap:0,independentHealthHarm:0,burdenHouseholds:0,oneOffBurden:0,burdenTime:.25});
const fractions=['healthRequestShare','relevantShare','withResolution','withoutResolution','replacement','overlap'];
export function calculate(overrides={}){
 if(!overrides||Array.isArray(overrides)||Object.getPrototypeOf(overrides)!==Object.prototype)throw Error('Plain overrides required');
 for(const[k,v]of Object.entries(overrides))if(!Object.hasOwn(defaultInputs,k)||!Number.isFinite(v))throw Error('Unknown or nonfinite input '+k);
 const i={...defaultInputs,...overrides};
 for(const k of fractions)if(i[k]<0||i[k]>1)throw Error('Invalid fraction '+k);
 if(i.annualCost<=0||i.responses<0||i.responses>1000000||i.uniqueAdults<0||i.uniqueAdults>100000||i.coverageDays<0||i.coverageDays>365||Math.abs(i.healthPerYear)>1||i.baselineResources<=0||i.annualNetResources<=-i.baselineResources||i.discount<0||i.discount>1||i.delay<0||i.delay>10||i.independentHealthHarm<0||i.burdenHouseholds<0||i.oneOffBurden<0||i.oneOffBurden>=i.baselineResources||i.burdenTime<0||i.burdenTime>10)throw Error('Invalid domain');
 const exposure=i.coverageDays/365;
 const midpoint=i.delay+exposure/2;
 const flowDiscount=exposure/(1+i.discount)**midpoint;
 const incrementalResolution=i.withResolution-i.withoutResolution;
 const additionalHouseholds=i.responses*i.healthRequestShare*i.relevantShare*i.uniqueAdults*incrementalResolution*(1-i.replacement);
 const health=additionalHouseholds*i.healthPerYear*flowDiscount;
 const healthHarm=i.independentHealthHarm/(1+i.discount)**i.burdenTime;
 const income=additionalHouseholds*.5*Math.log1p(i.annualNetResources/i.baselineResources)*flowDiscount;
 const resourceBurden=i.burdenHouseholds*.5*Math.log1p(-i.oneOffBurden/i.baselineResources)/(1+i.discount)**i.burdenTime;
 // Overlap discounts only duplicated positive health value, never negative health or independent harm.
 const creditedHealth=health>0?health*(1-i.overlap):health;
 const healthYears=creditedHealth-healthHarm;
 const incomeEquivalentYears=income+resourceBurden;
 const totalEquivalentYears=healthYears+incomeEquivalentYears;
 const result={inputs:i,exposure,midpoint,flowDiscount,incrementalResolution,additionalHouseholds,unadjustedHealthYears:health,healthYears,incomeEquivalentYears,resourceBurden,totalEquivalentYears,costUSD:i.annualCost,price10:totalEquivalentYears>0?10*i.annualCost/totalEquivalentYears:null};
 if(Object.values(result).some(v=>typeof v==='number'&&!Number.isFinite(v)))throw Error('Nonfinite result');
 return result;
}
export const scenarios=Object.freeze({central:{},noAdditionalResolution:{withResolution:.6},fullReplacement:{replacement:1},halfReplacement:{replacement:.5},healthZero:{healthPerYear:0},incomeZero:{annualNetResources:0},adverseHealth:{healthPerYear:-.01},adverseResources:{annualNetResources:-569},adverseBoth:{healthPerYear:-.01,annualNetResources:-569},halfOverlap:{overlap:.5},fullOverlap:{overlap:1},reportedAmountDiagnostic:{annualNetResources:215.35},fullYearExposure:{coverageDays:365},lowerHealthTransfer:{healthPerYear:.02},halfResources:{annualNetResources:284.5},doubleResources:{annualNetResources:1138},oneAdultPerResponse:{uniqueAdults:1},twentyAdultsPerResponse:{uniqueAdults:20},lowerRelevantShare:{relevantShare:.1},smallerResolutionDifference:{withResolution:.65},delayedResolution:{delay:.5},nullWithProcessLoss:{withResolution:.6,burdenHouseholds:1,oneOffBurden:50},adverseResolution:{withResolution:.5},independentHarmFullOverlap:{overlap:1,independentHealthHarm:1},zeroDiscount:{discount:0}});
export const diagnostics=()=>Object.fromEntries(Object.entries(scenarios).map(([id,inputs])=>[id,calculate(inputs)]));
