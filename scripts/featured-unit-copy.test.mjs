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
import {reportPrice} from '../lib/geography-reports.mjs';
const read=file=>fs.readFileSync(new URL('../'+file,import.meta.url),'utf8');
const source=read('components/NativeUnitCost.tsx');
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX},reportDiagnostics:true});
assert.equal(compiled.diagnostics?.length,0);
const module={exports:{}},require=createRequire(import.meta.url);
vm.runInNewContext('(function(module,exports,require){'+compiled.outputText+'})')(module,module.exports,id=>id==='@/lib/featured-unit-costs.mjs'?units:id==='@/lib/impact-metric.mjs'?metric:require(id));
const Component=module.exports.default;

test('all 29 native descriptions are concise, concrete and free of modeling jargon',()=>{
  const native=Object.values(config.entries).filter(e=>e.kind!=='unknown');
  assert.equal(native.length,29);
  for(const entry of native){assert.ok(entry.unit.split(/\s+/).length<=16,entry.unit);assert.doesNotMatch(entry.unit,/equivalent|modeled|proposed|reference|course place/i);}
  assert.equal(units.nativeUnitForSF('self-help-for-the-elderly').line,'About $600 for one 24-week fall-prevention course');
  assert.match(units.nativeUnitForSF('recares').line,/crutches|walker/);
});
test('32 card renderings use one body paragraph, money-only emphasis and report footnotes, never dropdowns or extra labels',()=>{
  const estimates=reports.reports.filter(r=>selection.editions[r.edition]?.slugs.includes(r.slug)).map(r=>[units.nativeUnitForReport(r),metric.formatImpactPrice(reportPrice(r))]);
  for(const slug of ['recares','self-help-for-the-elderly','hope-pacifica','project-homeless-connect'])estimates.push([units.nativeUnitForSF(slug),'$64K']);
  assert.equal(estimates.length,32);
  for(const [estimate,price]of estimates){
    const html=renderToStaticMarkup(React.createElement(Component,{estimate,reportHref:'/report',comparisonPrice:price}));
    assert.equal((html.match(/<p\b/g)||[]).length,1);
    assert.doesNotMatch(html,/<details|<summary|Calculation and scope|sf-home-native-basis/);
    const strong=[...html.matchAll(/<strong>(.*?)<\/strong>/g)].map(m=>m[1]);
    assert.equal(strong.length,estimate.priceUSD===null?1:2);
    for(const amount of strong)assert.match(amount,/^\$[\d,.]+[KMBT]?$/);
    assert.match(html,/data-daly-comparison/);
    assert.match(html,/Impact-estimate source and assumptions/);
    assert.equal(html.includes('data-native-unit'),estimate.priceUSD!==null);
  }
  const css=read('app/sf-home.css');
  assert.match(css,/\.sf-home-cost-effectiveness \{ font:inherit; color:inherit; \}/);
  assert.doesNotMatch(css,/sf-home-native-unit|sf-home-native-basis/);
});
