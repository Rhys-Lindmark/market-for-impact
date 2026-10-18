import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {summary,markdown,sources,currentResult} from '../lib/newdoor-current-report.mjs';
import {reportSections} from '../lib/report-markdown.mjs';
import {groupReportSections} from '../lib/report-contents.mjs';
import {researchCostRanking} from '../lib/research-cost-ranking.mjs';
import {localResearchEstimate} from '../lib/local-research-estimate.mjs';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('New Door has three clear sentences, three reasons/reservations and six complete groups',()=>{
 assert.equal(summary.intro.split(/(?<=[.!?])\s+/).length,3);assert.equal(summary.reasons.length,3);assert.equal(summary.reservations.length,3);
 assert.deepEqual(JSON.parse(read('data/report-summary-editorial.json'))['New Door Ventures'],summary);
 assert.equal(groupReportSections(reportSections(markdown),JSON.parse(read('data/report-contents-map.json'))['New Door Ventures']).length,6);
 assert.equal(new Set(sources.map(s=>s.url)).size,sources.length);
 for(const s of ['not evidence of observed causal harm','expected value remains unknown','all negative taxes','Before netting','distinguished from clinical QALYs','$228,571,429','$507,936,508','$5,922,523'])assert.ok((markdown+summary.cost).includes(s),s);
});
test('New Door reference is negative, not favorable sensitivity or historical numeric rank',()=>{
 const row=researchCostRanking.find(r=>r.slug==='new-door-ventures');
 assert.equal(row.centralUsdPerTenQalys,null);assert.equal(row.bayUsdPerTenQalys,null);assert.ok(currentResult.bayIncludingSfCombinedHealthyYearEquivalent<0);
 assert.equal(currentResult.ordinaryDonationExpectedValue,null);
 const local=localResearchEstimate(row);assert.equal(local.localUsdPerTenQalys,null);assert.match(local.localStatus,/Conditional partial model/);assert.match(local.localStatus,/EV remains unknown/);
 assert.match(read('app/san-francisco/all/page.tsx'),/Conditional partial model; ordinary-donation EV unknown/);
 assert.match(read('app/api/newdoor-portfolio-model/route.ts'),/historicalPortfolio:historical,earlierEmploymentOnlyDiagnostic:earlier/);
 assert.match(read('app/charities/new-door-ventures/page.tsx'),/newdoor-current-report/);
});
test('New Door has five actual closed Sol clocks, not an assigned fifteen-minute duration',()=>{
 const sessions=JSON.parse(read('data/research-effort.json')).organizations['New Door Ventures'].sessions;
 assert.equal(sessions.length,5);assert.equal(new Set(sessions.map(s=>s.id)).size,5);
 for(const s of sessions){assert.ok(Date.parse(s.endedAt)>Date.parse(s.startedAt));assert.equal(s.model.name,'GPT-6.1 Sol');assert.ok(fs.existsSync(new URL('../'+s.evidence,import.meta.url)));}
 const total=sessions.reduce((sum,s)=>sum+(Date.parse(s.endedAt)-Date.parse(s.startedAt))/60000,0);assert.ok(total>15&&total<16);
});
