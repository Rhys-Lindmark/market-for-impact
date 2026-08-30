import crypto from 'node:crypto';

const SOURCE_URL = 'https://www.irs.gov/pub/irs-soi/eo_ca.csv';
const DOCUMENTATION_URL = 'https://www.irs.gov/charities-non-profits/exempt-organizations-business-master-file-extract-eo-bmf';
const DATA_DICTIONARY_URL = 'https://www.irs.gov/pub/irs-soi/eo-info.pdf';
const identity = (value) => String(value ?? '').normalize('NFKC').replace(/\s+/g, ' ').trim().toLowerCase();
const digits = (value) => String(value ?? '').replace(/\D/g, '');
const numberOrNull = (value) => value === '' || value == null ? null : Number(value);
const contentHash = (value) => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');

const nteeGroups = {
  A: 'Arts, culture & humanities', B: 'Education', C: 'Environment', D: 'Animal-related', E: 'Health care', F: 'Mental health & crisis intervention',
  G: 'Diseases, disorders & medical disciplines', H: 'Medical research', I: 'Crime & legal-related', J: 'Employment', K: 'Food, agriculture & nutrition',
  L: 'Housing & shelter', M: 'Public safety, disaster preparedness & relief', N: 'Recreation & sports', O: 'Youth development', P: 'Human services',
  Q: 'International, foreign affairs & national security', R: 'Civil rights, social action & advocacy', S: 'Community improvement & capacity building',
  T: 'Philanthropy, voluntarism & grantmaking foundations', U: 'Science & technology', V: 'Social science', W: 'Public & societal benefit',
  X: 'Religion-related', Y: 'Mutual & membership benefit', Z: 'Unknown'
};

export function parseCsv(text) {
  const rows = []; let row = []; let field = ''; let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (character === '"') {
      if (quoted && text[index + 1] === '"') { field += '"'; index += 1; }
      else quoted = !quoted;
    } else if (character === ',' && !quoted) { row.push(field); field = ''; }
    else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && text[index + 1] === '\n') index += 1;
      row.push(field); field = '';
      if (row.some((value) => value !== '')) rows.push(row);
      row = [];
    } else field += character;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}

