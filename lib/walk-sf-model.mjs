export function walkSfModel(s,giftUsd=100000){
 if(!Number.isFinite(giftUsd)||giftUsd<0)throw new RangeError('Invalid gift');
 for(const [key,value] of Object.entries(s))if(!['id','outputs'].includes(key)&&(!Number.isFinite(value)))throw new RangeError('Nonfinite input: '+key);
 let fatal=0,severe=0,window=0;
 for(let k=0;k<s.fatalHorizonYears;k++)fatal+=s.baselineUtility*Math.exp(-s.competingHazard*(k+.5))/1.03**(k+1);
 for(let k=0;k<s.severeDurationYears;k++)severe+=s.severeUtilityLoss/1.03**(k+1);
 for(let k=0;k<s.delayYears;k++)window+=1.03**(-s.startYear-k);
 const exposure=s.attributableAccelerationProbability*s.targetRiskShare*window;
 const globalBeforeHarm=exposure*(s.annualFatalities*s.fatalRRR*fatal+s.annualSevereNonfatal*s.severeRRR*severe);
 const sf=globalBeforeHarm*s.sfResidentShare-s.donorHarmSf,rest=globalBeforeHarm*s.restBayResidentShare-s.donorHarmRestBay,bay=sf+rest;
 const outside=globalBeforeHarm*s.outsideBayShare,global=bay+outside;
 const early=1.03**(1-s.startYear),late=1.03**(1-s.startYear-s.delayYears);
 const timing=giftUsd+s.attributableAccelerationProbability*(s.packageCapitalUsd*(early-late)+s.annualMaintenanceUsd*window);
 const gross=giftUsd+s.attributableAccelerationProbability*(s.packageCapitalUsd*early+s.annualMaintenanceUsd*window);
 const ratio=(cost,q)=>q>0?10*cost/q:null;
 return {sfNetQaly:sf,restBayNetQaly:rest,bayIncludingSfNetQaly:bay,outsideBayQaly:outside,globalNetQaly:global,bayHealthShare:global>0?bay/global:null,donorCostUsd:giftUsd,sfUsdPerQaly:sf>0?giftUsd/sf:null,sfUsdPer10Qaly:ratio(giftUsd,sf),bayUsdPer10Qaly:ratio(giftUsd,bay),globalUsdPer10Qaly:ratio(giftUsd,global),timingResourceUsd:timing,grossForwardResourceStressUsd:gross,sfTimingUsdPer10Qaly:ratio(timing,sf),bayTimingUsdPer10Qaly:ratio(timing,bay),sfGrossStressUsdPer10Qaly:ratio(gross,sf),bayGrossStressUsdPer10Qaly:ratio(gross,bay)};
}
