import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {summary,markdown,sources} from '../lib/nems-current-report.mjs';
import {reportSections} from '../lib/report-markdown.mjs';
import {groupReportSections} from '../lib/report-contents.mjs';
test('NEMS current summary and six contents groups agree with report',()=>{
  const editorial=JSON.parse(fs.readFileSync('data/report-summary-editorial.json'));
  assert.deepEqual(editorial['North East Medical Services'],summary);
  assert.equal(summary.reasons.length,3);assert.equal(summary.reservations.length,3);
  const map=JSON.parse(fs.readFileSync('data/report-contents-map.json'))['North East Medical Services'];
  assert.equal(groupReportSections(reportSections(markdown),map).length,6);
  assert.ok(markdown.split(/\s+/).length>2300);
  assert.match(markdown,/Income unknown/);assert.match(markdown,/-37\.9580/);
  assert.match(markdown,/1,201,090\.59/);assert.match(markdown,/387,448/);
});
test('NEMS original finance sources and per-model closed provenance are explicit',()=>{
  const filings=sources.filter(s=>s.url.includes('/full_text/')&&s.retrieved==='2026-10-04');
  assert.equal(filings.length,6);
  for(const s of filings)assert.equal(s.retrieved,'2026-10-04');
  const record=JSON.parse(fs.readFileSync('data/research-effort.json')).organizations['North East Medical Services'];
  assert.equal(record.coverage,'partial');assert.equal(record.sessions.length,4);
  for(const s of record.sessions){assert.ok(Date.parse(s.endedAt)>Date.parse(s.startedAt));assert.equal(s.model.name,'GPT-6.1 Sol');assert.equal(s.rawRuntimeModel,null);assert.ok(fs.existsSync(s.evidence));}
});
test('conditional display does not insert unknown ordinary gifts into top-four ranking',async()=>{
  const {researchCostRanking}=await import('../lib/research-cost-ranking.mjs');
  const row=researchCostRanking.find(r=>r.slug==='north-east-medical-services');
  assert.equal(row.centralUsdPerTenQalys,null);assert.equal(row.bayUsdPerTenQalys,null);
  const index=fs.readFileSync('app/san-francisco/all/page.tsx','utf8');
  assert.match(index,/currentNems\(\)\.bay\.partialHealthUsdPerTen/);
  assert.match(index,/conditional HBV health; income and ordinary-gift total unknown/);
});
