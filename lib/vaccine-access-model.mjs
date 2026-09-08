/** Finite-cohort, gross donor-cash model. PAP shipments are stock, never refunds. */
export function vaccineAccessModel(s) {
  const integers = ['initiators', 'completedSeries', 'purchasedSeedDoses', 'approvedEligibleDoses', 'otherSitePapDoses', 'wastedDoses'];
  const fractions = ['clinicalTransfer', 'counterfactualShare'];
  const costs = ['dosePrice', 'adminPerDose', 'navigationPerInitiator', 'setupCash', 'otherCash', 'incompleteHarm', 'extraHarm', 'donatedLaborValue'];
  for (const k of [...integers, ...fractions, ...costs]) {
    if (!Number.isFinite(s[k]) || s[k] < 0 || (integers.includes(k) && !Number.isInteger(s[k])) || (fractions.includes(k) && s[k] > 1)) throw new RangeError('Invalid ' + k);
  }
  const anchors = { 50: 0.001220, 60: 0.003052, 70: 0.005392 };
  const sourceQ = anchors[s.benchmarkAge];
  const doses = s.initiators + s.completedSeries;
  if (!sourceQ || s.initiators < 1 || s.completedSeries > s.initiators || s.approvedEligibleDoses > doses || s.otherSitePapDoses > 200 || s.purchasedSeedDoses < 10) throw new RangeError('Invalid cohort or inventory');
  // Ceiling assumes approved batches arrive within the modeled year. It is not a dated supply simulation.
  const replenished = Math.min(10 * Math.floor(s.approvedEligibleDoses / 10), 10 * Math.floor((200 - s.otherSitePapDoses) / 10));
  const terminalDoses = s.purchasedSeedDoses + replenished - doses - s.wastedDoses;
  if (terminalDoses < 0) throw new RangeError('Insufficient purchased stock for this cohort');
  const deliveryCash = doses * s.adminPerDose + s.initiators * s.navigationPerInitiator + s.setupCash + s.otherCash;
  const donorCash = s.purchasedSeedDoses * s.dosePrice + deliveryCash;
  // Conservative completed-course proxy; source already includes 95.5% trial completion and vaccine adverse effects.
  const netQalys = (s.completedSeries * sourceQ * s.clinicalTransfer - (s.initiators - s.completedSeries) * s.incompleteHarm) * s.counterfactualShare - s.extraHarm;
  // Consumed-resource price proxy, NOT societal ICER or marginal manufacturing cost; stock capital kept separate.
  const consumedResourceProxy = (doses + s.wastedDoses) * s.dosePrice + deliveryCash + s.donatedLaborValue;
  return { doses, replenished, terminalDoses, sourceQ, donorCash, netQalys, consumedResourceProxy,
    costPerTenQalys: netQalys > 0 ? 10 * donorCash / netQalys : null,
    resourceProxyPerTenQalys: netQalys > 0 ? 10 * consumedResourceProxy / netQalys : null,
    maximumCashFor100k: Math.max(0, netQalys) * 10000,
    qalysPer100k: donorCash > 0 ? 100000 * netQalys / donorCash : null };
}
