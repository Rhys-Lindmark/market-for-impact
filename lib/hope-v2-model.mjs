import {calculate as original,costWorlds,deliveryWorlds} from './hope-v2-original-model.mjs';
export {costWorlds,deliveryWorlds};
export const modelVersion='hope-pacifica-depth-v2-unchanged-priors';
export const currentEvidence={reviewDate:'2026-09-11',listedSites:9,cumulativeClaimLowerBound:6000,annualExpense:null,annualUniqueRiskPeople:null,annualRescues:null,currentMarginalOffer:null};
const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
export function calculate(options={}){
 if(!object(options))throw new TypeError('options');
 for(const k of Object.keys(options))if(!['gift','costs','worlds'].includes(k))throw new TypeError('unknown option');
 for(const key of ['costs','worlds'])if(options[key]!==undefined){if(!Array.isArray(options[key]))throw new TypeError(key);const ids=new Set();for(const w of options[key]){if(!object(w)||typeof w.id!=='string'||!w.id.trim()||w.id!==w.id.trim()||ids.has(w.id.trim()))throw new TypeError('world id');ids.add(w.id.trim());}}
 const out=original(options);
 return {...out,modelVersion,currentEvidence,anchors:{...out.anchors,listedSites:9,cumulativeNarcanClaims:[6000]},basis:'Clinical/cost/funding priors unchanged; current operations and public alternative evidence refreshed'};
}
export function diagnostics(){
 const change=f=>deliveryWorlds.map(w=>f({...w}));
 const out={base:calculate(),halfFunding:calculate({worlds:change(w=>({...w,funding:w.funding*.5}))}),quarterFunding:calculate({worlds:change(w=>({...w,funding:w.funding*.25}))}),halfPacks:calculate({worlds:change(w=>({...w,packs:w.packs*.5}))}),doubleRepeats:calculate({worlds:change(w=>({...w,repeats:w.repeats*2}))}),halfHazardGain:calculate({worlds:change(w=>({...w,hazardGain:w.hazardGain*.5}))})};
 for(const h of [1,2,5])out['horizon'+h]=calculate({worlds:change(w=>({...w,horizon:h}))});
 for(const c of [20000,40000,100000])out['expense'+c]=calculate({costs:[{id:'fixed',expense:c,weight:1}]});
 const pairs=[{cost:20000,world:'cautious',weight:.2},{cost:40000,world:'central',weight:.5},{cost:100000,world:'favorable',weight:.3}].map(p=>({...p,result:calculate({costs:[{id:'fixed',expense:p.cost,weight:1}],worlds:[{...deliveryWorlds.find(w=>w.id===p.world),weight:1}]})}));
 // This deliberately different three-state dependence illustration is not a replacement expectation.
 out.costVolumeDependenceIllustration={notEvaluatorEstimate:true,pairs};
 const r=calculate().centralScenario;
 out.centralTemporal={activeDiscountedSurvivalYears:r.activeSurvivalYears,postSupportDiscountedSurvivalYears:r.postSupportSurvivalYears,postSupportShareOfGrossSurvival:r.postSupportSurvivalYears/(r.activeSurvivalYears+r.postSupportSurvivalYears),notContinuingProgramEffect:true};
 out.centralThresholds=[1e6,1e5].map(price=>({pricePer10:price,requiredAnnualRiskPeople:200*(calculate().centralScenario.bayCostPer10/price),requiredFundingResponse:.5*(r.bayCostPer10/price),currentAnnualRiskPeoplePrior:200}));
 return out;
}
