import crypto from 'node:crypto';

const allowedMeasurementStates = new Set(['administrative-outcome', 'administrative-plus-clinical-outcome', 'survey-outcome', 'model-required']);
const blockedConversionState = 'blocked-no-local-conversion-model';

export function validateSfOutcomeOntology(snapshot) {
  if (snapshot.version !== 'sf-outcome-ontology-v0.1') throw new Error('Unexpected San Francisco ontology version.');
  if (snapshot.outcomes.length !== 8) throw new Error(`Expected eight local outcomes, received ${snapshot.outcomes.length}.`);
  if (new Set(snapshot.outcomes.map((item) => item.key)).size !== snapshot.outcomes.length) throw new Error('Outcome keys must be unique.');
  if (new Set(snapshot.sources.map((item) => item.key)).size !== snapshot.sources.length) throw new Error('Source keys must be unique.');
  const sourceKeys = new Set(snapshot.sources.map((item) => item.key));
  for (const source of snapshot.sources) {
    for (const key of ['key', 'publisher', 'title', 'url', 'retrievedAt', 'coverageNote']) if (!source[key]) throw new Error(`${source.key ?? 'source'} is missing ${key}.`);
    if (!source.url.startsWith('https://')) throw new Error(`${source.key} must use HTTPS.`);
    if (source.monitor.mode === 'binary-sha256' && !/^[a-f0-9]{64}$/.test(source.monitor.sha256)) throw new Error(`${source.key} has an invalid binary hash.`);
    if (source.monitor.mode === 'semantic-signals' && (!Array.isArray(source.monitor.signals) || source.monitor.signals.length < 2)) throw new Error(`${source.key} requires at least two semantic signals.`);
  }
  for (const outcome of snapshot.outcomes) {
    for (const key of ['key', 'label', 'question', 'canonicalUnit', 'observableMeasure', 'unitSemantics', 'population', 'timeWindow', 'direction', 'measurementState', 'attributionState']) if (!outcome[key]) throw new Error(`${outcome.key ?? 'outcome'} is missing ${key}.`);
    if (!allowedMeasurementStates.has(outcome.measurementState)) throw new Error(`${outcome.key} has an invalid measurement state.`);
    if (outcome.attributionState !== 'counterfactual-required') throw new Error(`${outcome.key} weakens the attribution rule.`);
    if (outcome.qalyState !== blockedConversionState || outcome.wellbyState !== blockedConversionState) throw new Error(`${outcome.key} exposes an unsupported conversion.`);
    for (const key of outcome.sourceKeys) if (!sourceKeys.has(key)) throw new Error(`${outcome.key} references missing source ${key}.`);
    for (const key of ['serviceOutputs', 'administrativeProxies', 'requiredInputs', 'allowedClaims', 'blockedClaims', 'equityCuts']) if (!Array.isArray(outcome[key]) || outcome[key].length < 2) throw new Error(`${outcome.key} requires multiple ${key}.`);
    const outputs = new Set(outcome.serviceOutputs.map((item) => item.toLowerCase()));
    if (outcome.administrativeProxies.some((item) => outputs.has(item.toLowerCase()))) throw new Error(`${outcome.key} collapses an output into a proxy.`);
  }
  const outcomeKeys = new Set(snapshot.outcomes.map((item) => item.key));
  const overlapKeys = new Set();
  for (const overlap of snapshot.overlaps) {
    if (!outcomeKeys.has(overlap.left) || !outcomeKeys.has(overlap.right) || overlap.left === overlap.right) throw new Error('Overlap references an invalid outcome pair.');
    const key = [overlap.left, overlap.right].sort().join(':');
    if (overlapKeys.has(key)) throw new Error(`Duplicate overlap ${key}.`);
    overlapKeys.add(key);
    if (!overlap.risk || !overlap.rule) throw new Error(`${key} is missing its double-count rule.`);
  }
  return snapshot;
}

export function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

export async function checkSfOntologySource(source, fetcher = fetch) {
  const response = await fetcher(source.url, { headers: { 'User-Agent': 'Market-for-Impact source monitor' }, redirect: 'follow' });
  if (!response.ok) throw new Error(`${source.key} returned HTTP ${response.status}.`);
  const body = Buffer.from(await response.arrayBuffer());
  if (source.monitor.mode === 'binary-sha256') {
    const currentHash = sha256(body);
    if (currentHash !== source.monitor.sha256) throw new Error(`${source.key} changed (${currentHash}); review the source before updating the ontology.`);
    return { key: source.key, state: 'current-binary', bytes: body.length };
  }
  const text = body.toString('utf8').replace(/\s+/g, ' ').toLowerCase();
  const missing = source.monitor.signals.filter((signal) => !text.includes(signal.toLowerCase()));
  if (missing.length) throw new Error(`${source.key} is missing ${missing.length} semantic signal(s); review the source.`);
  return { key: source.key, state: 'current-semantic', bytes: body.length };
}
