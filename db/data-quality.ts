import { env } from 'cloudflare:workers';
import contract from '@/data/comparisons/data-quality-contract-v1.json';
import { ensureAceSnapshot } from '@/db/ace';
import { ensureAiSafetyEcosystem } from '@/db/ai-safety';
import { ensureAllCoefficientSnapshot } from '@/db/coefficient-all';
import { ensureCurrentSnapshot } from '@/db/coefficient';
import { ensureComparableImpact } from '@/db/comparable-impact';
import { ensureFoundersPledgeSnapshot } from '@/db/founders-pledge';
import { ensureFundingTranches } from '@/db/funding-tranches';
import { ensureGiveDirectlyBenchmark } from '@/db/givedirectly';
import { ensureGiveWellSnapshot } from '@/db/givewell';
import { ensureGivingGreenSnapshot } from '@/db/giving-green';
import { ensureRenPhilSnapshot } from '@/db/renphil';

type LedgerContract = (typeof contract.ledgers)[number];
type QualityState = 'conflict' | 'incomplete' | 'documented-boundary';

const epochDay = (isoDate: string) => Math.floor(new Date(`${isoDate}T00:00:00.000Z`).valueOf() / 86_400_000);
const freshnessState = (ageDays: number) => ageDays <= 14 ? 'current' : ageDays <= 45 ? 'monitor' : 'stale';

async function ensureQualityInputs() {
  await ensureAllCoefficientSnapshot();
  await ensureCurrentSnapshot();
  await ensureGiveWellSnapshot();
  await ensureAceSnapshot();
  await ensureGivingGreenSnapshot();
  await ensureFoundersPledgeSnapshot();
  await ensureGiveDirectlyBenchmark();
  await ensureComparableImpact();
  await ensureRenPhilSnapshot();
  await ensureFundingTranches();
  await ensureAiSafetyEcosystem();
}

async function getLedgerQuality(ledger: LedgerContract, asOfDate: string) {
  const source = await env.DB.prepare(`SELECT id, publisher, title, url, retrieved_at, coverage_note, content_hash
    FROM sources WHERE url = ?`).bind(ledger.sourceUrl).first<{
      id: number; publisher: string; title: string; url: string; retrieved_at: number;
      coverage_note: string | null; content_hash: string | null;
    }>();
  if (!source) throw new Error(`Quality source is missing: ${ledger.key}.`);
  const dateColumn = ledger.canonicalDateField === 'decision_date' ? 'g.decision_date' : 'g.award_date';
  const row = await env.DB.prepare(`SELECT COUNT(*) AS current_row_count,
      COALESCE(SUM(g.amount_usd), 0) AS published_amount_usd,
      SUM(CASE WHEN g.amount_usd IS NULL THEN 1 ELSE 0 END) AS missing_amount_count,
      SUM(CASE WHEN ${dateColumn} IS NULL THEN 1 ELSE 0 END) AS missing_date_count,
      SUM(CASE WHEN json_array_length(g.recipient_names_json) = 0 THEN 1 ELSE 0 END) AS missing_recipient_count,
      SUM(CASE WHEN g.purpose IS NULL OR g.purpose = '' THEN 1 ELSE 0 END) AS missing_purpose_count,
      SUM(CASE WHEN g.source_url IS NULL OR g.source_url = '' THEN 1 ELSE 0 END) AS missing_source_url_count,
      SUM(CASE WHEN g.grouped_grant = 1 THEN 1 ELSE 0 END) AS grouped_observed_count,
      SUM(CASE WHEN ${dateColumn} > s.retrieved_at THEN 1 ELSE 0 END) AS future_dated_count,
      SUM(CASE WHEN json_array_length(g.recipient_names_json) > 1 THEN 1 ELSE 0 END) AS multiple_recipient_count,
      SUM(CASE WHEN g.restricted IS NULL THEN 1 ELSE 0 END) AS missing_restriction_count,
      SUM(CASE WHEN g.originating_funder_id IS NULL THEN 1 ELSE 0 END) AS missing_normalized_originator_count,
      SUM(CASE WHEN g.advising_funder_id IS NULL THEN 1 ELSE 0 END) AS missing_normalized_advisor_count
    FROM grants g JOIN sources s ON s.id = g.source_id
    WHERE g.source_id = ? AND g.last_seen_at = s.retrieved_at`).bind(source.id).first<Record<string, number>>();
  const disappeared = await env.DB.prepare(`SELECT COUNT(*) AS count FROM grants g JOIN sources s ON s.id = g.source_id
    WHERE g.source_id = ? AND g.last_seen_at IS NOT NULL AND g.last_seen_at <> s.retrieved_at`)
    .bind(source.id).first<{ count: number }>();
  if (!row || row.current_row_count !== ledger.rowCount || row.published_amount_usd !== ledger.publishedAmountUsd) {
    throw new Error(`${ledger.key} quality metrics do not reconcile to the accepted contract.`);
  }
  const conflict = contract.knownIssues.some((issue) => issue.sourceKey === ledger.key && issue.state === 'conflict');
  const incomplete = ['missing_amount_count', 'missing_date_count', 'missing_recipient_count', 'missing_purpose_count', 'missing_source_url_count']
    .some((field) => Number(row[field]) > 0);
  const qualityState: QualityState = conflict ? 'conflict' : incomplete ? 'incomplete' : 'documented-boundary';
  const retrievedAt = new Date(source.retrieved_at * 1000).toISOString();
  const ageDays = Math.max(0, epochDay(asOfDate) - epochDay(retrievedAt.slice(0, 10)));
  return {
    key: ledger.key, label: ledger.label, publisher: source.publisher, title: source.title, sourceUrl: source.url,
    retrievedAt, ageDays, freshnessState: freshnessState(ageDays), qualityState,
    statusSemantics: ledger.statusSemantics, canonicalDateLabel: ledger.canonicalDateLabel,
    rowCount: row.current_row_count, publishedAmountUsd: row.published_amount_usd,
    missingAmountCount: row.missing_amount_count, missingDateCount: row.missing_date_count,
    missingRecipientCount: row.missing_recipient_count, missingPurposeCount: row.missing_purpose_count,
    missingSourceUrlCount: row.missing_source_url_count, groupedObservedCount: row.grouped_observed_count,
    futureDatedCount: row.future_dated_count, multipleRecipientCount: row.multiple_recipient_count,
    missingRestrictionCount: row.missing_restriction_count,
    missingNormalizedOriginatorCount: row.missing_normalized_originator_count,
    missingNormalizedAdvisorCount: row.missing_normalized_advisor_count,
    disappearedRowCount: disappeared?.count ?? 0,
    contentState: source.content_hash ? 'content-addressed' : 'reviewed-reference',
    coverageNote: source.coverage_note, caveats: ledger.caveats,
  };
}

