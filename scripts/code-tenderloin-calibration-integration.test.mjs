import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {calculate} from '../lib/code-tenderloin-calibrated-model.mjs';
import {content} from '../lib/code-tenderloin-calibrated-report.mjs';
import {researchCostRanking} from '../lib/research-cost-ranking.mjs';
import {validateResearchEffort,researchEffortSummary} from '../lib/research-effort.mjs';
const read=p=>JSON.parse(fs.readFileSync(new URL('../'+p,import.meta.url),'utf8'));
test('current combined ledger drives unique ranking and report',()=>{
 const r=calculate(),rows=researchCostRanking.filter(x=>x.slug==='code-tenderloin');
 assert.equal(rows.length,1);assert.equal(rows[0].bayUsdPerTenQalys,r.bayUsdPerBetterLife);assert.equal(rows[0].centralUsdPerTenQalys,r.sfUsdPerBetterLife);
 assert.equal(content.calibrationDate,'2026-10-01');assert.match(content.model.comparisonUnit,/income/);assert.match(content.model.headline,/1\.7M/);assert.match(content.model.equation.result,/1,716,764/);
 assert.ok(content.sources.every(s=>s.url.startsWith('https://')));assert.doesNotMatch(content.program,/100,000|Whole-gift/);
});
test('summary retains requested 3/3/3 structure and current price',()=>{
 const s=read('data/top-ten-summaries.json')['code-tenderloin'];
 assert.equal(s.intro.length,3);assert.equal(s.reasons.length,3);assert.equal(s.reservations.length,3);
 assert.match(s.cost.join(' '),/1\.72 million/);assert.match(s.cost.join(' '),/income-equivalent/);assert.match(s.cost.join(' '),/alternative pay/);
 const e=read('data/research-expenses.json').organizations['code-tenderloin'];assert.deepEqual(e.years,[]);
 const receipts=read('docs/geography-discovery/code-tenderloin-calibration-receipts-2026-10-01.json');assert.deepEqual(receipts.sponsorReturns.map(x=>x.yearEnded),['2025-09-30','2024-09-30','2023-09-30']);
});
test('provenance uses actual closed sessions without overwriting frozen prior estimate',()=>{
 const data=validateResearchEffort(read('data/research-effort.json')),r=data.organizations['Code Tenderloin'];
 assert.ok(r.sessions.length>=5);assert.ok(r.sessions.every(s=>s.endedAt&&s.model.id==='gpt-6.1-sol'));
 assert.match(researchEffortSummary(data,'Code Tenderloin').label,/min on GPT-6.1 Sol/);
 assert.equal(read('data/research-effort-assigned-estimates.json').minutesByOrganization['Code Tenderloin'],17);
});
