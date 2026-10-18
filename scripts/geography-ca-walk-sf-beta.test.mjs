import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { reportPrice } from '../lib/geography-reports.mjs';

const data = JSON.parse(fs.readFileSync(new URL('../data/geography-reports.json', import.meta.url), 'utf8'));
const progress = JSON.parse(fs.readFileSync(new URL('../docs/geography-progress.json', import.meta.url), 'utf8'));
const report = data.reports.find(r => r.edition === 'california' && r.slug === 'walk-san-francisco');

test('Walk SF in-depth review withdraws uncalibrated donor price but retains diagnostic', () => {
  assert.equal(report.stage, 'beta');
  assert.equal(report.acceptance.status, 'accepted');
  // Walk SF was later recalibrated to a finite central (walk-ca-calibrated.test.mjs); the withdrawn-price state and
  // its null central no longer apply, but the original diagnostic is still preserved below.
  const diagnostic = report.model.scenarios.find(s => s.id === 'historical-prior-health-central');
  assert.ok(Math.abs(diagnostic.editionQalys - 0.22533298087679837) < 1e-12);
  assert.equal(report.sources.find(s => s.id === 'folsom-funding').publisher, 'SFMTA');
  const ca = progress.editions.find(e => e.id === 'california');
  assert.equal(ca.betaAcceptedPublished, ca.betaIds.length);
  assert.ok(ca.betaIds.includes(report.organizationId));
});
