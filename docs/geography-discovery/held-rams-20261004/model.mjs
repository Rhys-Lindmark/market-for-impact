export const planning = {
 costPerOfferedCourseUSD:3000, referenceQalys:.057, positiveTransfer:.25,
 causedCourseExposure:.5, sfShare:1, bayShare:1, edition:'sf', delayYears:0, discountRate:.03,
 // Full-horizon amounts for ONE unique household per caused course. Not local measurements.
 households:[{id:'adult-recipient-household',people:1,annualNetConsumptionUSD:24000,years:1,
 rows:[{id:'incremental-travel-stress',amountUSD:-60,independentCredit:1}]}],
 independentGiftHarmHealthyYears:0
};
function fraction(x){if(!Number.isFinite(x)||x<0||x>1)throw Error('Invalid fraction');}
export function calculate(input={}){
 const p={...planning,...input};
 for(const k of ['positiveTransfer','causedCourseExposure','sfShare','bayShare'])fraction(p[k]);
 if(p.sfShare>p.bayShare)throw Error('SF must be within Bay');
 if(!['sf','bay'].includes(p.edition)||!Number.isFinite(p.costPerOfferedCourseUSD)||p.costPerOfferedCourseUSD<=0||!Number.isFinite(p.referenceQalys)||!Number.isFinite(p.delayYears)||p.delayYears<0||!Number.isFinite(p.discountRate)||p.discountRate<0||!Number.isFinite(p.independentGiftHarmHealthyYears)||p.independentGiftHarmHealthyYears>0)throw Error('Invalid inputs');
 const local=p.edition==='sf'?p.sfShare:p.bayShare;
 const discount=(1+p.discountRate)**p.delayYears;
 // Negative clinical effect per caused course is full; only its causal exposure/location changes count.
 const healthPerCausedCourse=(p.referenceQalys>0?p.referenceQalys*p.positiveTransfer:p.referenceQalys)/discount;
 const ids=new Set(); const householdResults=[];let incomePerCausedCourse=0;
 for(const h of p.households){
  if(!h.id||ids.has(h.id))throw Error('Duplicate unique household');ids.add(h.id);
  if(!Number.isFinite(h.people)||h.people<=0||!Number.isFinite(h.annualNetConsumptionUSD)||h.annualNetConsumptionUSD<=0||!Number.isFinite(h.years)||h.years<=0)throw Error('Invalid household');
  const rows=new Set();let net=0;
  for(const r of h.rows){if(!r.id||rows.has(r.id)||!Number.isFinite(r.amountUSD))throw Error('Invalid or duplicate cash row');rows.add(r.id);fraction(r.independentCredit);net+=r.amountUSD>0?r.amountUSD*r.independentCredit:r.amountUSD;}
  const baseline=h.annualNetConsumptionUSD*h.years;if(baseline+net<=0)throw Error('Household log domain');
  let years=0;for(let i=0;i<Math.ceil(h.years);i++)years+=Math.min(1,h.years-i)/(1+p.discountRate)**(p.delayYears+i);
  const value=.5*h.people*years*Math.log1p(net/baseline);
  incomePerCausedCourse+=value;householdResults.push({id:h.id,netUSD:net,value});
 }
 const health=healthPerCausedCourse*p.causedCourseExposure*local;
 const income=incomePerCausedCourse*p.causedCourseExposure*local;
 // Independent gift harm is already edition-specific per gross offered-course budget unit.
 const combined=health+income+p.independentGiftHarmHealthyYears;
 return {healthPerCausedCourse,incomePerCausedCourse,healthHealthyYears:health,incomeHealthyYearEquivalent:income,
 combinedHealthyYearEquivalent:combined,costPer10CombinedUSD:combined>0?10*p.costPerOfferedCourseUSD/combined:null,
 diagnosticHealthOnlyCostPer10USD:health>0?10*p.costPerOfferedCourseUSD/health:null,
 evidenceSupportedCurrentPrice:null,ordinaryGiftExpectedValue:null,fullSocialCost:null,householdResults};
}

