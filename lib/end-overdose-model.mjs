/**
 * End Overdose whole-gift rescue model v1. Pure ES module: no I/O or side effects.
 * Inputs are analyst priors, not measured EO effects. Bounds are computational
 * and domain limits, not uncertainty intervals. US/Bay/SF health is nested.
 */
export const INPUT_BOUNDS = Object.freeze(Object.fromEntries(Object.entries({
  gift_usd: [0, 1e12],
  core_fraction: [0, 1],
  kit_cash_usd: [0, 1e12],
  operations_cash_usd: [0, 1e12],
  unpaid_resource_per_offer_usd: [0, 1e12],
  donated_stock_resource_per_offer_usd: [0, 1e12],
  encounter_probability: [0, 1],
  unique_scene_factor: [0, 1],
  incremental_timely_rescue_probability: [0, 1],
  mortality_risk_reduction_given_extra_rescue: [0, 1],
  funding_additionality: [0, 1],
  survival_utility: [0, 1],
  annual_competing_mortality: [0, 1],
  health_years: [0, 120],
  discount_rate: [0, 1],
  event_delay_years: [0, 100],
  sf_health_share: [0, 1],
  rest_bay_health_share: [0, 1],
  shared_harm_qaly: [0, 1e12],
  donor_specific_harm_qaly: [0, 1e12],
}).map(([key, bounds]) => [key, Object.freeze(bounds)])));

export function validateInputs(p) {
  if (p === null || typeof p !== 'object' || Array.isArray(p)) {
    throw new TypeError('End Overdose inputs must be an object.');
  }
  for (const [key, [min, max]] of Object.entries(INPUT_BOUNDS)) {
    if (!Object.hasOwn(p, key) || typeof p[key] !== 'number' || !Number.isFinite(p[key])) {
      throw new TypeError(`${key} must be a finite required number.`);
    }
    if (p[key] < min || p[key] > max) {
      throw new RangeError(`${key} must be between ${min} and ${max}.`);
    }
  }
  if (!Number.isInteger(p.health_years)) throw new RangeError('health_years must be an integer.');
  if (p.kit_cash_usd + p.operations_cash_usd < 0.01) {
    throw new RangeError('Complete offered-package cash must be at least $0.01.');
  }
  if (p.sf_health_share + p.rest_bay_health_share > 1) {
    throw new RangeError('SF plus other Bay health shares cannot exceed 1.');
  }
}

// Null means no finite positive ratio, including floating-point overflow.
const price = (cost, health) => {
  if (health <= 0) return null;
  const value = 10 * cost / health;
  return Number.isFinite(value) ? value : null;
};

export function calculate(p) {
  validateInputs(p);
  const offers = p.gift_usd * p.core_fraction / (p.kit_cash_usd + p.operations_cash_usd);
  let finiteHealth = 0;
  // Explicit finite sum preserves the accepted model's numerical evaluation.
  for (let k = 1; k <= p.health_years; k++) {
    finiteHealth += p.survival_utility * (1 - p.annual_competing_mortality) ** k
      / (1 + p.discount_rate) ** k;
  }
  const deaths = offers * p.encounter_probability * p.unique_scene_factor
    * p.incremental_timely_rescue_probability * p.mortality_risk_reduction_given_extra_rescue
    * p.funding_additionality;
  const health = deaths * finiteHealth / (1 + p.discount_rate) ** p.event_delay_years
    - p.funding_additionality * p.shared_harm_qaly - p.donor_specific_harm_qaly;
  // Gross associated resources, not net additional societal spending.
  const resource = p.gift_usd + offers
    * (p.unpaid_resource_per_offer_usd + p.donated_stock_resource_per_offer_usd);
  const region = share => {
    const qaly = health * share || 0; // Normalize negative zero for JSON round trips.
    return {
      qaly,
      donor_usd_per_10_qaly: price(p.gift_usd, qaly),
      gross_resource_usd_per_10_qaly: price(resource, qaly),
    };
  };
  return {
    offers,
    finite_qaly_per_death_at_rescue: finiteHealth,
    deaths_averted: deaths,
    gross_resource_usd: resource,
    global: region(1),
    bay: region(p.sf_health_share + p.rest_bay_health_share),
    sf: region(p.sf_health_share),
  };
}
