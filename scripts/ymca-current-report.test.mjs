import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {summary,markdown,sources,contentsMapping,currentResult} from '../lib/ymca-current-report.mjs';
import {reportSections} from '../lib/report-markdown.mjs';
import {groupReportSections} from '../lib/report-contents.mjs';
import {researchCostRanking} from '../lib/research-cost-ranking.mjs';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('YMCA summary/groups preserve partial health-income interpretation',()=>{
 assert.equal(summary.reasons.length,3);assert.equal(summary.reservations.length,3);assert.equal(summary.intro.split(/(?<=[.!?])\s+/).length,3);
 assert.equal(groupReportSections(reportSections(markdown),contentsMapping).length,6);
 assert.equal(new Set(sources.map(s=>s.url)).size,sources.length);
 for(const text of ['not clinical QALYs','not a complete unrestricted-donation expected value','not evidence of no benefit','Negative fees, burdens and clinical harms remain full','not observed independence','$553,028'])assert.ok(markdown.includes(text),text);
 assert.equal(currentResult.grossResourceUSD,null);assert.equal(currentResult.ordinaryGiftExpectedValue,null);
 assert.deepEqual(JSON.parse(read('data/report-summary-editorial.json'))['YMCA of Greater San Francisco'],summary);
 assert.deepEqual(JSON.parse(read('data/report-contents-map.json'))['YMCA of Greater San Francisco'],contentsMapping);
});
test('YMCA API/report/ranking agree without replacing original boundaries',()=>{
 const row=researchCostRanking.find(r=>r.slug==='ymca-greater-sf');
 assert.equal(row.centralUsdPerTenQalys,currentResult.geography.sf.donorUSDPer10CombinedEquivalentYears);
 assert.equal(row.bayUsdPerTenQalys,currentResult.geography.bayIncludingSF.donorUSDPer10CombinedEquivalentYears);
 assert.match(read('app/api/ymca-portfolio-model/route.ts'),/ymca-current-calibrated-model/);
 assert.match(read('app/api/ymca-portfolio-model/route.ts'),/ymca-legacy-pre-recalibration-model/);
 assert.match(read('app/api/ymca-portfolio-model/route.ts'),/ymca-dpp-historical-diagnostic/);
 assert.match(read('app/charities/ymca-greater-sf/page.tsx'),/ymca-current-report/);
 const rowText=read('lib/sf-research-index.ts').split('\n').find(l=>l.includes("href: '/charities/ymca-greater-sf'"));assert.match(rowText,/19\.82M/);assert.match(rowText,/12\.88M/);assert.doesNotMatch(rowText,/Whole|9\.50M|6\.18M/);
});
test('Four closed YMCA clocks and exact legal-entity finance mean remain supported',()=>{
 const sessions=JSON.parse(read('data/research-effort.json')).organizations['YMCA of Greater San Francisco'].sessions;
 assert.equal(sessions.length,4);assert.equal(new Set(sessions.map(s=>s.id)).size,4);
 for(const s of sessions){assert.ok(Date.parse(s.endedAt)>Date.parse(s.startedAt));assert.equal(s.model.name,'GPT-6.1 Sol');assert.ok(fs.existsSync(new URL('../'+s.evidence,import.meta.url)));}
 const expense=JSON.parse(read('data/research-expenses.json')).organizations['ymca-greater-sf'];
 assert.equal(expense.ein.replace(/\D/g,''),'940997140');assert.equal(expense.years.reduce((sum,y)=>sum+y.expenses,0)/3,111533308.66666667);
});
