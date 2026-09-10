export const inputs = {
  giftUsd: 100000,
  currentFy2025ExpenseUsd: 17782834,
  reportedAnnualBehavioralHealthClientsFloor: 400,
  reportedCurrentWholeOrganizationPeopleFloor: 1500,
  matchedFy2023ExpenseUsd: 19334712,
  fy2023AdultOutpatientClients: 196,
  fy2023ChildOutpatientClients: 24,
  currentFy2025RevenueUsd: 17833260,
  currentFy2025NetAssetsUsd: -1408469,
  bayShareOfCreditedQaly: 1,
  sfShareOfCreditedQaly: 1,
};

export const scenarios = [
  { name: 'harm', weight: .03, fundingAdditionality: .10, uniqueClientReliability: .85, utilityGain: 0, durationYears: 0, benefitDelayYears: 0, clinicalApplicability: 0, harmQalyPerAdditionalClient: .01 },
  { name: 'null', weight: .42, fundingAdditionality: 0, uniqueClientReliability: .75, utilityGain: 0, durationYears: 0, benefitDelayYears: 0, clinicalApplicability: 0, harmQalyPerAdditionalClient: 0 },
  { name: 'cautious', weight: .25, fundingAdditionality: .05, uniqueClientReliability: .80, utilityGain: .02, durationYears: .50, benefitDelayYears: .10, clinicalApplicability: .25, harmQalyPerAdditionalClient: 0 },
  { name: 'central', weight: .25, fundingAdditionality: .15, uniqueClientReliability: .90, utilityGain: .05, durationYears: .75, benefitDelayYears: .10, clinicalApplicability: .50, harmQalyPerAdditionalClient: 0 },
  { name: 'favorable', weight: .05, fundingAdditionality: .35, uniqueClientReliability: .95, utilityGain: .11, durationYears: 1, benefitDelayYears: .05, clinicalApplicability: .70, harmQalyPerAdditionalClient: 0 },
];

export function finiteQalyPerApplicableClient(s, discountRate = .03) {
  for (const key of ['utilityGain', 'durationYears', 'benefitDelayYears']) if (s[key] < 0) throw new RangeError(key);
  if (discountRate < 0) throw new RangeError('discountRate');
  if (s.durationYears === 0) return 0;
  return s.utilityGain * s.durationYears / (1 + discountRate) ** (s.benefitDelayYears + s.durationYears / 2);
}

export function calculate(i = inputs, ss = scenarios) {
  const weight = ss.reduce((sum, s) => sum + s.weight, 0);
  if (Math.abs(weight - 1) > 1e-12) throw new RangeError('scenario weights must sum to 1');
  const creditedReportedClients = i.reportedAnnualBehavioralHealthClientsFloor;
  const giftShare = i.giftUsd / i.currentFy2025ExpenseUsd;
  const giftLinkedReportedClients = creditedReportedClients * giftShare;
  const rows = ss.map((s) => {
    const reliableGiftLinkedClients = giftLinkedReportedClients * s.uniqueClientReliability;
    const additionalClients = reliableGiftLinkedClients * s.fundingAdditionality;
    const finiteClientQaly = finiteQalyPerApplicableClient(s);
    const positiveQaly = additionalClients * finiteClientQaly * s.clinicalApplicability;
    const harmQaly = additionalClients * s.harmQalyPerAdditionalClient;
    const netQaly = positiveQaly - harmQaly;
    const knownGrossResourcesUsd = i.giftUsd;
    return {
      ...s,
      reliableGiftLinkedClients,
      additionalClients,
      finiteClientQaly,
      positiveQaly,
      harmQaly,
      netQaly,
      knownGrossResourcesUsd,
      modeledOrdinaryGiftCostPer10Qaly: netQaly > 0 ? i.giftUsd * 10 / netQaly : null,
      modeledKnownGrossCostPer10Qaly: netQaly > 0 ? knownGrossResourcesUsd * 10 / netQaly : null,
      verifiedMarginalGiftCostPer10Qaly: null,
      verifiedMarginalGrossCostPer10Qaly: null,
      bayQaly: netQaly * i.bayShareOfCreditedQaly,
      sfQaly: netQaly * i.sfShareOfCreditedQaly,
    };
  });
  const weighted = rows.reduce((a, r) => {
    a.netQaly += r.weight * r.netQaly;
    a.positiveQaly += r.weight * Math.max(0, r.netQaly);
    a.knownGrossResourcesUsd += r.weight * r.knownGrossResourcesUsd;
    return a;
  }, { netQaly: 0, positiveQaly: 0, knownGrossResourcesUsd: 0 });
  weighted.modeledOrdinaryGiftCostPer10Qaly = weighted.netQaly > 0 ? i.giftUsd * 10 / weighted.netQaly : null;
  weighted.positiveOnlyModeledGiftCostPer10Qaly = weighted.positiveQaly > 0 ? i.giftUsd * 10 / weighted.positiveQaly : null;
  weighted.modeledKnownGrossCostPer10Qaly = weighted.netQaly > 0 ? weighted.knownGrossResourcesUsd * 10 / weighted.netQaly : null;
  const favorable = rows.find((r) => r.name === 'favorable');
  weighted.favorableTailQalyContribution = favorable ? favorable.weight * favorable.netQaly : 0;
  weighted.favorableTailShareOfNetQaly = weighted.netQaly === 0 ? null : weighted.favorableTailQalyContribution / weighted.netQaly;
  weighted.bayImpactShare = weighted.netQaly === 0 ? null : i.bayShareOfCreditedQaly;
  weighted.sfImpactShare = weighted.netQaly === 0 ? null : i.sfShareOfCreditedQaly;
  weighted.verifiedMarginalGiftCostPer10Qaly = null;
  weighted.verifiedMarginalGrossCostPer10Qaly = null;
  return {
    inputs: i,
    creditedReportedClients,
    giftShare,
    giftLinkedReportedClients,
    scenarios: rows,
    weighted,
    unknownExternalResources: [
      'Medi-Cal and other medical care induced outside BVHPF',
      'client and caregiver time and travel',
      'housing subsidies and public services outside the Form 990 expense boundary',
      'any donated professional services not recognized in Form 990 expense',
    ],
    verdict: 'PUBLISH RESEARCH; GIVING HOLD: severe direct clinical mechanism and balance-sheet fragility, but liquidity and a priced ordinary-gift capacity pathway are unestablished and organization-level clinical outcomes are absent.',
  };
}

if (import.meta.url === `file://${process.argv[1]}`) console.log(JSON.stringify(calculate(), null, 2));
