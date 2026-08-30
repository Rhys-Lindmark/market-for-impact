import { createHash } from 'node:crypto';
import { decodeHtmlEntities } from './html-entities.mjs';

export const GIVING_GREEN_ANNOUNCEMENT_URL = 'https://www.givinggreen.earth/post/2025-2026-top-climate-nonprofits';
export const GIVING_GREEN_TOP_URL = 'https://www.givinggreen.earth/top-climate-nonprofits';

const topByReviewSlug = {
  'clean-air-task-force-top-climate-nonprofit-spotlight': 'Clean Air Task Force',
  'future-cleantech-architects-top-climate-nonprofit-spotlight': 'Future Cleantech Architects',
  'good-food-institute-nonprofit-spotlight': 'Good Food Institute',
  'opportunity-green-top-climate-nonprofit-spotlight': 'Opportunity Green',
  'project-innerspace-top-climate-nonprofit-spotlight': 'Project InnerSpace',
};

export const topRecommendationMetadata = {
  'Clean Air Task Force': {
    slug: 'clean-air-task-force', geography: 'Global; headquartered in the United States',
    evaluationSummary: 'Technical analysis, stakeholder engagement, and policy research focused on neglected clean-energy technologies and hard-to-decarbonize sectors.',
    fundingNeed: 'Unrestricted support for ongoing programs, international expansion, permitting reform, technology diffusion, and European clean-industry policy.',
    fundingRoomUsd: null, fundingRoomPeriod: 'No numeric organization-level gap published in the November 2025 spotlight.',
    limitations: 'Giving Green did not assess every CATF program in detail and publishes no organization-level emissions-per-dollar estimate.',
  },
  'Future Cleantech Architects': {
    slug: 'future-cleantech-architects', geography: 'European Union; headquartered in Germany',
    evaluationSummary: 'Technical research and policy engagement intended to close innovation gaps in heavy industry, aviation, shipping, and firm power.',
    fundingNeed: 'Additional researchers and policy staff for steel, concrete, aviation, intergovernmental engagement, German policy, and operations.',
    fundingRoomUsd: null, fundingRoomPeriod: 'No numeric organization-level gap published in the November 2025 spotlight.',
    limitations: 'A young organization whose influence evidence is primarily qualitative; no organization-level emissions-per-dollar estimate is published.',
  },
  'Good Food Institute': {
    slug: 'good-food-institute', geography: 'Global',
    evaluationSummary: 'Research, policy advocacy, and industry engagement designed to make alternative proteins competitive with conventional animal products.',
    fundingNeed: 'Giving Green reports substantial room to grow across science, policy, industry work, and regional affiliate offices.',
    fundingRoomUsd: null, fundingRoomPeriod: 'No numeric organization-level gap published in the November 2025 spotlight.',
    limitations: 'The alternative-protein pathway remains early-stage and the review publishes no organization-level emissions-per-dollar estimate.',
  },
  'Opportunity Green': {
    slug: 'opportunity-green', geography: 'European Union and international shipping and aviation policy; headquartered in the United Kingdom',
    evaluationSummary: 'Legal, policy, economic, and coalition work to reduce aviation and maritime-shipping emissions and elevate climate-vulnerable countries.',
    fundingNeed: 'More staff across aviation and shipping ahead of EU and IMO policy windows, plus emerging work on steel, data centers, and agriculture.',
    fundingRoomUsd: null, fundingRoomPeriod: 'No numeric organization-level gap published in the November 2025 spotlight.',
    limitations: 'A young organization with qualitative influence signals; no organization-level emissions-per-dollar estimate is published.',
  },
  'Project InnerSpace': {
    slug: 'project-innerspace', geography: 'Global; headquartered in the United States',
    evaluationSummary: 'GeoMap, early-project finance, and policy and industry engagement intended to accelerate next-generation geothermal deployment.',
    fundingNeed: 'A reported $4M gap for the remainder of 2025 plus multi-year expansion opportunities for GeoMap AI, GeoFund projects, and regional policy reports.',
    fundingRoomUsd: 4000000, fundingRoomPeriod: 'Remainder of 2025, self-reported as of October 2025; not a current 2026 gap.',
    limitations: 'The numeric gap is time-bound and now stale; pending proposals and multi-year expansion opportunities must not be added to it as one funding-room figure.',
  },
};

function decode(text) {
  return decodeHtmlEntities(text).replaceAll(' ', ' ');
}

