export function calculate(s,gift=100000){
 if(!s||typeof s!=='object'||!s.allocations||typeof s.allocations!=='object')throw new TypeError('scenario and allocations required');
 const finite=(v,min,max)=>{if(typeof v!=='number'||!Number.isFinite(v))throw new TypeError('finite number required');if(v<min||v>max)throw new RangeError('outside model bounds');};
 finite(gift,0,1e12);
 for(const k of ['employment','education','careerAdditional','reserveStrategy'])finite(s.allocations[k],0,1e12);
 const total=Object.values(s.allocations).reduce((a,b)=>a+b,0);if(!Number.isFinite(total)||Math.abs(total-gift)>Math.max(1,gift)*1e-12)throw new RangeError('allocate whole gift once');
 finite(s.costPerOfferedPlace,.01,1e12);finite(s.utilityGain,-1,1);finite(s.effectiveYears,0,1);finite(s.additionality,0,1);finite(s.sfResidentShare,0,1);finite(s.donorHarmSf,0,1e12);finite(s.donorHarmRestBay,0,1e12);
 const offeredPlaces=s.allocations.employment/s.costPerOfferedPlace;
 const grossBayQaly=offeredPlaces*s.additionality*s.effectiveYears*s.utilityGain;
 const sfNetQaly=grossBayQaly*s.sfResidentShare-s.donorHarmSf,restBayNetQaly=grossBayQaly*(1-s.sfResidentShare)-s.donorHarmRestBay,bayIncludingSfNetQaly=sfNetQaly+restBayNetQaly;
 const price=(q,cost=gift)=>q>0&&Number.isFinite(10*cost/q)?10*cost/q:null;
 return {offeredPlaces,healthUnquantifiedAllocationUsd:gift-s.allocations.employment,grossBayQaly,sfNetQaly,restBayNetQaly,bayIncludingSfNetQaly,sfUsdPer10Qaly:price(sfNetQaly),bayUsdPer10Qaly:price(bayIncludingSfNetQaly),sfExtraResourceStressUsdPer10Qaly:price(sfNetQaly,2*gift),bayExtraResourceStressUsdPer10Qaly:price(bayIncludingSfNetQaly,2*gift)};
}