async function getSourceInventory(asOfDate: string) {
  const rows = await env.DB.prepare(`SELECT s.id, s.publisher, s.title, s.url, s.published_at, s.retrieved_at,
      s.coverage_note, s.content_hash,
      (SELECT COUNT(*) FROM grants g WHERE g.source_id = s.id AND g.last_seen_at = s.retrieved_at) AS grant_rows,
      (SELECT COUNT(*) FROM assessments a WHERE a.source_id = s.id) AS assessment_rows,
      (SELECT COUNT(*) FROM impact_benchmarks b WHERE b.source_id = s.id) AS benchmark_rows,
      (SELECT COUNT(*) FROM impact_conversion_models m WHERE m.source_id = s.id) AS conversion_model_rows
    FROM sources s ORDER BY s.publisher, s.title, s.url`).all<Record<string, unknown>>();
  return rows.results.map((row) => {
    const retrievedAt = new Date(Number(row.retrieved_at) * 1000).toISOString();
    const ageDays = Math.max(0, epochDay(asOfDate) - epochDay(retrievedAt.slice(0, 10)));
    return {
      publisher: String(row.publisher), title: String(row.title), url: String(row.url),
      publishedAt: row.published_at ? new Date(Number(row.published_at) * 1000).toISOString() : null,
      retrievedAt, ageDays, freshnessState: freshnessState(ageDays),
      contentState: row.content_hash ? 'content-addressed' : 'reviewed-reference',
      coverageNote: row.coverage_note ? String(row.coverage_note) : null,
      objectCounts: {
        grants: Number(row.grant_rows), assessments: Number(row.assessment_rows),
        benchmarks: Number(row.benchmark_rows), conversionModels: Number(row.conversion_model_rows),
      },
    };
  });
}

