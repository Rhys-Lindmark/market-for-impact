// Prospective representative-core gift, not observed deaths prevented.
// Event/person overlap is an explicit coefficient judgment, not solved by annual mortality.
export function remedyAllianceModel(s, giftUsd = 10000) {
  if (!Number.isFinite(giftUsd) || giftUsd <= 0) throw new Error('Positive finite gift required');
  const fractions = ['coreAllocation','responseProbabilityWithinYear','survivalDifferencePerResponse','fundingOutputAdditionality','annualSurvival','utility'];
  const nonnegative = ['externalLastMileResourcePerBundle','discount','delayYears','sharedHarmPerBundle','independentGiftHarm'];
  for (const key of [...fractions,...nonnegative,'cashPerBundle','survivalYears'])
    if (!Number.isFinite(s[key])) throw new Error('Missing or nonfinite '+key);
  for (const key of fractions) if(s[key]<0 || s[key]>1) throw new Error('Invalid fraction '+key);
  for (const key of nonnegative) if(s[key]<0) throw new Error('Negative '+key);
  if(s.cashPerBundle<=0 || !Number.isInteger(s.survivalYears) || s.survivalYears<0 || s.survivalYears>150 || s.delayYears>150) throw new Error('Invalid cost or horizon');
  const fundedBundles=giftUsd*s.coreAllocation/s.cashPerBundle;
  const creditedIncrementalResponses=fundedBundles*s.fundingOutputAdditionality*s.responseProbabilityWithinYear;
  const earlyDeathsPreventedBeforeDiscount=creditedIncrementalResponses*s.survivalDifferencePerResponse;
  let finiteSurvivalQaly=0;
  for(let k=1;k<=s.survivalYears;k++) finiteSurvivalQaly+=s.utility*s.annualSurvival**(k-.5)/(1+s.discount)**(k-.5);
  const netOverallQaly=(earlyDeathsPreventedBeforeDiscount*finiteSurvivalQaly-fundedBundles*s.fundingOutputAdditionality*s.sharedHarmPerBundle)/(1+s.discount)**(s.delayYears+.5)-s.independentGiftHarm;
  const grossAssociatedResourceUsd=giftUsd+fundedBundles*s.externalLastMileResourcePerBundle;
  const ratio=cost=>netOverallQaly>0?10*cost/netOverallQaly:null;
  return {fundedBundles,creditedIncrementalResponses,earlyDeathsPreventedBeforeDiscount,finiteSurvivalQaly,netOverallQaly,donorCashUsd:giftUsd,grossAssociatedResourceUsd,donorUsdPerQaly:netOverallQaly>0?giftUsd/netOverallQaly:null,donorUsdPer10Qaly:ratio(giftUsd),grossResourceUsdPer10Qaly:ratio(grossAssociatedResourceUsd),sfQaly:null,bayQaly:null,caQaly:null,bayHealthShare:null,sfUsdPer10Qaly:null,bayUsdPer10Qaly:null,conditionalBayUsdPer10AtShare01:netOverallQaly>0?10*giftUsd/(netOverallQaly*.1):null};
}
