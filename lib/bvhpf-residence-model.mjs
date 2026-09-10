import { calculate as calculateAccepted } from './bvhpf-model.mjs';

// Residence allocation is deliberately separate from verified service geography.
// These shares are analyst sensitivities, not measured beneficiary residence.
export const residenceScenarios = [
  {
    id: 'wide-low',
    sfResidentShare: 0.25,
    bayResidentShare: 0.55,
    rationale: 'Allows substantial period mismatch, cross-program duplication, temporary out-of-county eligibility, and nonresident participation in the broader 400-client umbrella.'
  },
  {
    id: 'subjective-central',
    sfResidentShare: 0.65,
    bayResidentShare: 0.90,
    rationale: 'Judgmental center informed by the nominal 220/400 older contracted-outpatient ratio and SF-based service mission, discounted because 220 is period-mismatched and not unduplicated across programs; assumes most remaining clients reside elsewhere in the nine-county Bay Area.'
  },
  {
    id: 'wide-high',
    sfResidentShare: 0.90,
    bayResidentShare: 0.99,
    rationale: 'High-side sensitivity if nearly all SF-site clients are local residents; not supported by a measured residence table.'
  }
];

function ratio(gift, qaly) {
  return qaly > 0 ? gift * 10 / qaly : null;
}

export function calculateResidenceSensitivity(base = calculateAccepted(), shares = residenceScenarios) {
  const totalNetQaly = base.weighted.netQaly;
  const totalPositiveQaly = base.weighted.positiveQaly;
  const giftUsd = base.inputs.giftUsd;
  const rows = shares.map((s) => {
    if (!Number.isFinite(s.sfResidentShare) || !Number.isFinite(s.bayResidentShare) || s.sfResidentShare < 0 || s.bayResidentShare > 1 || s.sfResidentShare > s.bayResidentShare) {
      throw new RangeError('resident shares must satisfy 0 <= SF <= Bay <= 1');
    }
    const sfResidentNetQaly = totalNetQaly * s.sfResidentShare;
    const bayResidentNetQaly = totalNetQaly * s.bayResidentShare;
    return {
      ...s,
      evidenceStatus: 'subjective residence-allocation sensitivity; not measured',
      sfResidentNetQaly,
      bayResidentNetQaly,
      sfResidentDonorCostPer10Qaly: ratio(giftUsd, sfResidentNetQaly),
      bayResidentDonorCostPer10Qaly: ratio(giftUsd, bayResidentNetQaly),
      sfResidentPositiveQaly: totalPositiveQaly * s.sfResidentShare,
      bayResidentPositiveQaly: totalPositiveQaly * s.bayResidentShare
    };
  });
  return {
    verifiedServiceSiteShares: { sf: 1, bay: 1, basis: 'credited behavioral-health services are delivered at SF sites; this does not measure client residence' },
    measuredResidentShares: { sf: null, bay: null },
    totalHealthUnchanged: {
      netQaly: totalNetQaly,
      positiveQaly: totalPositiveQaly,
      donorCostPer10Qaly: base.weighted.modeledOrdinaryGiftCostPer10Qaly
    },
    residenceSensitivity: rows,
    displayRecommendation: 'Keep resident-local prices out of the primary SF/Bay ranking unless explicitly labeled subjective sensitivity; display the verified result as SF service-site-attributed, not SF-resident health.'
  };
}

if (import.meta.url === `file://${process.argv[1]}`) console.log(JSON.stringify(calculateResidenceSensitivity(), null, 2));