export function buildSfIrsUniverse({ csvText, retrievedAt, lastModified, diligence, candidateUniverse }) {
  const [headers, ...rawRows] = parseCsv(csvText);
  const expectedHeaders = ['EIN','NAME','ICO','STREET','CITY','STATE','ZIP','GROUP','SUBSECTION','AFFILIATION','CLASSIFICATION','RULING','DEDUCTIBILITY','FOUNDATION','ACTIVITY','ORGANIZATION','STATUS','TAX_PERIOD','ASSET_CD','INCOME_CD','FILING_REQ_CD','PF_FILING_REQ_CD','ACCT_PD','ASSET_AMT','INCOME_AMT','REVENUE_AMT','NTEE_CD','SORT_NAME'];
  if (headers.join('|') !== expectedHeaders.join('|')) throw new Error(`Unexpected IRS EO BMF columns: ${headers.join(',')}`);
  const index = Object.fromEntries(headers.map((header, position) => [header, position]));
  const scorecardsByEin = new Map(diligence.candidates.filter((row) => row.ein).map((row) => [digits(row.ein), { key: row.key, name: row.name }]));
  const contractorNames = new Map(candidateUniverse.organizations.map((row) => [identity(row.sourceName), row]));
  const organizations = rawRows.filter((row) => row[index.CITY] === 'SAN FRANCISCO' && row[index.STATE] === 'CA').map((row) => {
    const ein = digits(row[index.EIN]).padStart(9, '0');
    const name = row[index.NAME];
    const nteeCode = row[index.NTEE_CD] || null;
    const nteeGroupKey = nteeCode?.[0] && nteeGroups[nteeCode[0]] ? nteeCode[0] : 'Z';
    const scorecard = scorecardsByEin.get(ein) ?? null;
    const contractor = contractorNames.get(identity(name)) ?? null;
    return {
      ein, name, sortName: row[index.SORT_NAME] || null,
      address: { street: row[index.STREET] || null, city: row[index.CITY], state: row[index.STATE], zip: row[index.ZIP] || null },
      subsectionCode: row[index.SUBSECTION] || null,
      deductibilityCode: row[index.DEDUCTIBILITY] || null,
      foundationCode: row[index.FOUNDATION] || null,
      rulingMonth: row[index.RULING] || null,
      taxPeriod: row[index.TAX_PERIOD] || null,
      assetAmountUsd: numberOrNull(row[index.ASSET_AMT]),
      incomeAmountUsd: numberOrNull(row[index.INCOME_AMT]),
      revenueAmountUsd: numberOrNull(row[index.REVENUE_AMT]),
      nteeCode, nteeGroupKey, nteeGroup: nteeGroups[nteeGroupKey],
      scorecardKey: scorecard?.key ?? null,
      scorecardName: scorecard?.name ?? null,
      exactContractSourceName: contractor?.sourceName ?? null,
      exactContractCount: contractor?.contractCount ?? 0,
      identityStatus: scorecard ? 'ein-verified-scorecard' : contractor ? 'exact-registered-name-to-source-name' : 'irs-ein-only',
      impactEvidenceStatus: scorecard ? 'initial-scorecard' : 'not-yet-assessed',
      roomForMoreFundingStatus: 'not-yet-assessed'
    };
  }).sort((a, b) => a.name.localeCompare(b.name) || a.ein.localeCompare(b.ein));
  const groups = Object.entries(nteeGroups).map(([key, label]) => ({ key, label, organizationCount: organizations.filter((row) => row.nteeGroupKey === key).length })).filter((row) => row.organizationCount > 0);
  const subsections = [...new Set(organizations.map((row) => row.subsectionCode).filter(Boolean))].sort().map((code) => ({ code, organizationCount: organizations.filter((row) => row.subsectionCode === code).length }));
  const semantic = { organizations, groups, subsections };
  return {
    version: 'sf-irs-exempt-universe-v0.1', generatedAt: retrievedAt, geography: 'San Francisco, California',
    source: { publisher: 'Internal Revenue Service', title: 'Exempt Organizations Business Master File Extract — California', url: SOURCE_URL, documentationUrl: DOCUMENTATION_URL, dataDictionaryUrl: DATA_DICTIONARY_URL, postingDate: '2026-08-11', retrievedAt, lastModified, contentHash: contentHash(semantic) },
    summary: {
      organizationCount: organizations.length,
      uniqueEinCount: new Set(organizations.map((row) => row.ein)).size,
      subsection501c3Count: organizations.filter((row) => row.subsectionCode === '03').length,
      deductibleCode1Count: organizations.filter((row) => row.deductibilityCode === '1').length,
      nteeClassifiedCount: organizations.filter((row) => row.nteeCode).length,
      nteeMissingCount: organizations.filter((row) => !row.nteeCode).length,
      scorecardEinMatchCount: organizations.filter((row) => row.scorecardKey).length,
      exactContractNameMatchCount: organizations.filter((row) => row.exactContractSourceName).length,
      publishableRoomForFundingCount: 0
    },
    groups, subsections, organizations,
    interpretation: {
      denominator: 'Every EO BMF row whose IRS filing address city is San Francisco, California. It is not a census of organizations serving San Francisco, and organizations based elsewhere may operate in the city.',
      status: 'EO BMF inclusion records an IRS determination of tax-exempt status. It is not a current good-standing, operating, donation-eligibility, or effectiveness determination; donors should verify in Tax Exempt Organization Search.',
      identity: 'EIN is the legal-identity anchor. Four existing scorecards reconcile by exact EIN. City-contract overlap uses only exact normalized registered-name equality and remains a source-name crosswalk, not an entity merge.',
      finance: 'Assets, income, revenue, and tax period are source-native BMF fields and may be missing or stale. They are scale context, not impact, capacity, or room for more funding.',
      recommendation: 'All rows are discovery records. No row is ranked by IRS fields, and no marginal funding gap is inferred.'
    }
  };
}

export function validateSfIrsUniverse(snapshot) {
  if (snapshot.version !== 'sf-irs-exempt-universe-v0.1') throw new Error('Unexpected SF IRS universe version.');
  if (snapshot.summary.organizationCount !== snapshot.organizations.length || snapshot.summary.uniqueEinCount !== snapshot.organizations.length) throw new Error('SF IRS EIN counts do not reconcile.');
  if (new Set(snapshot.organizations.map((row) => row.ein)).size !== snapshot.organizations.length) throw new Error('Duplicate SF IRS EIN.');
  if (snapshot.organizations.some((row) => !/^\d{9}$/.test(row.ein) || row.address.city !== 'SAN FRANCISCO' || row.address.state !== 'CA')) throw new Error('Invalid SF IRS identity or geography.');
  if (snapshot.organizations.some((row) => row.roomForMoreFundingStatus !== 'not-yet-assessed')) throw new Error('SF IRS universe inferred funding room.');
  if (snapshot.summary.publishableRoomForFundingCount !== 0) throw new Error('SF IRS universe cannot publish funding room.');
  if (snapshot.summary.nteeClassifiedCount + snapshot.summary.nteeMissingCount !== snapshot.organizations.length) throw new Error('SF IRS NTEE coverage does not reconcile.');
  if (snapshot.source.contentHash !== contentHash({ organizations: snapshot.organizations, groups: snapshot.groups, subsections: snapshot.subsections })) throw new Error('SF IRS content hash does not reconcile.');
  return snapshot;
}
