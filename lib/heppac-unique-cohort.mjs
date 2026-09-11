// Prototype only: no calibrated defaults, no empirical claim from event counts.
export const bounds=Object.freeze({uniquePeople:[0,1e7],opportunitiesPerPersonYear:[0,10000],otherwiseFatal:[0,1],baselineRescue:[0,1],rescueIncrement:[-1,1],otherHazard:[0,20],postHazard:[0,20],activeYears:[0,10],horizonYears:[0,60],utility:[0,1],discount:[0,1],delayYears:[0,10]});
const integral=(h,t)=>h===0?t:-Math.expm1(-h*t)/h;
export function uniqueCohort(p){
 if(!p||typeof p!=='object'||Array.isArray(p))throw new TypeError('cohort object required');
 for(const[k,[lo,hi]]of Object.entries(bounds))if(typeof p[k]!=='number'||!Number.isFinite(p[k])||p[k]<lo||p[k]>hi)throw new RangeError(k);
 if(p.baselineRescue+p.rescueIncrement<0||p.baselineRescue+p.rescueIncrement>1)throw new RangeError('supported rescue');
 if(p.activeYears>p.horizonYears)throw new RangeError('active exceeds follow-up');
 const d=Math.log1p(p.discount),t=p.activeYears;
 const base=p.otherHazard+p.opportunitiesPerPersonYear*p.otherwiseFatal*(1-p.baselineRescue);
 const supported=p.otherHazard+p.opportunitiesPerPersonYear*p.otherwiseFatal*(1-p.baselineRescue-p.rescueIncrement);
 const active=integral(supported+d,t)-integral(base+d,t);
 const gap=Math.exp(-supported*t)-Math.exp(-base*t);
 const tail=gap*Math.exp(-d*t)*integral(p.postHazard+d,p.horizonYears-t);
 const qPerPerson=p.utility*(active+tail)/(1+p.discount)**p.delayYears;
 const qaly=p.uniquePeople*qPerPerson;
 const maximumAbsoluteQaly=p.uniquePeople*p.utility*integral(d,p.horizonYears)/(1+p.discount)**p.delayYears;
 const result={baseHazard:base,supportedHazard:supported,activeSurvivalYears:active,postSupportSurvivalYears:tail,survivalGap:gap,qPerPerson,qaly,maximumAbsoluteQaly};
 if(Object.values(result).some(v=>!Number.isFinite(v)))throw new RangeError('nonfinite derived result');
 if(Math.abs(qaly)>maximumAbsoluteQaly+1e-9)throw new RangeError('person-time bound');
 return result;
}
