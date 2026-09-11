import baseline from '../data/bay/heppac-event-linear-v1-baseline.json' with {type:'json'};
import {uniqueCohort} from './heppac-unique-cohort.mjs';
export const modelVersion='heppac-whole-gift-unique-naloxone-cohort-v2';
export const cohortPriors=Object.freeze([{repeats:3,hazard:.10},{repeats:2,hazard:.07},{repeats:1.5,hazard:.04}].map(Object.freeze));
const price=(g,q)=>{if(q<=0)return null;const v=10*g/q;if(!Number.isFinite(v))throw new RangeError('nonfinite price');return v};
export function calculate(options={}){
 if(!options||typeof options!=='object'||Array.isArray(options))throw new TypeError('options');
 const{repeatScale=1,horizonCap=60,useOldSevereMortality=false,harmPerPerson=0,rescueIncrement=1}=options;
 for(const[k,v,lo,hi]of [['repeatScale',repeatScale,1,100],['horizonCap',horizonCap,1,60],['harmPerPerson',harmPerPerson,0,.1],['rescueIncrement',rescueIncrement,-1,1]])if(typeof v!=='number'||!Number.isFinite(v)||v<lo||v>hi)throw new RangeError(k);
 if(typeof useOldSevereMortality!=='boolean')throw new TypeError('mortality switch');
 const results=baseline.results.map((old,i)=>{
  const r=structuredClone(old),s=r.inputs,p=cohortPriors[i],k=p.repeats*repeatScale;
  const hazard=useOldSevereMortality?-Math.log(s.survival.annualSurvival):p.hazard;
  const cohortInputs={uniquePeople:s.naloxone.reversals/k,opportunitiesPerPersonYear:k,otherwiseFatal:s.naloxone.otherwiseFatal,baselineRescue:rescueIncrement<0?1:0,rescueIncrement,otherHazard:hazard,postHazard:hazard,activeYears:1,horizonYears:Math.min(horizonCap,s.survival.horizon),utility:s.survival.utility,discount:s.survival.discount,delayYears:0};
  const trajectory=uniqueCohort(cohortInputs),credit=s.naloxone.attribution*s.naloxone.outcomeAdditionality;
  const n=trajectory.qaly*credit,harm=cohortInputs.uniquePeople*credit*harmPerPerson;
  r.oldEventLinearNaloxoneQaly=r.pathwayQalyRaw.naloxone;r.pathwayQalyRaw.naloxone=n;
  r.cohortInputs=cohortInputs;r.cohortResult=trajectory;r.independentHarmQaly=harm;
  r.sharedMortalityRaw=n+r.pathwayQalyRaw.moud+r.pathwayQalyRaw.drugChecking;
  r.sharedMortalityAdjusted=r.sharedMortalityRaw*s.mortalityOverlapAdjustment;
  r.totalQaly=r.sharedMortalityAdjusted+r.pathwayQalyRaw.syringe-harm;
  r.illustrativeWholeOrgSpendingPer10AttributedQaly=price(baseline.expense,r.totalQaly);
  r.illustrativeGrossPer10AttributedQaly=price(r.illustrativeGrossResources,r.totalQaly);
  const g=r.conditionalOrdinaryGift;g.annualOrgAttributedQaly=r.totalQaly;g.giftQaly=r.totalQaly*(g.gift*s.giftDeployableShare/baseline.expense)*s.giftRealizationDiscount;
  g.giftBayQaly=g.giftQaly*s.bayImpactSharePrior;g.giftSfQaly=g.giftQaly*s.sfImpactSharePrior;
  g.donorPer10Qaly=price(g.gift,g.giftQaly);g.grossPer10Qaly=price(g.grossResources,g.giftQaly);g.bayDonorPer10Qaly=price(g.gift,g.giftBayQaly);g.sfDonorPer10Qaly=price(g.gift,g.giftSfQaly);
  delete r.perFatalEventQaly;return r;
 });
 const w=structuredClone(baseline.conditionalOrdinaryGiftWeighted);
 w.weightedGiftQaly=results.reduce((a,r)=>a+r.inputs.weight*r.conditionalOrdinaryGift.giftQaly,0);
 w.weightedBayGiftQaly=results.reduce((a,r)=>a+r.inputs.weight*r.conditionalOrdinaryGift.giftBayQaly,0);
 w.weightedSfGiftQaly=results.reduce((a,r)=>a+r.inputs.weight*r.conditionalOrdinaryGift.giftSfQaly,0);
 w.donorPer10Qaly=price(w.gift,w.weightedGiftQaly);w.grossPer10Qaly=price(w.grossResources,w.weightedGiftQaly);w.bayDonorPer10Qaly=price(w.gift,w.weightedBayGiftQaly);w.sfDonorPer10Qaly=price(w.gift,w.weightedSfGiftQaly);
 const result={...structuredClone(baseline),modelVersion,results,conditionalOrdinaryGiftWeighted:w,originalEventLinearBayPrice:baseline.conditionalOrdinaryGiftWeighted.bayDonorPer10Qaly,correctionBoundary:'Naloxone within-person recurrence corrected; other pathways and coarse cross-pathway overlap retained, unresolved. All coefficients subjective, no new measured outcomes.'};
 const check=x=>{if(typeof x==='number'&&!Number.isFinite(x))throw new RangeError('nonfinite output');if(x&&typeof x==='object')Object.values(x).forEach(check)};check(result);return result;
}