function textContent(html) {
  return decode(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function slugify(name) {
  return name.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function parseGrantAmount(value) {
  const amount = Number(value.replace(/[^0-9.]/g, ''));
  if (!Number.isFinite(amount) || amount <= 0) throw new Error(`Invalid Giving Green grant amount: ${value}`);
  return { amountUsd: amount, period: /two years/i.test(value) ? 'two years' : 'one-time period not specified' };
}

export function parseGivingGreenAnnouncement(html) {
  const tableStart = html.indexOf('Giving Green’s 2025-2026 Top Climate Nonprofits');
  const otherStart = html.indexOf('Other Giving Green Fund Grantees');
  if (tableStart < 0 || otherStart < 0) throw new Error('Giving Green announcement tables were not found.');
  const parseRows = (section, kind) => [...section.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].flatMap((match) => {
    const cells = [...match[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((cell) => cell[1]);
    if (cells.length !== 4) return [];
    const href = cells[3].match(/href=["']([^"']+)/i)?.[1];
    if (!href) return [];
    const reviewUrl = new URL(href, 'https://www.givinggreen.earth').href;
    const reviewSlug = new URL(reviewUrl).pathname.split('/').filter(Boolean).at(-1);
    const name = kind === 'top' ? topByReviewSlug[reviewSlug] : textContent(cells[0]);
    if (!name) throw new Error(`Unknown Giving Green top nonprofit review: ${reviewSlug}`);
    const strategies = [...cells[1].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map((item) => textContent(item[1]));
    const amountLabel = textContent(cells[2]);
    const { amountUsd, period } = parseGrantAmount(amountLabel);
    return [{ sourceRecordId: `giving-green-2025-${slugify(name)}`, name, recipientSlug: topRecommendationMetadata[name]?.slug ?? slugify(name),
      category: kind, strategies, amountUsd, amountLabel, period, reviewUrl }];
  });
  const topSection = html.slice(tableStart, otherStart);
  const otherSection = html.slice(otherStart, html.indexOf('How You Can Make an Impact', otherStart));
  const grants = [...parseRows(topSection, 'top'), ...parseRows(otherSection, 'grantee')];
  if (grants.length !== 29) throw new Error(`Expected 29 Giving Green grant rows, found ${grants.length}.`);
  if (grants.filter((grant) => grant.category === 'top').length !== 5) throw new Error('Giving Green top recommendation table must contain five rows.');
  return grants;
}

export function semanticHash(grants) {
  const semantic = grants.map(({ sourceRecordId, category, strategies, amountUsd, period, reviewUrl }) =>
    ({ sourceRecordId, category, strategies, amountUsd, period, reviewUrl })).sort((a, b) => a.sourceRecordId.localeCompare(b.sourceRecordId));
  return createHash('sha256').update(JSON.stringify(semantic)).digest('hex');
}

export function buildGivingGreenSnapshot(html, retrievedAt) {
  const grants = parseGivingGreenAnnouncement(html);
  const topRecommendations = grants.filter((grant) => grant.category === 'top').map((grant) => ({ ...grant, ...topRecommendationMetadata[grant.name] }));
  const totalAnnouncedGrantUsd = grants.reduce((sum, grant) => sum + grant.amountUsd, 0);
  const topAnnouncedGrantUsd = topRecommendations.reduce((sum, grant) => sum + grant.amountUsd, 0);
  return {
    source: {
      publisher: 'Giving Green', title: 'Giving Green Announces $26 Million for High-Impact Climate Solutions, 2025-2026 Top Climate Nonprofits, and New Grantees',
      url: GIVING_GREEN_ANNOUNCEMENT_URL, topListUrl: GIVING_GREEN_TOP_URL,
      publishedAt: '2025-11-05T00:00:00.000Z', retrievedAt,
      statusSemantics: 'planned Giving Green Fund grant announced for the 2025–2026 recommendation cycle; announcement is not proof of disbursement',
      coverageNote: 'Complete 29-row grant table from the November 2025 announcement: five Top Climate Nonprofits and 24 other grantees. Grant size is not an effectiveness rank or an organization funding gap.',
      contentHash: semanticHash(grants),
    },
    summary: { topRecommendationCount: 5, otherGranteeCount: 24, grantRecordCount: 29, totalAnnouncedGrantUsd, topAnnouncedGrantUsd },
    comparabilityWarning: 'Giving Green describes these as high-impact best bets selected through scale, feasibility, and funding need. It does not publish comparable organization-level emissions-per-dollar estimates. Grant amount, room for funding, and impact are separate concepts.',
    topRecommendations,
    grants,
  };
}

export function validateGivingGreenSnapshot(snapshot) {
  if (snapshot.topRecommendations.length !== 5 || snapshot.grants.length !== 29) throw new Error('Giving Green record counts do not reconcile.');
  if (new Set(snapshot.grants.map((grant) => grant.sourceRecordId)).size !== 29) throw new Error('Giving Green grant IDs must be unique.');
  if (snapshot.grants.reduce((sum, grant) => sum + grant.amountUsd, 0) !== snapshot.summary.totalAnnouncedGrantUsd) throw new Error('Giving Green grant total does not reconcile.');
  if (semanticHash(snapshot.grants) !== snapshot.source.contentHash) throw new Error('Giving Green content hash does not reconcile.');
  if (snapshot.topRecommendations.some((record) => !record.fundingNeed || !record.evaluationSummary)) throw new Error('Giving Green recommendation narratives are incomplete.');
  return snapshot;
}
