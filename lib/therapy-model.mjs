/** Exploratory group-score mapping; not a validated individual change-score model. */
export function therapyDecisionModel({ costPerOfferedCourse, physicalScoreGain, utilityPerPhysicalPoint, transferRetention, effectiveWeeks, additionality, giftUsd = 100000 }) {
  for (const [key, value] of Object.entries({ costPerOfferedCourse, physicalScoreGain, utilityPerPhysicalPoint, transferRetention, effectiveWeeks, additionality, giftUsd })) {
    if (!Number.isFinite(value) || value < 0) throw new RangeError(key + ' must be finite and nonnegative');
  }
  if (!costPerOfferedCourse || transferRetention > 1 || additionality > 1 || effectiveWeeks > 52) throw new RangeError('Invalid cost, retention or one-year horizon');
  const mappedPeakUtility = physicalScoreGain * utilityPerPhysicalPoint;
  if (mappedPeakUtility > 1) throw new RangeError('Mapped utility gain exceeds one');
  const qalysPerOfferedCourse = mappedPeakUtility * transferRetention * effectiveWeeks / 52 * additionality;
  return { mappedPeakUtility, qalysPerOfferedCourse, fundedCourses: giftUsd / costPerOfferedCourse, additionalQalys: giftUsd / costPerOfferedCourse * qalysPerOfferedCourse, costPerTenQalys: qalysPerOfferedCourse > 0 ? 10 * costPerOfferedCourse / qalysPerOfferedCourse : null };
}
