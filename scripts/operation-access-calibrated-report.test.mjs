import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {operationAccessCalibratedReport as report} from '../lib/operation-access-calibrated-report.mjs';
import {calculate} from '../lib/operation-access-calibrated-model.mjs';
import {researchCostRanking as rows} from '../lib/research-cost-ranking.mjs';
import {validateResearchEffort} from '../lib/research-effort.mjs';
test('current report and unique ranking row use corrected native-health-resource center',()=>{
 const r=calculate(),row=rows.filter(x=>x.slug==='operation-access');assert.equal(row.length,1);
 assert.equal(row[0].bayUsdPerTenQalys,r.regions.bay.price10);assert.equal(row[0].centralUsdPerTenQalys,r.regions.sf.price10);
 assert.equal(report.summary[0].value,'$7.63M');assert.equal(report.summary[1].value,'$57.25M');
 assert.equal(report.summaryReasons.length,3);assert.equal(report.summaryReservations.length,3);
 assert.match(report.model.body,/2.03 completed services/);assert.match(report.model.comparisonUnit,/income-welfare/);
 assert.match(report.comparisonBridge.body,/previous unweighted clinical center/);
 assert.match(report.model.incomeLedger.paragraphs.join(' '),/every negative burden is fully debited/);
});
test('only dedicated closed research records are imported with confirmed model provenance',()=>{
 const data=JSON.parse(fs.readFileSync('data/research-effort.json'));validateResearchEffort(data);
 const s=data.organizations['Operation Access'].sessions;
 assert.equal(new Set(s.map(x=>x.id)).size,s.length);
 assert.equal(s.filter(x=>x.evidence.includes('operation-access-legacy-')).length,8);
 assert(!s.some(x=>x.id==='63696b9b-9529-4532-95a3-c9f2aefb7fec'));
 assert(s.filter(x=>x.evidence.includes('operation-access-legacy-')).every(x=>x.model.id==='gpt-6.1-sol'));
});
