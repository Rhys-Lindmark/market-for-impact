import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {calculate} from '../lib/melp-calibrated-model.mjs';
import {content} from '../lib/melp-calibrated-report.mjs';
import {centralBayAdapters} from '../lib/central-bay-adapters.mjs';
import {validateResearchEffort,researchEffortSummary} from '../lib/research-effort.mjs';
const read=p=>JSON.parse(fs.readFileSync(new URL('../'+p,import.meta.url),'utf8'));
test('report and adapter use recalibrated combined unit, not frozen result',()=>{
 assert.equal(centralBayAdapters['melp-ablecloset'].bayUsdPerTenQalys,calculate().bayUsdPerBetterLife);
 assert.equal(centralBayAdapters['melp-ablecloset'].sfUsdPerTenQalys,calculate().sfUsdPerBetterLife);
 assert.equal(content.calibrationDate,'2026-10-01');assert.match(content.model.headline,/3\.6M/);
 assert.match(content.model.equation.result,/0\.0247891795/);assert.match(content.model.equation.result,/0\.0041120899/);
 assert.match(content.model.comparisonUnit,/income/);assert.ok(content.model.incomeLedger);
 assert.ok(!content.model.sensitivity.some(x=>/Subjective weight/.test(x.detail)));
 assert.ok(content.sources.every(s=>s.url.startsWith('https://')));
});
test('summary keeps three sentences, reasons, reservations and current unit',()=>{
 const s=read('data/top-ten-summaries.json')['melp-ablecloset'];
 assert.equal(s.intro.length,3);assert.equal(s.reasons.length,3);assert.equal(s.reservations.length,3);
 assert.match(s.cost.join(' '),/\$3\.6M/);assert.match(s.cost.join(' '),/income-equivalent/);
 assert.doesNotMatch(s.cost.join(' '),/1\.73 million|quarter of a year/);
});
test('actual new intervals preserve old models and canonical organization identity',()=>{
 const d=validateResearchEffort(read('data/research-effort.json'));const r=d.organizations['MELP/AbleCloset'];
 const latest=r.sessions.filter(s=>s.startedAt.startsWith('2026-10-01'));
 assert.ok(latest.length>=3);assert.ok(latest.every(s=>s.model.id==='gpt-6.1-sol'));
 assert.ok(r.sessions.some(s=>s.model.id!=='gpt-6.1-sol'));
 assert.match(researchEffortSummary(d,'MELP/AbleCloset').label,/min on GPT-6.1 Sol/);
 assert.equal(read('data/bay/melp-report.json').modelVersion,'melp-whole-org-v1');
 const e=read('data/research-expenses.json').organizations['melp-ablecloset'];
 assert.deepEqual(e.years.map(x=>x.year),[2024,2023]);
});
