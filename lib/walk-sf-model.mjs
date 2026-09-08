export function walkSfModel(s,giftUsd=100000){
 if(!Number.isFinite(giftUsd)||giftUsd<0)throw new RangeError('Invalid gift');
 const required=['fatalHorizonYears','severeDurationYears','delayYears','startYear','baselineUtility','competingHazard','severeUtilityLoss','attributableAccelerationProbability','targetRiskShare','annualFatalities','fatalRRR','annualSevereNonfatal','severeRRR','sfResidentShare','restBayResidentShare','outsideBayShare','donorHarmSf','donorHarmRestBay','packageCapitalUsd','annualMaintenanceUsd'];
 for(const key of required)if(!Number.isFinite(s[key]))throw new RangeError('Missing or nonfinite input: '+key);
 for(const key of ['fatalHorizonYears','severeDurationYears','delayYears','startYear'])if(!Number.isInteger(s[key])||s[key]<0||s[key]>150)throw new RangeError('Invalid finite time horizon');
 for(const key of ['baselineUtility','severeUtilityLoss','attributableAccelerationProbability','targetRiskShare','sfResidentShare','restBayResidentShare','outsideBayShare'])if(s[key]<0||s[key]>1)throw new RangeError('Invalid fraction');
 for(const key of ['competingHazard','annualFatalities','annualSevereNonfatal','donorHarmSf','donorHarmRestBay','packageCapitalUsd','annualMaintenanceUsd'])if(s[key]<0)throw new RangeError('Negative cost or incidence');
 for(const key of ['fatalRRR','severeRRR'])if(Math.abs(s[key])>1)throw new RangeError('Invalid signed risk reduction');
 if(Math.abs(s.sfResidentShare+s.restBayResidentShare+s.outsideBayShare-1)>1e-9)throw new RangeError('Resident shares must sum to one');
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
