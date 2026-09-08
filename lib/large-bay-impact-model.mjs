// Conditional donor-health models, not measured organization-wide effectiveness.
function nonnegative(s, keys) {
  for (const key of keys) if (!Number.isFinite(s[key]) || s[key] < 0) throw new RangeError(`Invalid ${key}`);
}
function fractions(s, keys) {
  nonnegative(s, keys);
  for (const key of keys) if (s[key] > 1) throw new RangeError(`Invalid fraction ${key}`);
}
function finish(s, health) {
  nonnegative(s, ['cost', 'harmQalys']);
  fractions(s, ['fundingAdditionality']);
  const netQalys = s.fundingAdditionality === 0 ? 0 : s.fundingAdditionality * (health - s.harmQalys);
  return {netQalys, costPerTenQalys: netQalys > 0 ? 10 * s.cost / netQalys : null,
    maximumCostFor100k: Math.max(0, netQalys) * 10000};
}
export function foodAccessModel(s) {
  fractions(s, ['exitProbability', 'secureShare', 'utility', 'transfer']);
  nonnegative(s, ['adults', 'effectiveYears']);
  return finish(s, s.exitProbability * s.secureShare * s.adults * s.utility * s.transfer * s.effectiveYears);
}
export function benefitAccessModel(s) {
  fractions(s, ['approval', 'enrollmentAdditionality', 'securityEffect', 'utility', 'transfer']);
  nonnegative(s, ['adults', 'effectiveYears']);
  return finish(s, s.approval * s.enrollmentAdditionality * s.securityEffect * s.adults * s.utility * s.transfer * s.effectiveYears);
}
export function foodPharmacyModel(s) {
  nonnegative(s, ['scoreImprovement', 'effectiveYears']);
  fractions(s, ['utilityPerPoint', 'transfer']);
  // Rasch points are not a bounded 0–12 utility scale. The mapping is judgmental.
  const utilityGain = s.scoreImprovement * s.utilityPerPoint * s.transfer;
  if (utilityGain > 1) throw new RangeError('Utility gain exceeds one');
  return finish(s, utilityGain * s.effectiveYears);
}
export function diabetesPreventionModel(s) {
  nonnegative(s, ['extraKg']);
  fractions(s, ['utilityPerKg', 'transfer']);
  if (!Array.isArray(s.retention) || !s.retention.length || s.retention.length > 10
    || s.retention.some(x => !Number.isFinite(x) || x < 0 || x > 1)) throw new RangeError('Invalid retention curve');
  const equivalentYears = s.retention.reduce((sum, x, t) => sum + x / 1.03 ** (t + 0.5), 0);
  const utilityGain = s.extraKg * s.utilityPerKg * s.transfer;
  if (utilityGain > 1) throw new RangeError('Utility gain exceeds one');
  return {...finish(s, utilityGain * equivalentYears), equivalentYears};
}
