import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import ts from 'typescript';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import reports from '../data/geography-reports.json' with {type:'json'};
import highlights from '../data/edition-highlights.json' with {type:'json'};
import selection from '../data/edition-featured.json' with {type:'json'};
import * as editions from '../lib/geography-editions.mjs';
import * as geography from '../lib/geography-reports.mjs';
import * as featured from '../lib/edition-featured.mjs';
import * as units from '../lib/featured-unit-costs.mjs';
import * as budgets from '../lib/annual-budget-supplements.mjs';
const read=path=>fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');
const source=read('components/EditionDonorHome.tsx');
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX},reportDiagnostics:true});
const module={exports:{}},require=createRequire(import.meta.url);
const imports={
 '@/components/ImpactMetric':{impactNode:node=>node},
 '@/lib/geography-editions.mjs':editions,'@/lib/geography-reports.mjs':geography,
 '@/data/edition-highlights.json':{default:highlights},'@/lib/edition-featured.mjs':featured,
 '@/lib/featured-unit-costs.mjs':units,'@/lib/annual-budget-supplements.mjs':budgets,
 '@/components/NativeUnitCost':{default:()=>null},'@/components/GivingIllustration':{default:()=>null},
};
vm.runInNewContext('(function(module,exports,require){'+compiled.outputText+'})')(module,module.exports,id=>imports[id]??(id.endsWith('.css')?{}:require(id)));
test('all 28 regional featured cards render a sourced image in the alternating layout',()=>{
 assert.equal(compiled.diagnostics.length,0);
 let total=0;
 for(const id of Object.keys(selection.editions)){
  const picks=featured.featuredReports(reports.reports,id);
  for(const report of picks){const image=highlights[id+'/'+report.slug];assert.ok(image,report.slug);assert.ok(image.caption&&image.source.startsWith('https://'));if(image.image.startsWith('/'))assert.ok(fs.existsSync(new URL('../public'+image.image,import.meta.url)));}
  const html=renderToStaticMarkup(React.createElement(module.exports.default,{id,label:id,reports:reports.reports,discovery:100,alpha:25,beta:10}));
  assert.equal((html.match(/<article class="sf-home-charity"/g)||[]).length,4,id);
  assert.equal((html.match(/<figure><a[^>]+><img /g)||[]).length,4,id);
  assert.doesNotMatch(html,/sf-home-charity-without-image|figcaption/);
  total+=picks.length;
 }
 assert.equal(total,28);
});
test('new picks cannot collapse to text-only and desktop snaking stacks correctly on mobile',()=>{
 assert.match(source,/\?\?\{image:'\/images\/givebetter-city.webp'/);
 const css=read('app/sf-home.css');
 assert.match(css,/\.sf-home-charity:nth-child\(even\) figure \{ order:2; \}/);
 assert.match(css,/@media\(max-width:760px\)[\s\S]*\.sf-home-charity:nth-child\(even\) figure \{ order:0; \}/);
 assert.match(read('app/san-francisco/page.tsx'),/<figure><a href=\{pick.source\}><img/);
});
