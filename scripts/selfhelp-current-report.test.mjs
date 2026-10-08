import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {summary,markdown,currentResult,sources} from '../lib/selfhelp-current-report.mjs';
import {reportSections} from '../lib/report-markdown.mjs';
import {groupReportSections} from '../lib/report-contents.mjs';
import {researchCostRanking} from '../lib/research-cost-ranking.mjs';
import {localResearchEstimate} from '../lib/local-research-estimate.mjs';
import {expenseSummary} from '../lib/research-expenses.mjs';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('Self-Help structured report preserves intervention, metric and historical boundaries',()=>{
 assert.equal(summary.intro.split(/(?<=[.!?])\s+/).length,3);assert.equal(summary.reasons.length,3);assert.equal(summary.reservations.length,3);
 assert.deepEqual(JSON.parse(read('data/report-summary-editorial.json'))['Self-Help for the Elderly'],summary);
 assert.equal(groupReportSections(reportSections(markdown),JSON.parse(read('data/report-contents-map.json'))['Self-Help for the Elderly']).length,6);
 assert.equal(new Set(sources.map(s=>s.url)).size,sources.length);
 for(const text of ['$2.4M','$600K','$643K','−0.100241','ordinary-donation','six-week','−$96','Intention-to-treat','negative costs remain full','not clinical QALYs','extraction only'])assert.ok((markdown+summary.cost).includes(text),text);
});
test('Self-Help single ranking adapter is conditional SF-resident course, not ordinary EV',()=>{
 const rows=researchCostRanking.filter(r=>r.slug==='self-help-for-the-elderly');assert.equal(rows.length,1);
 assert.equal(rows[0].centralUsdPerTenQalys,currentResult.sf.usdPerBetterLife);assert.equal(rows[0].bayUsdPerTenQalys,currentResult.bay.usdPerBetterLife);
 assert.match(localResearchEstimate(rows[0]).localStatus,/Conditional prospective SF-resident/);assert.equal(currentResult.ordinaryDonationExpectedValue,null);
 assert.match(read('app/api/sf-selfhelp-model/route.ts'),/ordinaryDonation:\{expectedValue:null/);assert.match(read('app/api/sf-selfhelp-model/route.ts'),/historical\}/);
 assert.match(read('app/charities/self-help-for-the-elderly/page.tsx'),/selfhelp-current-report/);
 assert.match(read('app/san-francisco/page.tsx'),/self-help-for-the-elderly/);assert.match(read('app/san-francisco/page.tsx'),/ordinary-donation expected value unknown/);
 assert.match(read('app/san-francisco/all/page.tsx'),/Conditional prospective course; ordinary-donation EV unknown/);
 assert.match(read('app/san-francisco/all/page.tsx'),/10 health and income-equivalent years/);
});
test('Self-Help finances and actual closed timing retain evidence limits, no abandoned-time credit',()=>{
 const record=JSON.parse(read('data/research-expenses.json')).organizations['self-help-for-the-elderly'];assert.equal(expenseSummary(record).average,32376728.333333332);assert.match(record.note,/not original-return verified/);
 const sessions=JSON.parse(read('data/research-effort.json')).organizations['Self-Help for the Elderly'].sessions;
 assert.equal(sessions.length,4);assert.equal(new Set(sessions.map(s=>s.id)).size,4);
 assert.ok(!sessions.some(s=>s.id==='b922185f-2ed8-4bd4-b712-c68d84dffec4'));
 for(const s of sessions){assert.ok(Date.parse(s.endedAt)>Date.parse(s.startedAt));assert.equal(s.model.name,'GPT-6.1 Sol');assert.ok(fs.existsSync(new URL('../'+s.evidence,import.meta.url)));}
 const minutes=sessions.reduce((sum,s)=>sum+(Date.parse(s.endedAt)-Date.parse(s.startedAt))/60000,0);assert.ok(minutes>5&&minutes<10);
});
