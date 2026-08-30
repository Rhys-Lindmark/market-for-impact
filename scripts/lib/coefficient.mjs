import { createHash } from 'node:crypto';

export function parseUsd(value) {
  if (typeof value !== 'string' || !/^\$[\d,]+$/.test(value)) {
    throw new Error(`Invalid published USD amount: ${String(value)}`);
  }
  return Number(value.slice(1).replaceAll(',', ''));
}

export function parseDecisionMonth(value) {
  if (typeof value !== 'string' || !/^[A-Z][a-z]+ \d{4}$/.test(value)) {
    throw new Error(`Invalid grant month: ${String(value)}`);
  }
  const parsed = new Date(`${value} 1 00:00:00 UTC`);
  if (Number.isNaN(parsed.valueOf())) throw new Error(`Unparseable grant month: ${value}`);
  return parsed.toISOString();
}

export function slugify(value) {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function normalizeSnapshot(snapshot) {
  if (!snapshot?.source?.url || !Array.isArray(snapshot.records)) {
    throw new Error('Snapshot must contain source metadata and records.');
  }
  if (snapshot.records.length !== snapshot.source.displayedResultCount) {
    throw new Error(`Expected ${snapshot.source.displayedResultCount} records; found ${snapshot.records.length}.`);
  }

  const seen = new Set();
  const records = snapshot.records.map((record) => {
    for (const field of ['recipient', 'purpose', 'date', 'amount']) {
      if (!record[field]) throw new Error(`Missing ${field} in source record.`);
    }
    const amountUsd = parseUsd(record.amount);
    const decisionMonth = parseDecisionMonth(record.date);
    const identity = [snapshot.source.fund, record.recipient, record.purpose, decisionMonth, amountUsd].join('|');
    const externalId = createHash('sha256').update(identity).digest('hex').slice(0, 24);
    if (seen.has(externalId)) throw new Error(`Duplicate grant identity: ${identity}`);
    seen.add(externalId);
    return {
      externalId,
      recipient: record.recipient.trim(),
      recipientSlug: slugify(record.recipient),
      recipientUrl: record.recipientUrl || null,
      purpose: record.purpose.trim(),
      decisionMonth,
      publishedMonth: record.date,
      amountUsd,
      amountDisplay: record.amount,
      currency: 'USD',
      status: snapshot.source.statusSemantics,
      amountSemantics: 'published grant amount; payment timing not stated',
      cause: 'effective-giving-careers',
      advisingFunder: 'Coefficient Giving',
      originatingFunder: null,
      groupedGrant: false,
    };
  });

  const canonicalRecords = JSON.stringify(records);
  const contentHash = createHash('sha256').update(canonicalRecords).digest('hex');
  const byYear = Object.fromEntries([...new Set(records.map((record) => record.decisionMonth.slice(0, 4)))]
    .sort().reverse().map((year) => [year, {
      count: records.filter((record) => record.decisionMonth.startsWith(year)).length,
      amountUsd: records.filter((record) => record.decisionMonth.startsWith(year)).reduce((sum, record) => sum + record.amountUsd, 0),
    }]));

  return {
    source: { ...snapshot.source, contentHash },
    summary: {
      grantCount: records.length,
      totalPublishedAmountUsd: records.reduce((sum, record) => sum + record.amountUsd, 0),
      uniqueRecipientCount: new Set(records.map((record) => record.recipientSlug)).size,
      latestDecisionMonth: records.map((record) => record.decisionMonth).sort().at(-1) ?? null,
      byYear,
    },
    records,
  };
}
