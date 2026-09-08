/**
 * Roots whole-gift BP model v1. Pure ES module; no file I/O or import side effects.
 * All local numerical assumptions are judgments, not measured Roots outcomes.
 * Input bounds are computational/domain limits, not uncertainty intervals.
 * Ledgers are nested (SF within Bay within US) and must never be added.
 */
export const INPUT_BOUNDS = Object.freeze(Object.fromEntries(Object.entries({
  gift_usd: [0, 1e12],
  bp_fraction: [0, 1],
  course_cash_usd: [0.01, 1e12],
  extra_resource_usd_per_course: [0, 1e12],
  years: [5, 5],
  start_delay_years: [0, 100],
  usual_care_risk: [0, 1],
  sbp_difference: [0, 100],
  funding_additionality: [0, 1],
  bay_share: [0, 1],
  sf_share: [0, 1],
  fatal_share: [0, 1],
  fatal_utility: [0, 1],
  fatal_years: [0, 120],
  nonfatal_loss: [0, 1],
  nonfatal_years: [0, 120],
  annual_competing_mortality: [0, 1],
  discount: [0, 1],
  shared_harm_q_per_course: [0, 1e6],
  independent_harm_q: [0, 1e12],
}).map(([key, bounds]) => [key, Object.freeze(bounds)])));

export function validateInputs(p) {
  if (p === null || typeof p !== 'object' || Array.isArray(p)) {
    throw new TypeError('Roots inputs must be an object.');
  }
  for (const [key, [min, max]] of Object.entries(INPUT_BOUNDS)) {
    if (!Object.hasOwn(p, key) || typeof p[key] !== 'number' || !Number.isFinite(p[key])) {
      throw new TypeError(`${key} must be a finite required number.`);
    }
    if (p[key] < min || p[key] > max) {
      throw new RangeError(`${key} must be between ${min} and ${max}.`);
    }
  }
  for (const key of ['years', 'fatal_years', 'nonfatal_years']) {
    if (!Number.isInteger(p[key])) throw new RangeError(`${key} must be an integer.`);
  }
  if (!Object.hasOwn(p, 'clip_at_course_end') || typeof p.clip_at_course_end !== 'boolean') {
    throw new TypeError('clip_at_course_end must be a required boolean.');
  }
  if (p.sf_share > p.bay_share) throw new RangeError('sf_share cannot exceed bay_share.');
}

// Null means no finite positive cost-effectiveness ratio, including overflow.
const price = (cost, health) => {
  if (health <= 0) return null;
  const value = 10 * cost / health;
  return Number.isFinite(value) ? value : null;
};

export function calculate(p) {
  validateInputs(p);
  const n = p.gift_usd * p.bp_fraction / p.course_cash_usd;
  const rr = 0.8 ** (p.sbp_difference / 10);
  const r1 = p.usual_care_risk * rr;
  const pc = 1 - (1 - p.usual_care_risk) ** 0.2;
  const pt = 1 - (1 - r1) ** 0.2;
  let q = 0;
  let events = 0;
  const schedule = [];
  for (let j = 1; j <= 5; j++) {
    const t = j - 0.5;
    // Signed annual differences are retained, including later negative ones.
    const delta = (1 - pc) ** (j - 1) * pc - (1 - pt) ** (j - 1) * pt;
    let tail = 0;
    for (const [weight, utility, years] of [
      [p.fatal_share, p.fatal_utility, p.fatal_years],
      [1 - p.fatal_share, p.nonfatal_loss, p.nonfatal_years],
    ]) {
      for (let k = 1; k <= years; k++) {
        // Clipping is care-relative; discount time also includes start delay.
        if (p.clip_at_course_end && t + k > 5) continue;
        tail += weight * utility * (1 - p.annual_competing_mortality) ** k
          / (1 + p.discount) ** (p.start_delay_years + t + k);
      }
    }
    q += delta * tail;
    events += delta;
    schedule.push({event_year: j, first_event_difference: delta, discounted_q_per_event: tail});
  }
  const health = n * p.funding_additionality * (q - p.shared_harm_q_per_course)
    - p.independent_harm_q;
  // Gross associated public/partner inputs outside donor cash; not net costs.
  const resource = p.gift_usd + n * p.extra_resource_usd_per_course;
  return {
    offers: n,
    incremental_first_events: n * p.funding_additionality * events,
    all_us_q: health,
    bay_q: health * p.bay_share || 0,
    sf_q: health * p.sf_share || 0,
    gift_usd: p.gift_usd,
    gross_resource_usd: resource,
    donor_us_per_10q: price(p.gift_usd, health),
    donor_bay_per_10q: price(p.gift_usd, health * p.bay_share),
    donor_sf_per_10q: price(p.gift_usd, health * p.sf_share),
    resource_bay_per_10q: price(resource, health * p.bay_share),
    schedule,
  };
}
