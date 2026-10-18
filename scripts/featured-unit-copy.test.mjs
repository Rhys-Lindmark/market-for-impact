import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import ts from 'typescript';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import config from '../data/featured-unit-costs.json' with {type:'json'};
import reports from '../data/geography-reports.json' with {type:'json'};
import selection from '../data/edition-featured.json' with {type:'json'};
import * as units from '../lib/featured-unit-costs.mjs';
import * as metric from '../lib/impact-metric.mjs';
import {formatEditionReportPrice} from '../lib/geography-reports.mjs';
import * as budgets from '../lib/annual-budget-supplements.mjs';
import expenses from '../data/research-expenses.json' with {type:'json'};
import {featuredReports} from '../lib/edition-featured.mjs';
const read=file=>fs.readFileSync(new URL('../'+file,import.meta.url),'utf8');
const source=read('components/NativeUnitCost.tsx');
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX},reportDiagnostics:true});
assert.equal(compiled.diagnostics?.length,0);
const module={exports:{}},require=createRequire(import.meta.url);
vm.runInNewContext('(function(module,exports,require){'+compiled.outputText+'})')(module,module.exports,id=>id==='@/lib/annual-budget-supplements.mjs'?budgets:id==='@/lib/featured-unit-costs.mjs'?units:id==='@/lib/impact-metric.mjs'?metric:require(id));
const Component=module.exports.default;

test('regional homepages keep footer navigation without bottom research panels',()=>{
 const regional=read('components/EditionDonorHome.tsx');
 const sf=read('app/san-francisco/page.tsx');
 for(const page of [regional,sf]){
  assert.doesNotMatch(page,/Current research|Research progress|Detailed research and geographic scope|gb-edition-current/);
  assert.match(page,/className="sf-home-footer"/);
  assert.match(page,/All cities and regions/);
 }
 assert.match(regional,/All \{label\} research/);
 assert.match(sf,/All San Francisco research/);
});

test('all 29 native descriptions are concise, concrete and free of modeling jargon',()=>{
  const native=Object.values(config.entries).filter(e=>e.kind!=='unknown');
  assert.equal(native.length,29);
  for(const entry of native){assert.ok(entry.unit.split(/\s+/).length<=16,entry.unit);assert.doesNotMatch(entry.unit,/equivalent|modeled|proposed|reference|course place/i);}
  assert.equal(units.nativeUnitForSF('self-help-for-the-elderly').line,'About $600 for one 24-week fall-prevention course');
  assert.match(units.nativeUnitForSF('recares').line,/crutches|walker/);
});
test('32 card renderings use one body paragraph, money-only emphasis and report footnotes, never dropdowns or extra labels',()=>{
  const estimates=Object.keys(selection.editions).flatMap(id=>featuredReports(reports.reports,id)).map(r=>[units.nativeUnitForReport(r),formatEditionReportPrice(r),budgets.featuredOrganizationBudget(r)]);
  for(const slug of ['recares','self-help-for-the-elderly','hope-pacifica','project-homeless-connect'])estimates.push([units.nativeUnitForSF(slug),'$64K',budgets.sfOrganizationBudget(slug,expenses.organizations[slug])]);
  assert.equal(estimates.length,32);
  for(const [estimate,price,budget]of estimates){
    assert.ok(budget,'Every featured card has an existing financial figure');
    const html=renderToStaticMarkup(React.createElement(Component,{estimate,reportHref:'/report',comparisonPrice:price,budget}));
    assert.equal((html.match(/<p\b/g)||[]).length,1);
    assert.doesNotMatch(html,/<details|<summary|Calculation and scope|sf-home-native-basis/);
    const strong=[...html.matchAll(/<strong>(.*?)<\/strong>/g)].map(m=>m[1]);
    assert.equal(strong.length,estimate.priceUSD===null?2:3);
    for(const amount of strong)assert.match(amount,/^\$[\d,.]+[KMBT]?$/);
    assert.match(html,/data-daly-comparison/);
    assert.match(html,/Impact-estimate source and assumptions/);
    assert.equal(html.includes('data-native-unit'),estimate.priceUSD!==null);
    assert.doesNotMatch(html,/<br\s*\/?\s*>/);
    assert.match(html,/<\/sup> <span data-organization-budget=/);
    assert.match(html,/href="\/report#annual-expenses"/);
    assert.match(html,/Annual-budget source and scope/);
  }
  const css=read('app/sf-home.css');
  assert.match(css,/\.sf-home-cost-effectiveness \{ font:inherit; color:inherit; \}/);
  assert.doesNotMatch(css,/sf-home-native-unit|sf-home-native-basis/);
});
test('nonprofit size is not a hypothetical program allocation or a falsely current budget',()=>{
 const sf=budgets.sfOrganizationBudget('self-help-for-the-elderly',expenses.organizations['self-help-for-the-elderly']);
 assert.equal(sf.kind,'average');assert.ok(sf.amountUSD>30000000);
 const render=budget=>renderToStaticMarkup(React.createElement(Component,{estimate:units.nativeUnitForSF('recares'),reportHref:'/report',comparisonPrice:'$26K',budget}));
 assert.match(render(sf),/Nonprofit yearly budget is /);
 assert.match(render(budgets.annualBudgetSupplement('san-francisco','hope-pacifica')),/Estimated nonprofit yearly budget is /);
 assert.match(render(budgets.annualBudgetSupplement('san-francisco','project-homeless-connect')),/Historical program budget was /);
 assert.match(render(null),/Nonprofit yearly budget is not available/);
 const surgery=reports.reports.find(r=>r.edition==='usa'&&r.slug==='surgery-on-sunday');
 assert.equal(budgets.editionAnnualBudget(surgery),null);
 const latest=budgets.featuredOrganizationBudget(surgery);
 assert.equal(latest.amountUSD,262813);assert.equal(latest.year,2024);
 assert.match(render(latest),/Nonprofit yearly budget was <strong>\$263K<\/strong> \(2024\)/);
 assert.match(read('components/EditionDonorHome.tsx'),/budget=\{featuredOrganizationBudget\(report\)\}/);
 assert.match(read('app/san-francisco/page.tsx'),/budget=\{sfOrganizationBudget\(pick.slug/);
});
