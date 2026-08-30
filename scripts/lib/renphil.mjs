import { createHash } from 'node:crypto';

export const RENPHIL_WINNERS_URL = 'https://www.renaissancephilanthropy.org/ai-for-math-fund-projects';
export const RENPHIL_FIRST_ROUND_URL = 'https://www.renaissancephilanthropy.org/insights/ai-for-math-fund-announces-18-million-in-grants-to-accelerate-breakthrough-discoveries-in-mathematicsnbsp';
export const RENPHIL_ADDITIONAL_URL = 'https://www.renaissancephilanthropy.org/insights/renaissance-philanthropy-and-xtx-markets-additional-13-million';

export function decodeHtml(value) {
  return value
    .replaceAll('&quot;', '"').replaceAll('&#39;', "'").replaceAll('&apos;', "'")
    .replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&')
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replaceAll('&nbsp;', ' ');
}

function cleanText(html) {
  return decodeHtml(html.replace(/<br\s*\/?\s*>/gi, '\n').replace(/<[^>]+>/g, ' '))
    .replace(/[ \t]+/g, ' ').replace(/\s*\n\s*/g, '\n').trim();
}

function textBlocks(html) {
  return [...html.matchAll(/<div class="sqs-html-content"[^>]*>([\s\S]*?)<\/div>/g)]
    .map((match) => cleanText(match[1])).filter(Boolean);
}

export function parseWinnerIndex(html) {
  const contexts = [...html.matchAll(/data-current-context="([^"]*)"/g)];
  const parsed = contexts.flatMap((match) => {
    try { return [JSON.parse(decodeHtml(match[1]))]; } catch { return []; }
  });
  const portfolio = parsed.find((context) => Array.isArray(context.userItems) && context.userItems.length >= 20);
  if (!portfolio) throw new Error('Expected a substantial RenPhil AI for Math winner portfolio.');
  if (portfolio.userItems.length !== 28) {
    throw new Error(`Expected 28 currently displayed RenPhil award records; found ${portfolio.userItems.length}. The publisher separately declares 29 awards.`);
  }

  const records = portfolio.userItems.map((item) => {
    const link = String(item.description ?? '').match(/href="([^"]+)"/)?.[1];
    if (!item.title || !link) throw new Error('RenPhil winner is missing a title or project link.');
    const sourceUrl = new URL(link, RENPHIL_WINNERS_URL).href;
    return { project: cleanText(String(item.title)), sourceUrl };
  });
  if (new Set(records.map((record) => record.sourceUrl)).size !== 28) throw new Error('RenPhil winner links are not unique.');
  if (new Set(records.map((record) => record.project)).size !== 28) throw new Error('RenPhil winner titles are not unique.');
  return records;
}

function findTeamNames(blocks) {
  const names = [];
  for (const block of blocks) {
    const candidate = block.match(/^(.{2,100}?)\s+(?:is|are|serves|works|holds|has|received|leads|studies)\b/)?.[1]?.trim();
    if (candidate && candidate.split(/\s+/).length <= 6) names.push(candidate);
  }
  return [...new Set(names)];
}

function excerpt(value, wordLimit = 24) {
  const words = value.split(/\s+/).filter(Boolean);
  return words.length > wordLimit ? `${words.slice(0, wordLimit).join(' ')}…` : words.join(' ');
}

export function parseProjectDetail(html, expectedProject) {
  const projectMarker = html.search(/>The Project\s*</);
  const teamMarker = html.search(/>The Team\s*</);
  if (projectMarker < 0 || teamMarker <= projectMarker) throw new Error(`Missing project/team sections for ${expectedProject}.`);
  const sectionEnd = html.indexOf('</section>', teamMarker);
  if (sectionEnd < 0) throw new Error(`Missing team section boundary for ${expectedProject}.`);
  const projectBlocks = textBlocks(html.slice(projectMarker, teamMarker)).filter((block) => block.trim() !== 'The Project');
  const teamBlocks = textBlocks(html.slice(teamMarker, sectionEnd)).filter((block) => block.trim() !== 'The Team');
  const updatedMillis = Number(html.match(/data-updated-on="(\d{13})"/)?.[1]);
  return {
    projectSummary: projectBlocks.length ? excerpt(projectBlocks.join(' ')) : null,
    teamTextAvailable: teamBlocks.length > 0,
    teamNames: findTeamNames(teamBlocks),
    sourceUpdatedAt: Number.isFinite(updatedMillis) ? new Date(updatedMillis).toISOString() : null,
  };
}

