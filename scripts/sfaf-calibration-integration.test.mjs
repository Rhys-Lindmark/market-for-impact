import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {calculate} from '../lib/sfaf-calibrated-model.mjs';
import {content} from '../lib/sfaf-calibrated-report.mjs';
import {researchCostRanking} from '../lib/research-cost-ranking.mjs';
import {validateResearchEffort,researchEffortSummary} from '../lib/research-effort.mjs';
const read=p=>JSON.parse(fs.readFileSync(new URL('../'+p,import.meta.url),'utf8'));
test('current report, summary and ranking share combined central',()=>{
 const r=calculate(),rows=researchCostRanking.filter(x=>x.slug==='san-francisco-aids-foundation');
 assert.equal(rows.length,1);assert.equal(rows[0].bayUsdPerTenQalys,r.bayUsdPerBetterLife);assert.equal(rows[0].centralUsdPerTenQalys,r.sfUsdPerBetterLife);
 assert.equal(content.calibrationDate,'2026-10-01');assert.match(content.model.comparisonUnit,/income/);assert.match(content.model.equation.result,/1,926,860/);
 const s=read('data/top-ten-summaries.json')['san-francisco-aids-foundation'];
 assert.equal(s.intro.length,3);assert.equal(s.reasons.length,3);assert.equal(s.reservations.length,3);assert.match(s.cost.join(' '),/income-equivalent/);
 assert.doesNotMatch(content.program,/100,000|whole-gift/i);assert.match(content.model.fundingBoundary,/insurance-billing/);
});
test('actual dedicated per-model provenance and three original accounts preserved',()=>{
 const d=validateResearchEffort(read('data/research-effort.json')),r=d.organizations['San Francisco AIDS Foundation'];
 assert.ok(r.sessions.length>=5);assert.ok(r.sessions.every(s=>s.endedAt&&s.model.id==='gpt-6.1-sol'));
 assert.match(researchEffortSummary(d,'San Francisco AIDS Foundation').label,/min on GPT-6.1 Sol/);
 const expenses=read('data/research-expenses.json').organizations['san-francisco-aids-foundation'];
 assert.deepEqual(expenses.years.map(x=>x.expenses),[46733000,46259000,47219000]);
 assert.ok(content.sources.some(s=>s.url.includes('Jun23')));assert.ok(content.sources.some(s=>s.url.includes('June-24')));
});
test('frozen clinical calculator and dataset remain byte-identical',()=>{
 for(const [file,hash] of [['lib/sfaf-portfolio-model.mjs','30b54918bfdfe5e084452cb3c5fd2e2dac7fc48b17ded5791d47f3a3b6632bdb'],['data/san-francisco/sfaf-portfolio-model-v1.json','80e2ca0cccbdaa855e1bfb0b860aa43f6db46ee4ab219a99b2b69ca3ab7e0f4f']])assert.equal(crypto.createHash('sha256').update(fs.readFileSync(new URL('../'+file,import.meta.url))).digest('hex'),hash);
});
