import test from 'node:test';
import assert from 'node:assert/strict';
import data from '../data/annual-budget-supplements.json' with {type:'json'};
import reports from '../data/geography-reports.json' with {type:'json'};
import {annualBudgetSupplement,editionAnnualBudget,annualBudgetLabel} from '../lib/annual-budget-supplements.mjs';
import {expenseAverage,validateEditionReports} from '../lib/geography-reports.mjs';
import progress from '../docs/geography-progress.json' with {type:'json'};

test('all seven missing chart widths have finite, sourced, explicitly classified supplements',()=>{
 assert.equal(Object.keys(data.entries).length,7);
 for(const [key,budget] of Object.entries(data.entries)){
  assert.ok(Number.isFinite(budget.amountUSD)&&budget.amountUSD>0,key);
  assert.ok(['reported','estimate','historical-proxy'].includes(budget.kind));
  assert.ok(budget.sources.length&&budget.sources.every(s=>s.url.startsWith('https://')));
  assert.ok(budget.period&&budget.note&&budget.evidence);
 }
 assert.equal(Object.values(data.entries).filter(b=>b.kind==='reported').length,5);
});
test('reported fallback values match the original report disclosures without changing fiscal comparability',()=>{
 for(const [key,budget] of Object.entries(data.entries)){
  if(budget.kind!=='reported')continue;
  const [edition,slug]=key.split('/'),report=reports.reports.find(r=>r.edition===edition&&r.slug===slug);
  assert.ok(report.annualExpenses.some(y=>y.amount===budget.amountUSD));
  assert.equal(expenseAverage(report),null);
  assert.equal(editionAnnualBudget(report).amountUSD,budget.amountUSD);
 }
 const ordinary=reports.reports.find(r=>r.edition==='california'&&r.slug==='operation-access');
 assert.equal(editionAnnualBudget(ordinary).amountUSD,expenseAverage(ordinary));
 assert.equal(editionAnnualBudget(ordinary).kind,'average');
});
test('HOPE is an estimate and PHC is a stale program proxy, never presented as verified averages',()=>{
 const hope=annualBudgetSupplement('san-francisco','hope-pacifica'),phc=annualBudgetSupplement('san-francisco','project-homeless-connect');
 assert.equal(hope.amountUSD,40000);assert.deepEqual(hope.rangeUSD,[20000,100000]);
 assert.equal(hope.kind,'estimate');assert.match(annualBudgetLabel(hope),/^~/);
 assert.equal(phc.amountUSD,1460295);assert.equal(phc.kind,'historical-proxy');
 assert.match(phc.note,/terminated June 30, 2025/);assert.match(annualBudgetLabel(phc),/^~/);
 assert.equal(annualBudgetSupplement('unknown','unknown'),null);
});
test('new financial-header sessions satisfy the publication registry and provenance schema',()=>{
 assert.doesNotThrow(()=>validateEditionReports(reports,progress));
 const sessions=reports.sessions.filter(s=>s.evidence.startsWith('docs/budget-supplement-20261018/'));
 assert.equal(sessions.length,5);
 for(const session of sessions){assert.equal(session.model,null);assert.ok(session.endedAt>session.startedAt);}
});
