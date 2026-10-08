import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {summary,markdown,currentResult,sources} from '../lib/huckleberry-current-report.mjs';
import {researchCostRanking} from '../lib/research-cost-ranking.mjs';
import {localResearchEstimate} from '../lib/local-research-estimate.mjs';
import {expenseSummary} from '../lib/research-expenses.mjs';
import {reportSections} from '../lib/report-markdown.mjs';
import {groupReportSections} from '../lib/report-contents.mjs';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('Huckleberry structured summary, grouping and signed scope are explicit',()=>{
 assert.equal(summary.intro.split(/(?<=[.!?])\s+/).length,3);assert.equal(summary.reasons.length,3);assert.equal(summary.reservations.length,3);
 assert.deepEqual(JSON.parse(read('data/report-summary-editorial.json'))['Huckleberry Youth Programs'],summary);
 assert.equal(groupReportSections(reportSections(markdown),JSON.parse(read('data/report-contents-map.json'))['Huckleberry Youth Programs']).length,6);
 for(const word of ['$3.69M','$4.22M','$4.80M','−0.00075061','not clinical QALYs','start-of-period','Current charity-registry standing','not an anxiety-only subgroup','ALL course-caused','without','assumed','not a local quote'])assert.ok(markdown.includes(word),word);
 assert.equal(new Set(sources.map(s=>s.url)).size,sources.length);
});
test('One current ranking adapter, public report and API preserve old worlds',()=>{
 const rows=researchCostRanking.filter(r=>r.slug==='huckleberry-youth-programs');assert.equal(rows.length,1);
 assert.equal(rows[0].centralUsdPerTenQalys,currentResult.sf.usdPerBetterLife);assert.equal(localResearchEstimate(rows[0]).localUsdPerTenQalys,currentResult.bay.usdPerBetterLife);
 assert.equal(rows[0].estimateStatus,'conditional-course');assert.match(localResearchEstimate(rows[0]).localStatus,/ordinary-donation EV unknown/);
 assert.match(read('app/charities/huckleberry-youth-programs/page.tsx'),/huckleberry-current-report/);
 assert.match(read('app/api/sf-huckleberry-model/route.ts'),/historical\}/);assert.match(read('app/api/sf-huckleberry-model/route.ts'),/expectedValue:null/);
});
test('Original audit convention and five actual closed clocks are preserved',()=>{
 const finance=JSON.parse(read('data/research-expenses.json')).organizations['huckleberry-youth-programs'];assert.equal(expenseSummary(finance).average,8677745);assert.match(finance.note,/comparative/);
 assert.deepEqual(JSON.parse(read('data/san-francisco/huckleberry-finance-prior-20261004.json')).years.map(y=>y.expenses),[9320865,8764072,7757013]);
 const sessions=JSON.parse(read('data/research-effort.json')).organizations['Huckleberry Youth Programs'].sessions;assert.equal(sessions.length,5);assert.equal(new Set(sessions.map(s=>s.id)).size,5);
 for(const s of sessions){assert.ok(Date.parse(s.endedAt)>Date.parse(s.startedAt));assert.equal(s.model.name,'GPT-6.1 Sol');assert.match(s.model.evidence,/raw runtime metadata unknown/);assert.ok(fs.existsSync(new URL('../'+s.evidence,import.meta.url)));}
 const minutes=sessions.reduce((sum,s)=>sum+(Date.parse(s.endedAt)-Date.parse(s.startedAt))/60000,0);assert.ok(Math.abs(minutes-13.5728166667)<1e-8);
});
