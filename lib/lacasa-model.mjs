export const DEFAULT_INPUTS = Object.freeze({
  giftUsd: 100_000,
  fy2025WholeOrgExpenseUsd: 4_560_661,
  observedBroadDirectServiceUmbrella: 1_384,
  communityOfficeSubsetDiagnostic: 885,
  reportedDonatedServicesAndEquipmentUsd: 95_586,
  donatedServicesReconciledToIrsExpense: null,
  scenarios: Object.freeze([
    Object.freeze({
      id: 'harm', weight: 0.05, adultEligibleShare: 0.70,
      fullAdvocacyDoseShare: 0.20, fundingAdditionality: 0.15,
      qalyPerFullAdvocacyEquivalent: -0.02,
      bayRecipientShare: 0.90, sfRecipientShare: 0.70,
      grossResourceMultiplier: 1.50,
    }),
    Object.freeze({
      id: 'funding-null', weight: 0.25, adultEligibleShare: 0.70,
      fullAdvocacyDoseShare: 0.20, fundingAdditionality: 0,
      qalyPerFullAdvocacyEquivalent: 0.05,
      bayRecipientShare: 0.98, sfRecipientShare: 0.85,
      grossResourceMultiplier: 1.15,
    }),
    Object.freeze({
      id: 'evidence-null', weight: 0.20, adultEligibleShare: 0.70,
      fullAdvocacyDoseShare: 0.20, fundingAdditionality: 0.15,
      qalyPerFullAdvocacyEquivalent: 0,
      bayRecipientShare: 0.98, sfRecipientShare: 0.85,
      grossResourceMultiplier: 1.15,
    }),
    Object.freeze({
      id: 'cautious', weight: 0.25, adultEligibleShare: 0.50,
      fullAdvocacyDoseShare: 0.05, fundingAdditionality: 0.05,
      qalyPerFullAdvocacyEquivalent: 0.01,
      bayRecipientShare: 0.90, sfRecipientShare: 0.70,
      grossResourceMultiplier: 1.25,
    }),
    Object.freeze({
      id: 'central', weight: 0.20, adultEligibleShare: 0.70,
      fullAdvocacyDoseShare: 0.20, fundingAdditionality: 0.15,
      qalyPerFullAdvocacyEquivalent: 0.05,
      bayRecipientShare: 0.98, sfRecipientShare: 0.85,
      grossResourceMultiplier: 1.15,
    }),
    Object.freeze({
      id: 'favorable', weight: 0.05, adultEligibleShare: 0.85,
      fullAdvocacyDoseShare: 0.50, fundingAdditionality: 0.40,
      qalyPerFullAdvocacyEquivalent: 0.15,
      bayRecipientShare: 0.99, sfRecipientShare: 0.95,
      grossResourceMultiplier: 1.10,
    }),
  ]),
});

export const EVIDENCE_BRIDGE = Object.freeze({
  intensiveAdvocacyResponderNnt: 8,
  modeledAnnualUtilityGap: 0.22,
  finiteDurationYears: 2,
  impliedQalyPerFullAdvocacyEquivalent: (1 / 8) * 0.22 * 2,
  chosenCentralQalyPerFullAdvocacyEquivalent: 0.05,
  favorableQalyPerFullAdvocacyEquivalent: 0.15,
  favorableRationale: 'Deliberately wide 5%-weight tail allowing a higher responder share and broader mental-health/safety gains within a finite window; not a measured La Casa effect.',
});

function finiteNumber(value, label) {
  if (!Number.isFinite(value)) throw new TypeError(`${label} must be finite`);
}

function costPerTen(numerator, qaly) {
  return qaly > 0 ? (numerator * 10) / qaly : null;
}

