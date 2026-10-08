import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {pvfCalibratedReport as report} from '../lib/pvf-calibrated-report.mjs';
import {calculate} from '../lib/pvf-calibrated-model.mjs';
import {researchCostRanking} from '../lib/research-cost-ranking.mjs';
import {validateResearchEffort} from '../lib/research-effort.mjs';
test('unique current ranking row and report share conditional health/resource center',()=>{
 const r=calculate(),rows=researchCostRanking.filter(x=>x.slug==='pacific-vision-foundation');assert.equal(rows.length,1);
 assert.equal(rows[0].bayUsdPerTenQalys,r.regions.bay.donorPrice10);assert.equal(rows[0].centralUsdPerTenQalys,r.regions.sf.donorPrice10);
 assert.equal(report.summary[0].value,'$13.57M');assert.equal(report.summary[1].value,'$30.53M');
 assert.equal(report.summaryReasons.length,3);assert.equal(report.summaryReservations.length,3);
 assert.match(report.model.body,/0.50 unique first-eye courses/);assert.match(report.model.comparisonUnit,/income-welfare/);
 assert.match(report.comparisonBridge.body,/previous ordinary-gift clinical center/);
});
test('dedicated provenance imports once, never fabricates old measured intervals',()=>{
 const data=JSON.parse(fs.readFileSync('data/research-effort.json'));validateResearchEffort(data);
 const sessions=data.organizations['Pacific Vision Foundation'].sessions;assert.equal(sessions.length,10);
 assert.equal(new Set(sessions.map(x=>x.id)).size,sessions.length);
 assert(sessions.every(s=>s.endedAt&&s.model.id==='gpt-6.1-sol'&&s.rawRuntimeModel===null));
});
