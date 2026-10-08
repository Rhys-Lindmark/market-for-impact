import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {summary,markdown,sources,contentsMapping} from '../lib/changent-current-report.mjs';
import {reportSections} from '../lib/report-markdown.mjs';
import {groupReportSections} from '../lib/report-contents.mjs';
import {calculate} from '../lib/changent-legacy-recalibration.mjs';
test('Changent report separates horizons, health/resources and latest fiscal finances',()=>{
assert.equal(summary.intro.split(/\.\s+/).length,3);assert.equal(summary.reasons.length,3);assert.equal(summary.reservations.length,3);
assert.equal(groupReportSections(reportSections(markdown),contentsMapping).length,6);
assert.ok(markdown.split(/\s+/).length>2100);
assert.match(markdown,/89\.55%/);assert.match(markdown,/secondary reduction in emergency/);
assert.match(markdown,/33,975,561/);assert.match(markdown,/−\$2,489,261/);
assert.equal(new Set(sources.map(s=>s.url)).size,sources.length);
assert.ok(markdown.indexOf('## Spending breakdown')>markdown.indexOf('## Funding and previous grants'));
assert.ok(Math.abs(calculate().weighted.conditionalDonorCostPer10Equivalent-12252706.210739108)<.0001);
});
test('current report/API/list wiring uses combined finite model, not historical lifetime',()=>{
const index=fs.readFileSync('lib/us-research-index.ts','utf8');assert.match(index,/changent-legacy-recalibration/);assert.match(index,/overallUsdPerTenQalys:nfp\.conditionalDonorCostPer10Equivalent/);
assert.match(fs.readFileSync('app/api/nfp-model/route.ts','utf8'),/evaluated:calculate\(\)/);
assert.match(fs.readFileSync('app/charities/nurse-family-partnership/page.tsx','utf8'),/changent-current-report/);
const registry=JSON.parse(fs.readFileSync('data/research-effort.json')).organizations['Changent / Nurse-Family Partnership'];
assert.equal(new Set(registry.sessions.map(x=>x.id)).size,registry.sessions.length);assert.equal(registry.sessions.filter(x=>x.startedAt>='2026-10-04').length,4);
});