export function calculate(inputs = DEFAULT_INPUTS) {
  const {giftUsd, fy2025WholeOrgExpenseUsd, observedBroadDirectServiceUmbrella, communityOfficeSubsetDiagnostic, reportedDonatedServicesAndEquipmentUsd, scenarios} = inputs;
  finiteNumber(giftUsd, 'giftUsd');
  finiteNumber(fy2025WholeOrgExpenseUsd, 'fy2025WholeOrgExpenseUsd');
  finiteNumber(observedBroadDirectServiceUmbrella, 'observedBroadDirectServiceUmbrella');
  finiteNumber(communityOfficeSubsetDiagnostic, 'communityOfficeSubsetDiagnostic');
  finiteNumber(reportedDonatedServicesAndEquipmentUsd, 'reportedDonatedServicesAndEquipmentUsd');
  if (giftUsd < 0) throw new RangeError('giftUsd must be nonnegative');
  if (fy2025WholeOrgExpenseUsd <= 0) throw new RangeError('fy2025WholeOrgExpenseUsd must be positive');
  if (observedBroadDirectServiceUmbrella < 0) throw new RangeError('observedBroadDirectServiceUmbrella must be nonnegative');
  if (communityOfficeSubsetDiagnostic < 0 || communityOfficeSubsetDiagnostic > observedBroadDirectServiceUmbrella) throw new RangeError('communityOfficeSubsetDiagnostic must be nonnegative and no greater than the umbrella');
  if (reportedDonatedServicesAndEquipmentUsd < 0) throw new RangeError('reportedDonatedServicesAndEquipmentUsd must be nonnegative');
  if (!Array.isArray(scenarios) || scenarios.length === 0) throw new TypeError('scenarios must be a nonempty array');

  let weightSum = 0;
  const rows = scenarios.map((scenario) => {
    for (const key of ['weight','adultEligibleShare','fullAdvocacyDoseShare','fundingAdditionality','qalyPerFullAdvocacyEquivalent','bayRecipientShare','sfRecipientShare','grossResourceMultiplier']) {
      finiteNumber(scenario[key], `${scenario.id}.${key}`);
    }
    if (scenario.weight < 0) throw new RangeError(`${scenario.id}.weight must be nonnegative`);
    for (const key of ['adultEligibleShare','fullAdvocacyDoseShare','fundingAdditionality','bayRecipientShare','sfRecipientShare']) {
      if (scenario[key] < 0 || scenario[key] > 1) throw new RangeError(`${scenario.id}.${key} must be between zero and one`);
    }
    if (scenario.sfRecipientShare > scenario.bayRecipientShare) throw new RangeError(`${scenario.id} SF share must not exceed Bay share`);
    if (scenario.grossResourceMultiplier < 1) throw new RangeError(`${scenario.id}.grossResourceMultiplier must be at least one`);
    weightSum += scenario.weight;

    const proRataObservedRecipients = observedBroadDirectServiceUmbrella * giftUsd / fy2025WholeOrgExpenseUsd;
    const fundedFullAdvocacyEquivalents = proRataObservedRecipients
      * scenario.adultEligibleShare
      * scenario.fullAdvocacyDoseShare
      * scenario.fundingAdditionality;
    const qaly = fundedFullAdvocacyEquivalents * scenario.qalyPerFullAdvocacyEquivalent;
    return {
      ...scenario,
      proRataObservedRecipients,
      fundedFullAdvocacyEquivalents,
      qaly,
      bayQaly: qaly * scenario.bayRecipientShare,
      sfQaly: qaly * scenario.sfRecipientShare,
      grossResourcesUsd: giftUsd * scenario.grossResourceMultiplier,
      donorUsdPerTenQaly: costPerTen(giftUsd, qaly),
      grossUsdPerTenQaly: costPerTen(giftUsd * scenario.grossResourceMultiplier, qaly),
    };
  });
  if (Math.abs(weightSum - 1) > 1e-12) throw new RangeError('scenario weights must sum to one');

  const weighted = rows.reduce((acc, row) => {
    acc.qaly += row.weight * row.qaly;
    acc.bayQaly += row.weight * row.bayQaly;
    acc.sfQaly += row.weight * row.sfQaly;
    acc.grossResourcesUsd += row.weight * row.grossResourcesUsd;
    return acc;
  }, {qaly: 0, bayQaly: 0, sfQaly: 0, grossResourcesUsd: 0});
  const favorable = rows.find((row) => row.id === 'favorable');
  const favorableContribution = favorable ? favorable.weight * favorable.qaly : 0;
  const noFavorableQaly = weighted.qaly - favorableContribution;
  return {
    inputs: {giftUsd, fy2025WholeOrgExpenseUsd, observedBroadDirectServiceUmbrella, communityOfficeSubsetDiagnostic, reportedDonatedServicesAndEquipmentUsd, donatedServicesReconciledToIrsExpense: inputs.donatedServicesReconciledToIrsExpense},
    evidenceBridge: EVIDENCE_BRIDGE,
    rows,
    weighted: {
      ...weighted,
      donorUsdPerTenQaly: costPerTen(giftUsd, weighted.qaly),
      grossUsdPerTenQaly: costPerTen(weighted.grossResourcesUsd, weighted.qaly),
      bayDonorUsdPerTenQaly: costPerTen(giftUsd, weighted.bayQaly),
      sfDonorUsdPerTenQaly: costPerTen(giftUsd, weighted.sfQaly),
      favorableQalyContribution: favorableContribution,
      favorableContributionShare: weighted.qaly > 0 ? favorableContribution / weighted.qaly : null,
      noFavorableQaly,
      noFavorableDonorUsdPerTenQaly: costPerTen(giftUsd, noFavorableQaly),
    },
  };
}

export default calculate;
