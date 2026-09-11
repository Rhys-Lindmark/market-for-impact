// An explicitly modeled null Bay result must not fall back to a positive SF result.
export function localResearchEstimate(row) {
  const hasBay = Object.hasOwn(row, 'bayUsdPerTenQalys');
  return {
    localUsdPerTenQalys: hasBay ? row.bayUsdPerTenQalys : row.centralUsdPerTenQalys,
    estimateGeography: hasBay ? 'Bay Area' : 'San Francisco',
    localStatus: (hasBay ? row.bayUsdPerTenQalys : row.centralUsdPerTenQalys) === null ? 'Local impact not estimated; see report' : hasBay ? 'Modeled Bay Area impact; see report for assumptions' : 'SF-only modeled benefit within the Bay Area; wider spillovers unquantified',
  };
}
