import { createHash } from 'node:crypto';

const EXPECTED_HEADERS = [
  'Grant', 'Recipient', 'Amount', 'Date', 'Link to grant description', 'Topics', 'Funders', 'Countries',
];

export function parseCsv(text) {
  if (typeof text !== 'string') throw new Error('CSV input must be text.');
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  const input = text.replace(/^\uFEFF/, '');

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    if (quoted) {
      if (character === '"' && input[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
    } else if (character === '"') {
      if (field) throw new Error('Unexpected quote in unquoted CSV field.');
      quoted = true;
    } else if (character === ',') {
      row.push(field);
      field = '';
    } else if (character === '\n') {
      row.push(field);
      if (row.some((value) => value !== '')) rows.push(row);
      row = [];
      field = '';
    } else if (character !== '\r') {
      field += character;
    }
  }
  if (quoted) throw new Error('Unclosed quoted CSV field.');
  row.push(field);
  if (row.some((value) => value !== '')) rows.push(row);
  if (!rows.length) throw new Error('CSV contains no rows.');

  const headers = rows.shift();
  if (headers.length !== EXPECTED_HEADERS.length || headers.some((header, index) => header !== EXPECTED_HEADERS[index])) {
    throw new Error(`Unexpected GiveWell CSV headers: ${headers.join(' | ')}`);
  }
  return rows.map((values, rowIndex) => {
    if (values.length !== headers.length) {
      throw new Error(`GiveWell CSV row ${rowIndex + 2} has ${values.length} fields; expected ${headers.length}.`);
    }
    return Object.fromEntries(headers.map((header, index) => [header, values[index]]));
  });
}

function parseAmount(value) {
  if (value === '') return null;
  if (!/^\$\d+(?:\.\d{1,2})?$/.test(value)) throw new Error(`Invalid GiveWell amount: ${value}`);
  return Number(value.slice(1));
}

function parseDate(value) {
  if (value === '') return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error(`Invalid GiveWell date: ${value}`);
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.valueOf()) || parsed.toISOString().slice(0, 10) !== value) {
    throw new Error(`Unparseable GiveWell date: ${value}`);
  }
  return parsed.toISOString();
}

function splitMultiSelect(value) {
  return value ? value.split(',').map((item) => item.trim()).filter(Boolean) : [];
}

export function slugify(value) {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function normalizeGiveWellGrants(csvText, manifest) {
  if (!manifest?.source?.url || !manifest?.source?.retrievedAt) throw new Error('GiveWell source manifest is incomplete.');
  const rows = parseCsv(csvText);
  if (rows.length !== manifest.source.displayedRecordCount) {
    throw new Error(`Expected ${manifest.source.displayedRecordCount} GiveWell grants; found ${rows.length}.`);
  }

  const seen = new Set();
  const records = rows.map((row) => {
    if (!row.Grant || !row.Recipient) throw new Error('GiveWell grant rows require a grant title and recipient.');
    const amountUsd = parseAmount(row.Amount);
    const decisionDate = parseDate(row.Date);
    const identity = [row.Grant, row.Recipient, row.Amount, row.Date, row['Link to grant description']].join('|');
    const sourceRecordId = createHash('sha256').update(identity).digest('hex').slice(0, 24);
    if (seen.has(sourceRecordId)) throw new Error(`Duplicate GiveWell grant identity: ${identity}`);
    seen.add(sourceRecordId);
    return {
      sourceRecordId,
      grant: row.Grant.trim(),
      recipient: row.Recipient.trim(),
      recipientSlug: slugify(row.Recipient),
      amountUsd,
      amountDisplay: row.Amount || null,
      decisionDate,
      sourceUrl: row['Link to grant description'] || null,
      topics: splitMultiSelect(row.Topics),
      funders: splitMultiSelect(row.Funders),
      countries: splitMultiSelect(row.Countries),
      status: manifest.source.statusSemantics,
      amountSemantics: 'published grant amount; payment timing not stated',
    };
  });

  const totalPublishedAmountUsd = records.reduce((sum, record) => sum + (record.amountUsd ?? 0), 0);
  if (totalPublishedAmountUsd !== manifest.source.exportedRowTotalAmountUsd) {
    throw new Error(`Expected GiveWell exported-row total $${manifest.source.exportedRowTotalAmountUsd}; found $${totalPublishedAmountUsd}.`);
  }
  const contentHash = createHash('sha256').update(JSON.stringify(records)).digest('hex');
  const dated = records.filter((record) => record.decisionDate);
  return {
    source: { ...manifest.source, contentHash },
    summary: {
      grantCount: records.length,
      totalPublishedAmountUsd,
      airtableDisplayedTotalAmountUsd: manifest.source.displayedTotalAmountUsd,
      displayedVsExportedDifferenceUsd: totalPublishedAmountUsd - manifest.source.displayedTotalAmountUsd,
      uniqueRecipientCount: new Set(records.map((record) => record.recipientSlug)).size,
      grantsWithoutPublishedAmount: records.filter((record) => record.amountUsd == null).length,
      grantsWithoutDecisionDate: records.length - dated.length,
      grantsWithoutSourceUrl: records.filter((record) => !record.sourceUrl).length,
      earliestDecisionDate: dated.map((record) => record.decisionDate).sort().at(0) ?? null,
      latestDecisionDate: dated.map((record) => record.decisionDate).sort().at(-1) ?? null,
    },
    records,
  };
}

export function validateGiveWellOpportunities(snapshot) {
  if (!snapshot?.source?.url || !Array.isArray(snapshot.opportunities) || snapshot.opportunities.length !== 4) {
    throw new Error('GiveWell opportunity snapshot must contain the four current Top Charities.');
  }
  const slugs = new Set();
  for (const opportunity of snapshot.opportunities) {
    for (const field of ['organization', 'slug', 'program', 'evidenceLevel', 'modelVersion', 'modelUrl', 'researchUrl']) {
      if (!opportunity[field]) throw new Error(`GiveWell opportunity is missing ${field}.`);
    }
    if (!Number.isFinite(opportunity.costPerLifeSavedUsd) || opportunity.costPerLifeSavedUsd <= 0) {
      throw new Error(`Invalid cost-per-life figure for ${opportunity.organization}.`);
    }
    if (slugs.has(opportunity.slug)) throw new Error(`Duplicate GiveWell opportunity slug: ${opportunity.slug}`);
    slugs.add(opportunity.slug);
  }
  return snapshot;
}
