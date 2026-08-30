const statuses = new Set(['evaluator-published', 'illustrative', 'blocked-missing-input', 'incomparable']);

export function validateComparableImpact(snapshot) {
  if (snapshot.version !== 'impact-conversions-v0.1') throw new Error('Unexpected comparable-impact version.');
  if (!Array.isArray(snapshot.models) || snapshot.models.length !== 4) throw new Error('Expected four conversion models.');
  if (new Set(snapshot.models.map((model) => model.modelKey)).size !== snapshot.models.length) throw new Error('Conversion model keys must be unique.');
  for (const model of snapshot.models) {
    if (!statuses.has(model.status)) throw new Error(`Unsupported conversion status: ${model.status}`);
    for (const field of ['modelKey', 'name', 'sourceUrl', 'sourceTitle', 'sourceUnit', 'targetUnit', 'formula', 'modelVersion']) {
      if (!model[field]) throw new Error(`${model.modelKey ?? 'model'} is missing ${field}.`);
    }
    if (!Array.isArray(model.assumptions) || !model.assumptions.length || !Array.isArray(model.limitations) || !model.limitations.length) {
      throw new Error(`${model.modelKey} must disclose assumptions and limitations.`);
    }
  }
  if (!snapshot.models.some((model) => model.targetUnit === '$CG' && model.status === 'evaluator-published')) throw new Error('Missing published $CG model.');
  if (!snapshot.models.some((model) => model.targetUnit === 'WELLBY' && model.status === 'blocked-missing-input')) throw new Error('WELLBY must remain blocked without inputs.');
  return snapshot;
}

export function qalyCost(costPerLifeSaved, qalysPerLifeSaved) {
  if (!(costPerLifeSaved > 0) || !(qalysPerLifeSaved > 0)) throw new Error('QALY inputs must be positive.');
  return costPerLifeSaved / qalysPerLifeSaved;
}

export function coefficientGivingValue({ people, incomeGainPercent, years, costUsd }) {
  if (![people, incomeGainPercent, years, costUsd].every((value) => value > 0)) throw new Error('$CG inputs must be positive.');
  const valueCg = 50000 * people * Math.log1p(incomeGainPercent / 100) * years;
  return { valueCg, sroi: valueCg / costUsd };
}
