import registry from '@/docs/open-botec/registry.json';
import {canonicalBase} from '@/lib/geography-editions.mjs';

// Read layer for the open BOTEC repository (docs/open-botec). Records are generated files;
// contributors add recipes there and run `node docs/open-botec/tools/evaluate.mjs --all`.
type Dist = {p10: number | null; p50: number | null; p90: number | null; unit?: string};
type Estimate = (typeof registry.estimates)[number];

export const openBotecBase = canonicalBase + '/api/open-botec';
export const sourceRepo = 'https://github.com/Rhys-Lindmark/market-for-impact';
export const sourceTree = registry.source;
export const templates = registry.templates;
export const schemas = registry.schemas as Record<string, unknown>;
const estimates = registry.estimates as Estimate[];
const live = estimates.filter((e) => e.status.tier !== 'retracted');

const causeOf = (archetypeId: string) => templates.find((t) => t.archetypeId === archetypeId)?.causeArea ?? null;

export function summarize(e: Estimate) {
  const q = e.qalyLayer as {pricePer10Qalys: Dist; centralPointPricePer10Qalys: number | null} | null;
  return {
    id: e.id,
    url: `${openBotecBase}/estimate?id=${encodeURIComponent(e.id)}`,
    organization: e.key.org.name,
    program: e.key.program.name,
    archetypeId: e.key.archetypeId,
    causeArea: causeOf(e.key.archetypeId),
    geoId: e.key.geography.geoId,
    geography: e.key.geography.name,
    year: e.key.year,
    tier: e.status.tier,
    confidence: e.status.confidence ?? null,
    nativeOutcome: {unit: e.nativeOutcome.unit, costPerOutcome: e.nativeOutcome.costPerOutcome, centralPoint: e.nativeOutcome.centralPoint ?? null},
    usdPer10Qalys: q ? {...q.pricePer10Qalys, centralPoint: q.centralPointPricePer10Qalys} : null,
    fundingRoom: e.fundingRoom.status,
    source: `${sourceRepo}/blob/main/${(e as Estimate & {path: string}).path}`,
  };
}

export function searchEstimates({geo, cause, archetype, q}: {geo?: string | null; cause?: string | null; archetype?: string | null; q?: string | null}) {
  const needle = q?.toLowerCase();
  return live
    .filter((e) => !geo || e.key.geography.geoId === geo || e.key.geography.name.toLowerCase().includes(geo.toLowerCase()))
    .filter((e) => !cause || causeOf(e.key.archetypeId) === cause)
    .filter((e) => !archetype || e.key.archetypeId === archetype)
    .filter((e) => !needle || `${e.key.org.name} ${e.key.program.name} ${e.key.archetypeId}`.toLowerCase().includes(needle))
    .map(summarize);
}

export const getEstimate = (id: string) => estimates.find((e) => e.id === id) ?? null;

export function compareEstimates(ids: string[]) {
  const found = ids.map((id) => getEstimate(id));
  const missing = ids.filter((_, i) => !found[i]);
  const rows = found.filter((e): e is Estimate => !!e).map(summarize);
  const warnings: string[] = [];
  if (new Set(rows.map((r) => r.archetypeId)).size > 1) warnings.push('Different archetypes: native outcomes are not comparable; only the QALY layer is, and it depends on each bridge.');
  if (rows.some((r) => r.tier === 'draft')) warnings.push('Includes draft records that no independent auditor has reviewed.');
  if (rows.some((r) => r.fundingRoom !== 'verified')) warnings.push('Funding room is unverified for at least one record; a cheaper price does not mean a gift can be absorbed.');
  return {rows: rows.sort((a, b) => (a.usdPer10Qalys?.p50 ?? Infinity) - (b.usdPer10Qalys?.p50 ?? Infinity)), missing, warnings};
}

export function registryIndex() {
  return {
    name: 'GiveBetter open BOTEC repository',
    description: 'Agent-readable cost-effectiveness estimates (BOTECs) for nonprofits, keyed by organization, program, intervention archetype, geography, year and model version. Native outcomes first; QALY conversion is a separate versioned layer. Every input is a p10/p50/p90 distribution with sources.',
    version: registry.registryVersion,
    docs: canonicalBase + '/agents',
    llmsTxt: canonicalBase + '/llms.txt',
    mcp: canonicalBase + '/api/mcp',
    contribute: sourceTree,
    endpoints: {
      search: `${openBotecBase}?geo={geoId}&cause={causeArea}&archetype={archetypeId}&q={text}`,
      estimate: `${openBotecBase}/estimate?id={id}`,
      compare: `${openBotecBase}/compare?ids={id},{id}`,
      templates: `${openBotecBase}/templates`,
      schema: `${openBotecBase}/schema?name={botec|template|parameters}`,
    },
    counts: {estimates: live.length, templates: templates.length, geographies: new Set(live.map((e) => e.key.geography.geoId)).size},
    templates: templates.map((t) => ({archetypeId: t.archetypeId, version: t.version, name: t.name, causeArea: t.causeArea, nativeOutcome: t.nativeOutcome.unit})),
    estimates: live.map(summarize),
  };
}

export const jsonHeaders = {'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600', 'Access-Control-Allow-Origin': '*'};
