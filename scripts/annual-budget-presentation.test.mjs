import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import ts from 'typescript';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import supplements from '../data/annual-budget-supplements.json' with {type:'json'};
import expenses from '../data/research-expenses.json' with {type:'json'};
import reports from '../data/geography-reports.json' with {type:'json'};
import * as budgets from '../lib/annual-budget-supplements.mjs';
import * as expenseHelpers from '../lib/research-expenses.mjs';
import * as reportHelpers from '../lib/geography-reports.mjs';
import * as editions from '../lib/geography-editions.mjs';
import * as listCopy from '../lib/research-list-copy.mjs';
import * as metrics from '../lib/impact-metric.mjs';

const read=file=>fs.readFileSync(new URL('../'+file,import.meta.url),'utf8');
const require=createRequire(import.meta.url);
function component(file,imports={}){
 const result=ts.transpileModule(read(file),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX},reportDiagnostics:true});
 assert.equal(result.diagnostics?.length,0);
 const module={exports:{}};
 vm.runInNewContext('(function(module,exports,require){'+result.outputText+'})')(module,module.exports,id=>imports[id]??require(id));
 return module.exports.default;
}
const shared={'@/lib/annual-budget-supplements.mjs':budgets};
const SF=component('components/ResearchExpenses.tsx',{
 ...shared,'@/data/research-expenses.json':{default:expenses},'@/lib/research-expenses.mjs':expenseHelpers,
});
const Disclosure=component('components/AnnualBudgetDisclosure.tsx',shared);
const Table=component('components/EditionResearchTable.tsx',{
 ...shared,'@/components/ImpactMetric':{impactNode:node=>node},'@/lib/impact-metric.mjs':metrics,
 '@/lib/geography-reports.mjs':reportHelpers,'@/lib/geography-editions.mjs':editions,
 '@/lib/research-list-copy.mjs':listCopy,'@/app/research/research-index.module.css':{default:{}},
});
const render=(Component,props)=>renderToStaticMarkup(React.createElement(Component,props));

test('all SF budget links show only amounts or availability, never row-note text',()=>{
 for(const slug of new Set([...Object.keys(expenses.organizations),'self-help-for-the-elderly','hope-pacifica','project-homeless-connect'])){
  const html=render(SF,{slug});
  assert.doesNotMatch(html,/<small|title=/,slug);
  const visible=html.replace(/<[^>]*>/g,'');
  assert.match(visible,/^(?:~?\$[\d.,]+[KMBT]?|Not available)$/,slug);
  assert.match(html,/#annual-expenses/);
 }
 for(const [slug,amount] of [['self-help-for-the-elderly','~$3.3M'],['hope-pacifica','~$40K'],['project-homeless-connect','~$1.5M']]){
  assert.equal(render(SF,{slug}).replace(/<[^>]*>/g,''),amount);
 }
});
test('edition tables use Annual budget with amount-only cells and retained report links',()=>{
 const html=render(Table,{reports:reports.reports});
 assert.match(html,/<th scope="col">Annual budget<\/th>/);
 assert.doesNotMatch(html,/Annual expenses \/ budget|3-year average where comparable/);
 for(const cell of html.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)){
  if(!cell[1].includes('#annual-expenses'))continue;
  assert.doesNotMatch(cell[1],/<small|title=/);
  assert.match(cell[1].replace(/<[^>]*>/g,''),/^(?:~?\$[\d.,]+[KMBT]?|Not estimated)$/);
 }
 const sf=read('app/san-francisco/all/page.tsx');
 assert.match(sf,/<th scope="col">Annual budget<\/th>/);
 assert.doesNotMatch(sf,/Annual expenses \/ budget|3-year average where comparable/);
});
test('every removed supplement label and note remains in its research report disclosure',()=>{
 for(const [key,budget] of Object.entries(supplements.entries)){
  const [edition,slug]=key.split('/');const html=render(Disclosure,{edition,slug});
  const text=html.replace(/<[^>]*>/g,'').replaceAll('&#x27;',"'").replaceAll('&amp;','&');
  assert.ok(text.includes(budget.label),key);
  assert.ok(text.includes(budget.note),key);
  assert.ok(text.includes(budget.period),key);
  for(const source of budget.sources)assert.ok(html.includes(source.url.replaceAll('&','&amp;')),key);
 }
 assert.match(read('components/ReportExpenseAppendix.tsx'),/<AnnualBudgetDisclosure edition="san-francisco"/);
 assert.match(read('components/EditionResearchReport.tsx'),/<AnnualBudgetDisclosure edition=\{edition\} slug=\{slug\}/);
 assert.match(read('components/ReportExpenseAppendix.tsx'),/data-historical-contract-spending/);
});
