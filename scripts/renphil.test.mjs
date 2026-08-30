import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRenPhilSnapshot, parseProjectDetail, parseWinnerIndex } from './lib/renphil.mjs';

const item = (title, href) => ({ title, description: `<p><a href="${href}">Explore project</a></p>` });
const items = Array.from({ length: 28 }, (_, index) => item(`Project ${index + 1}`, `/project-${index + 1}`));
const context = JSON.stringify({ userItems: items }).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const indexHtml = `<ul data-current-context="${context}"></ul>`;
const detailHtml = `<main data-updated-on="1750000000000"><div class="sqs-html-content"><h3><span>The Project</span></h3></div><div class="sqs-html-content"><p>Builds an open research tool.</p></div><div class="sqs-html-content"><h3><span>The Team</span></h3></div><div class="sqs-html-content"><p>Ada Lovelace is a mathematician.</p></div></section></main>`;

test('RenPhil index parser fails closed and preserves 28 currently displayed awards', () => {
  assert.equal(parseWinnerIndex(indexHtml).length, 28);
  assert.throws(() => parseWinnerIndex(indexHtml.replace('Project 28', 'Project 27')), /titles are not unique/);
  assert.throws(() => parseWinnerIndex(indexHtml.replace('Project 28', '')), /missing a title/);
});

test('RenPhil detail parser preserves project, team, and source update metadata', () => {
  const detail = parseProjectDetail(detailHtml, 'Project 1');
  assert.equal(detail.projectSummary, 'Builds an open research tool.');
  assert.deepEqual(detail.teamNames, ['Ada Lovelace']);
  assert.equal(detail.sourceUpdatedAt, '2025-06-15T15:06:40.000Z');
});

test('RenPhil snapshot never infers row-level amounts from fund commitments', () => {
  const urls = parseWinnerIndex(indexHtml).map((winner) => winner.sourceUrl);
  const snapshot = buildRenPhilSnapshot(indexHtml, new Map(urls.map((url) => [url, detailHtml])), '2026-08-30T00:00:00.000Z');
  assert.equal(snapshot.summary.awardCount, 28);
  assert.equal(snapshot.summary.declaredAwardCount, 29);
  assert.equal(snapshot.summary.unlistedAwardCount, 1);
  assert.equal(snapshot.summary.awardsWithPublishedAmount, 0);
  assert.equal(snapshot.fundSignals.fundCommitmentUsd, 31_500_000);
  assert.equal(snapshot.organizationSignals.catalyzedCapitalUsd, 533_000_000);
  assert.ok(snapshot.records.every((record) => record.amountUsd === null && record.decisionDate === null));
});
