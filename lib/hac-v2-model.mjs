import data from '../data/san-francisco/hac-v2-inputs.json' with {type:'json'};
export const inputs=data;
export const version=inputs.version;
const object=(x,n)=>{if(!x||typeof x!=='object'||Array.isArray(x))throw new TypeError(n+' must be an object');};
const finite=(x,n,min=-Infinity,max=Infinity)=>{if(typeof x!=='number'||!Number.isFinite(x)||x<min||x>max)throw new RangeError(n+' out of bounds');return x;};
export function exposure(start,duration,rate){finite(start,'start',0,30);finite(duration,'duration',0,30);finite(rate,'rate',0,1);if(start+duration>40)throw new RangeError('end after year40');const l=Math.log1p(rate);return rate===0?duration:Math.exp(-l*start)*(-Math.expm1(-l*duration))/l;}
export function calculate(options={}){
 object(options,'options');const {world=inputs.central,additionalResources=0}=options;object(world,'world');
 const w={...world};if(typeof w.id!=='string'||!w.id.trim()||w.id!==w.id.trim())throw new TypeError('nonblank trimmed id required');
 for(const k of Object.keys(inputs.central).filter(k=>k!=='id'))finite(w[k],k);
 for(const k of ['completionDifference','advisoryFunding','advisoryBayShare','advisorySfShareOfBay','advisoryNonOverlap','policyResidual','policyGiftContribution','donorHarmSfShare'])finite(w[k],k,0,1);
 for(const k of ['directUtility','spilloverUtility'])finite(w[k],k,-1,1);
 for(const k of ['projectHomes','policyScaleHomes','affectedPeoplePerHome','spilloverPeoplePerHome','donorHarmBay'])finite(w[k],k,0);
 finite(w.advisoryCost,'advisoryCost',Number.MIN_VALUE);finite(additionalResources,'additionalResources',0);
 const donorCost=inputs.referenceGift;const cost=finite(donorCost+additionalResources,'cost',0);const numerator=finite(10*cost,'numerator');
 const advisoryYears=exposure(w.advisoryStart,w.advisoryDuration,w.discountRate),policyYears=exposure(w.policyStart,w.policyDuration,w.discountRate);
 const advisoryPlaces=donorCost*inputs.allocation.technicalAssistance/w.advisoryCost;
 const advisoryBayHomes=advisoryPlaces*w.projectHomes*w.completionDifference*w.advisoryFunding*w.advisoryBayShare*w.advisoryNonOverlap;
 const policyBayHomes=w.policyScaleHomes*w.policyResidual*w.policyGiftContribution;
 const directAnnualPerHome=w.affectedPeoplePerHome*w.directUtility;
 const spilloverAnnualPerHome=w.spilloverPeoplePerHome*w.spilloverUtility;
 const advisoryDirectQ=advisoryBayHomes*advisoryYears*directAnnualPerHome,advisorySpilloverQ=advisoryBayHomes*advisoryYears*spilloverAnnualPerHome;
 const policyDirectQ=policyBayHomes*policyYears*directAnnualPerHome,policySpilloverQ=policyBayHomes*policyYears*spilloverAnnualPerHome;
 const advisoryBayQ=advisoryDirectQ+advisorySpilloverQ,policyBayQ=policyDirectQ+policySpilloverQ;
 const bayQ=advisoryBayQ+policyBayQ-w.donorHarmBay,sfQ=advisoryBayQ*w.advisorySfShareOfBay+policyBayQ-w.donorHarmBay*w.donorHarmSfShare;
 const out={id:w.id,donorCost,additionalResources,cost,advisoryPlaces,advisoryYears,policyYears,advisoryBayHomes,policyBayHomes,directAnnualPerHome,spilloverAnnualPerHome,advisoryDirectQ,advisorySpilloverQ,policyDirectQ,policySpilloverQ,advisoryBayQ,policyBayQ,bayQ,sfQ,restBayQ:bayQ-sfQ,bayCostPer10:bayQ>0?numerator/bayQ:null,sfCostPer10:sfQ>0?numerator/sfQ:null,status:bayQ>0?'positive':bayQ<0?'harm':'null'};
 for(const [k,v] of Object.entries(out))if(typeof v==='number')finite(v,k);
 return out;
}
export const worlds=[inputs.central,inputs.favorable,inputs.pessimistic,{...inputs.central,id:'null_implementation',advisoryFunding:0,policyGiftContribution:0},{...inputs.central,id:'null_health',directUtility:0,spilloverUtility:0},{...inputs.central,id:'signed_shared_harm',directUtility:-0.004,spilloverUtility:0},{...inputs.central,id:'donor_harm',donorHarmBay:0.1},{...inputs.central,id:'null_with_donor_harm',advisoryFunding:0,policyGiftContribution:0,donorHarmBay:0.1},{...inputs.central,id:'no_spillover',spilloverUtility:0},{...inputs.central,id:'no_policy_credit',policyGiftContribution:0},{...inputs.central,id:'no_advisory_credit',advisoryFunding:0},{...inputs.central,id:'short_policy_exposure',policyStart:15,policyDuration:2}];
export function calculateAll(){const ids=new Set();for(const w of worlds){if(ids.has(w.id.trim()))throw new Error('duplicate id');ids.add(w.id.trim());}return {version,scope:'Whole ordinary c3 gift; partial quantified health; annual expense descriptive',weightedExpectation:null,weightExplanation:'No calibrated scenario probabilities; central and joint stresses are not a distribution.',results:worlds.map(world=>calculate({world})),additionalResourceStress:calculate({additionalResources:1000000})};}
