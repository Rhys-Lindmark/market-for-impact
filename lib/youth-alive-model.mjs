
export const inputs = {
  modelVersion: "youth-alive-v2",
  gift: 100000,
  fy2024Expense: 7305670,
  fy2024Revenue: 8893727,
  fy2024NetAssets: 5186146,
  fy2024ProgramServiceRevenue: 5378511,
  currentCalvipAward: 5000000,
  historicalCountyContract: 267294,
  historicalCountyMinimumComprehensiveClients: 180,
  historicalCountyCostPerMinimumClient: 267294 / 180,
  chongReportedFiveYearHvipQaly: 4.64,
  chongReportedFiveYearReferralQaly: 4.62,
  chongReportedFiveYearIncrementalQaly: 4.64 - 4.62,
  chongAbstractIncrementalCost: 3574 - 3515,
  chongAbstractIcer: 2941
};

export const scenarios = [
  {name:"harm", weight:.10, cicAllocation:.20, fundingAdditionality:.15, serviceRealization:.80, donorCostPerAddedClient:2500, evidenceTransfer:-.25, externalResourcesPerClient:1500},
  {name:"null", weight:.35, cicAllocation:.20, fundingAdditionality:.15, serviceRealization:.80, donorCostPerAddedClient:2500, evidenceTransfer:0, externalResourcesPerClient:1500},
  {name:"cautiousPositive", weight:.35, cicAllocation:.25, fundingAdditionality:.20, serviceRealization:.85, donorCostPerAddedClient:2500, evidenceTransfer:.20, externalResourcesPerClient:1500},
  {name:"central", weight:.15, cicAllocation:.40, fundingAdditionality:.35, serviceRealization:.90, donorCostPerAddedClient:1800, evidenceTransfer:.50, externalResourcesPerClient:750},
  {name:"favorableStress", weight:.05, cicAllocation:.70, fundingAdditionality:.60, serviceRealization:.95, donorCostPerAddedClient:inputs.historicalCountyCostPerMinimumClient, evidenceTransfer:.90, externalResourcesPerClient:300}
];

export function calculate(scenarioInputs=scenarios) {
const results = scenarioInputs.map(s => {
  const giftCashDirected = inputs.gift * s.cicAllocation;
  const additionalCash = giftCashDirected * s.fundingAdditionality;
  const addedClientsBeforeRealization = additionalCash / s.donorCostPerAddedClient;
  const realizedAddedClients = addedClientsBeforeRealization * s.serviceRealization;
  const qalyPerRealizedClient = inputs.chongReportedFiveYearIncrementalQaly * s.evidenceTransfer;
  const giftQaly = realizedAddedClients * qalyPerRealizedClient;
  const externalResources = realizedAddedClients * s.externalResourcesPerClient;
  const grossResources = inputs.gift + externalResources;
  return {
    ...s,
    giftCashDirected,
    additionalCash,
    addedClientsBeforeRealization,
    realizedAddedClients,
    qalyPerRealizedClient,
    giftQaly,
    grossResources,
    externalResources,
    bayQaly: giftQaly,
    sfQaly: 0,
    donorCostPer10Qaly: giftQaly > 0 ? inputs.gift * 10 / giftQaly : null,
    grossCostPer10Qaly: giftQaly > 0 ? grossResources * 10 / giftQaly : null
  };
});

const weighted = results.reduce((a,r) => {
  a.giftQaly += r.weight * r.giftQaly;
  a.grossResources += r.weight * r.grossResources;
  a.bayQaly += r.weight * r.bayQaly;
  return a;
}, {giftQaly:0, grossResources:0, bayQaly:0});
weighted.sfQaly = 0;
weighted.favorableQalyContribution = results[4].weight * results[4].giftQaly;
weighted.donorCostPer10Qaly = weighted.giftQaly > 0 ? inputs.gift * 10 / weighted.giftQaly : null;
weighted.grossCostPer10Qaly = weighted.giftQaly > 0 ? weighted.grossResources * 10 / weighted.giftQaly : null;
weighted.bayImpactShare = weighted.giftQaly > 0 ? weighted.bayQaly / weighted.giftQaly : null;
weighted.sfImpactShare = weighted.giftQaly > 0 ? 0 : null;
weighted.favorableShareOfSignedExpectedQaly = weighted.giftQaly > 0 ? weighted.favorableQalyContribution / weighted.giftQaly : null;

const nonFavorableWeight = 1 - results[4].weight;
const nonFavorableGiftQaly = results.slice(0,4).reduce((sum,r) => sum + r.weight * r.giftQaly, 0) / nonFavorableWeight;
const noFavorable = {
  giftQaly: nonFavorableGiftQaly,
  donorCostPer10Qaly: nonFavorableGiftQaly > 0 ? inputs.gift * 10 / nonFavorableGiftQaly : null
};

return {inputs, scenarios:results, weighted, noFavorable};
}
