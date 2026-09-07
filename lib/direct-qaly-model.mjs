export function directQalyModel({costPerOfferedCourse, trialQalys, transferRetention, additionality, giftUsd = 100000}) {
  for (const [key, value] of Object.entries({costPerOfferedCourse, trialQalys, transferRetention, additionality, giftUsd})) {
    if (!Number.isFinite(value) || value < 0) throw new RangeError(`${key} must be finite and nonnegative`);
  }
  if (costPerOfferedCourse === 0 || transferRetention > 1 || additionality > 1) throw new RangeError('Positive cost and bounded fractions required');
  const qalysPerOfferedCourse = trialQalys * transferRetention * additionality;
  return {qalysPerOfferedCourse, costPerTenQalys: qalysPerOfferedCourse > 0 ? 10 * costPerOfferedCourse / qalysPerOfferedCourse : null, additionalQalys: giftUsd / costPerOfferedCourse * qalysPerOfferedCourse};
}