export function buildRenPhilSnapshot(indexHtml, details, retrievedAt) {
  const winners = parseWinnerIndex(indexHtml);
  const records = winners.map((winner) => {
    const detail = details.get(winner.sourceUrl);
    if (!detail) throw new Error(`Missing RenPhil detail page: ${winner.sourceUrl}`);
    const parsed = parseProjectDetail(detail, winner.project);
    const sourceRecordId = createHash('sha256').update(winner.sourceUrl).digest('hex').slice(0, 24);
    return {
      sourceRecordId,
      project: winner.project,
      recipientNames: parsed.teamNames,
      teamTextAvailable: parsed.teamTextAvailable,
      purpose: parsed.projectSummary,
      fund: 'AI for Math Fund',
      namedFunder: 'XTX Markets',
      awardYear: 2025,
      amountUsd: null,
      decisionDate: null,
      status: 'published award; amount and payment timing not published',
      cause: 'science-and-technology',
      intervention: 'AI for mathematics research and infrastructure',
      sourceUrl: winner.sourceUrl,
      sourceUpdatedAt: parsed.sourceUpdatedAt,
    };
  });
  return {
    source: {
      publisher: 'Renaissance Philanthropy',
      title: 'AI for Math Fund: 2025 Winners',
      url: RENPHIL_WINNERS_URL,
      retrievedAt,
      statusSemantics: 'published award; amount and payment timing not published',
      coverageNote: 'RenPhil states that the first round contained 29 awards, but its current portfolio page exposes 28 named project records. This snapshot imports those 28 and records one unresolved coverage gap. Row-level award amounts and decision/payment dates are not published.',
      contentHash: createHash('sha256').update(JSON.stringify(records)).digest('hex'),
    },
    fundSignals: {
      namedFunder: 'XTX Markets',
      declaredFirstRoundAwardCount: 29,
      displayedFirstRoundAwardCount: records.length,
      unlistedFirstRoundAwardCount: 29 - records.length,
      firstRoundCommitmentUsd: 18_000_000,
      firstRoundAnnouncedAt: '2025-09-17',
      firstRoundSourceUrl: RENPHIL_FIRST_ROUND_URL,
      fundCommitmentUsd: 31_500_000,
      commitmentAsOf: null,
      additionalCommitmentSourceUrl: RENPHIL_ADDITIONAL_URL,
      commitmentNote: '$31.5M combines the initial $18M first round and an additional $13.5M announcement. The additional-announcement page describes a 2026 round but its body prints March 5, 2025, so no normalized announcement date is inferred. No commitment is allocated across individual rows.',
      nextRoundGrantAllocationUsd: 10_500_000,
      fieldBuildingAllocationUsd: 3_000_000,
    },
    organizationSignals: {
      sourceUrl: 'https://www.renaissancephilanthropy.org/home',
      periodLabel: 'first two years',
      catalyzedCapitalUsd: 533_000_000,
      directlyRaisedUsd: 268_000_000,
      unlockedForOtherOrganizationsUsd: 265_000_000,
      semanticsNote: 'Organization-level impact signals reported by RenPhil; they are not grant-ledger totals and are never added to the award rows.',
    },
    summary: {
      awardCount: records.length,
      declaredAwardCount: 29,
      unlistedAwardCount: 29 - records.length,
      awardsWithPublishedAmount: records.filter((record) => record.amountUsd != null).length,
      awardsWithStructuredTeamNames: records.filter((record) => record.recipientNames.length > 0).length,
      awardsWithoutProjectDescription: records.filter((record) => !record.purpose).length,
      awardsWithoutPublishedTeamText: records.filter((record) => !record.teamTextAvailable).length,
    },
    records,
  };
}
