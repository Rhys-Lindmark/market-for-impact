import crypto from 'node:crypto';
import { decodeHtmlEntities, removeHtmlElementContents } from './html-entities.mjs';

export const SFF_FISCAL_SPONSOR_API_URL = 'https://sff.org/wp-json/wp/v2/posts?search=fiscal%20sponsor&per_page=100&_fields=id,link,date,modified,title,content';

const normalize = (value) => String(value ?? '').normalize('NFKC').replace(/\s+/g, ' ').trim();
const identity = (value) => normalize(value).toLowerCase();
const hash = (value) => crypto.createHash('sha256').update(value).digest('hex');

function linesFromHtml(value) {
  const withoutScripts = removeHtmlElementContents(removeHtmlElementContents(value, 'script'), 'style');
  return decodeHtmlEntities(withoutScripts
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<\/(?:p|div|li|h[1-6])\s*>/gi, '\n')
    .replace(/<[^>]+>/g, ' '))
    .replaceAll(' ', ' ')
    .split(/\n/)
    .map(normalize)
    .filter(Boolean);
}

function textFromHtml(value) {
  return linesFromHtml(value).join(' ');
}

export function extractFiscalSponsorAssertions(posts) {
  const assertions = [];
  for (const post of posts) {
    const html = String(post?.content?.rendered ?? '');
    for (const block of html.split(/<hr\b[^>]*>/i)) {
      const lines = linesFromHtml(block);
      const sponsorLine = lines.find((line) => /^fiscal sponsor\s*:/i.test(line));
      if (!sponsorLine) continue;
      const granteeLine = lines.find((line) => /^grantee\s*:/i.test(line));
      const headings = [...block.matchAll(/<h[4-6][^>]*>([\s\S]*?)<\/h[4-6]>/gi)];
      const projectName = normalize(granteeLine
        ? granteeLine.replace(/^grantee\s*:\s*/i, '')
        : textFromHtml(headings.at(-1)?.[1] ?? ''));
      const fiscalSponsorName = normalize(sponsorLine.replace(/^fiscal sponsor\s*:\s*/i, ''));
      if (!projectName || !fiscalSponsorName) continue;
      assertions.push({
        id: hash(`${post.id}:${identity(projectName)}:${identity(fiscalSponsorName)}`).slice(0, 16),
        projectName,
        fiscalSponsorName,
        assertionSemantics: 'source-reported-at-publication-not-current-verification',
        sourcePostId: post.id,
        sourcePostTitle: textFromHtml(post.title?.rendered ?? ''),
        sourceUrl: post.link,
        sourcePublishedAt: post.date,
        sourceModifiedAt: post.modified,
      });
    }
  }
  return [...new Map(assertions.map((row) => [row.id, row])).values()]
    .sort((a, b) => b.sourcePublishedAt.localeCompare(a.sourcePublishedAt)
      || a.projectName.localeCompare(b.projectName)
      || a.fiscalSponsorName.localeCompare(b.fiscalSponsorName));
}

export function buildFiscalSponsorSource(posts, retrievedAt) {
  if (!Array.isArray(posts)) throw new Error('SFF fiscal-sponsor response is not an array.');
  const assertions = extractFiscalSponsorAssertions(posts);
  const relationKeys = new Set(assertions.map((row) => `${identity(row.projectName)}|${identity(row.fiscalSponsorName)}`));
  const sponsorsByProject = new Map();
  for (const row of assertions) {
    const key = identity(row.projectName);
    if (!sponsorsByProject.has(key)) sponsorsByProject.set(key, new Set());
    sponsorsByProject.get(key).add(identity(row.fiscalSponsorName));
  }
  const sourcePosts = posts
    .filter((post) => assertions.some((row) => row.sourcePostId === post.id))
    .map((post) => ({
      id: post.id,
      title: textFromHtml(post.title?.rendered ?? ''),
      url: post.link,
      publishedAt: post.date,
      modifiedAt: post.modified,
    }))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  const semantic = {
    searchedPostCount: posts.length,
    sourcePosts,
    assertions,
  };
  return {
    version: 'sf-sff-fiscal-sponsor-source-v0.1',
    retrievedAt,
    search: {
      apiUrl: SFF_FISCAL_SPONSOR_API_URL,
      query: 'fiscal sponsor',
      coverageBoundary: 'Official SFF WordPress posts returned by the site search API. This is a dated source-assertion corpus, not a complete or current registry of fiscal-sponsor relationships.',
    },
    summary: {
      searchedPostCount: posts.length,
      sourcePostCount: sourcePosts.length,
      extractedAssertionCount: assertions.length,
      uniqueProjectSponsorRelationshipCount: relationKeys.size,
      conflictingProjectCount: [...sponsorsByProject.values()].filter((sponsors) => sponsors.size > 1).length,
    },
    sourcePosts,
    assertions,
    semanticHash: hash(JSON.stringify(semantic)),
  };
}

export function validateFiscalSponsorSource(source) {
  if (source.version !== 'sf-sff-fiscal-sponsor-source-v0.1') throw new Error('Unexpected SFF fiscal-sponsor source version.');
  if (source.summary.searchedPostCount !== 29) throw new Error('SFF fiscal-sponsor search result count drifted.');
  if (source.summary.extractedAssertionCount !== 44 || source.assertions.length !== 44) throw new Error('SFF fiscal-sponsor assertion count drifted.');
  if (source.summary.uniqueProjectSponsorRelationshipCount !== 35) throw new Error('SFF fiscal-sponsor relationship count drifted.');
  if (source.summary.conflictingProjectCount !== 1) throw new Error('SFF fiscal-sponsor conflict count drifted.');
  if (new Set(source.assertions.map((row) => row.id)).size !== source.assertions.length) throw new Error('Duplicate SFF fiscal-sponsor assertion ID.');
  if (source.assertions.some((row) => row.assertionSemantics !== 'source-reported-at-publication-not-current-verification')) throw new Error('SFF fiscal-sponsor semantics drifted.');
  const semantic = {
    searchedPostCount: source.summary.searchedPostCount,
    sourcePosts: source.sourcePosts,
    assertions: source.assertions,
  };
  if (source.semanticHash !== hash(JSON.stringify(semantic))) throw new Error('SFF fiscal-sponsor semantic hash drifted.');
  return source;
}