function dynamicIssues(ledgers: Awaited<ReturnType<typeof getLedgerQuality>>[]) {
  const definitions = [
    { field: 'missingAmountCount', category: 'missing-amount', title: 'Rows without a published amount', unit: 'rows' },
    { field: 'missingDateCount', category: 'missing-date', title: 'Rows without the ledger’s canonical date', unit: 'rows' },
    { field: 'missingRecipientCount', category: 'missing-recipient', title: 'Rows without a published recipient name', unit: 'rows' },
    { field: 'missingPurposeCount', category: 'missing-purpose', title: 'Rows without a published purpose', unit: 'rows' },
    { field: 'missingSourceUrlCount', category: 'missing-source-url', title: 'Rows without a direct record URL', unit: 'rows' },
    { field: 'disappearedRowCount', category: 'disappeared-row', title: 'Earlier rows absent from the current snapshot', unit: 'rows' },
  ] as const;
  return ledgers.flatMap((ledger) => definitions.flatMap((definition) => {
    const count = ledger[definition.field];
    if (!count) return [];
    return [{
      key: `${ledger.key}:${definition.category}`, sourceKey: ledger.key,
      state: definition.category === 'disappeared-row' ? 'monitor' : 'incomplete', category: definition.category,
      count, unit: definition.unit, title: definition.title,
      description: definition.category === 'missing-date'
        ? `${count} ${ledger.label} row${count === 1 ? '' : 's'} lack ${ledger.canonicalDateLabel}; other dates are not substituted.`
        : definition.category === 'disappeared-row'
          ? contract.rowRules.disappeared
          : `${count} accepted ${ledger.label} row${count === 1 ? '' : 's'} retain this field as unpublished.`,
    }];
  }));
}

export async function getDataQualityDashboard() {
  await ensureQualityInputs();
  const asOfDate = new Date().toISOString().slice(0, 10);
  const ledgers = [];
  for (const ledger of contract.ledgers) ledgers.push(await getLedgerQuality(ledger, asOfDate));
  const [sources, funding] = await Promise.all([
    getSourceInventory(asOfDate),
    env.DB.prepare(`SELECT COUNT(*) AS tranche_count,
      SUM(CASE WHEN amount_usd IS NULL THEN 1 ELSE 0 END) AS amount_unpublished_count,
      SUM(CASE WHEN status = 'stale-published-gap' THEN 1 ELSE 0 END) AS stale_count,
      SUM(CASE WHEN status = 'closed-or-contact-required' THEN 1 ELSE 0 END) AS closed_count
      FROM funding_tranches WHERE updated_at = (SELECT MAX(updated_at) FROM funding_tranches)`).first<Record<string, number>>(),
  ]);
  const sourceUrlByKey = new Map(ledgers.map((ledger) => [ledger.key, ledger.sourceUrl]));
  const knownIssues = contract.knownIssues.map((issue) => ({
    ...issue, sourceUrl: sourceUrlByKey.get(issue.sourceKey) ?? null,
  }));
  const issues = [...knownIssues, ...dynamicIssues(ledgers)];
  const sum = (field: keyof typeof ledgers[number]) => ledgers.reduce((total, ledger) => total + (typeof ledger[field] === 'number' ? Number(ledger[field]) : 0), 0);
  const qualityStateCounts = Object.fromEntries(['conflict', 'incomplete', 'documented-boundary'].map((state) => [state, ledgers.filter((ledger) => ledger.qualityState === state).length]));
  return {
    version: contract.version, asOfDate, generatedAt: contract.generatedAt,
    freshnessRules: contract.freshnessRules, stateRules: contract.stateRules, rowRules: contract.rowRules,
    summary: {
      trackedSourceCount: sources.length,
      currentSourceCount: sources.filter((source) => source.freshnessState === 'current').length,
      monitorSourceCount: sources.filter((source) => source.freshnessState === 'monitor').length,
      staleSourceCount: sources.filter((source) => source.freshnessState === 'stale').length,
      contentAddressedSourceCount: sources.filter((source) => source.contentState === 'content-addressed').length,
      reviewedReferenceSourceCount: sources.filter((source) => source.contentState === 'reviewed-reference').length,
      acceptedGrantRowCount: sum('rowCount'), missingAmountCount: sum('missingAmountCount'),
      missingDateCount: sum('missingDateCount'), missingRecipientCount: sum('missingRecipientCount'),
      missingPurposeCount: sum('missingPurposeCount'), missingSourceUrlCount: sum('missingSourceUrlCount'),
      futureDatedCount: sum('futureDatedCount'), groupedObservedCount: sum('groupedObservedCount'),
      disappearedRowCount: sum('disappearedRowCount'), conflictCount: knownIssues.filter((issue) => issue.state === 'conflict').length,
      issueCount: issues.length, qualityStateCounts,
    },
    fundingQuality: {
      trancheCount: Number(funding?.tranche_count ?? 0), amountUnpublishedCount: Number(funding?.amount_unpublished_count ?? 0),
      staleCount: Number(funding?.stale_count ?? 0), closedCount: Number(funding?.closed_count ?? 0),
    },
    ledgers, issues, sources,
  };
}
