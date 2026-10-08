import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {summary,markdown,sources,contentsMapping,currentResult} from '../lib/vtl-legacy-current-report.mjs';
import {reportSections} from '../lib/report-markdown.mjs';
import {groupReportSections} from '../lib/report-contents.mjs';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('Complete current summary, six section groups and distinct original sources',()=>{
 assert.equal(summary.reasons.length,3);assert.equal(summary.reservations.length,3);
 assert.equal(summary.intro.split(/(?<=[.!?])\s+/).length,3);
 assert.equal(groupReportSections(reportSections(markdown),contentsMapping).length,6);
 assert.equal(new Set(sources.map(s=>s.url)).size,sources.length);
 for(const term of ['netted before','not verified cash expense','Ordinary unrestricted-gift expected value remains unidentified','not confidence intervals','income-equivalent healthy years'])assert.ok(markdown.includes(term),term);
 assert.ok(Math.abs(currentResult.geography.us.donorPer10Combined-1718504.1423220795)<1e-6);
 assert.equal(currentResult.grossResourceUSD,null);assert.equal(currentResult.ordinaryWholeGiftExpectedValue,null);
});
test('Current API/report/archive index use the same accepted engine and preserve history',()=>{
 assert.match(read('app/api/vision-to-learn-model/route.ts'),/vtl-legacy-calibrated-model/);
 assert.match(read('app/api/vision-to-learn-model/route.ts'),/vtl-legacy-pre-recalibration-model/);
 assert.match(read('app/charities/vision-to-learn/page.tsx'),/vtl-legacy-current-report/);
 assert.match(read('lib/us-research-index.ts'),/overallUsdPerTenQalys:vtl.us.donorPer10Combined/);
 const editorial=JSON.parse(read('data/report-summary-editorial.json'));
 assert.deepEqual(editorial['Vision To Learn'],summary);
 assert.deepEqual(JSON.parse(read('data/report-contents-map.json'))['Vision To Learn'],contentsMapping);
});
test('Actual closed clocks and national finance appendix are unique and supported',()=>{
 const registry=JSON.parse(read('data/research-effort.json'));
 const sessions=registry.organizations['Vision To Learn'].sessions;
 assert.equal(sessions.length,4);assert.equal(new Set(sessions.map(s=>s.id)).size,4);
 for(const s of sessions){assert.ok(Date.parse(s.endedAt)>Date.parse(s.startedAt));assert.equal(s.model.name,'GPT-6.1 Sol');assert.ok(fs.existsSync(new URL('../'+s.evidence,import.meta.url)));}
 assert.ok(!sessions.some(s=>s.id==='72699dc4-1cac-43ac-a227-7f7976d120a7'));
 const expense=JSON.parse(read('data/research-expenses.json')).organizations['vision-to-learn'];
 assert.equal(expense.ein,'453457853');assert.equal(expense.years.length,3);
 assert.equal(expense.years.reduce((sum,y)=>sum+y.expenses,0)/3,23073076.333333332);
});
