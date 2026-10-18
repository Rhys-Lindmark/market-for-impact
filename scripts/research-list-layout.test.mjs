import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import ts from 'typescript';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import progress from '../docs/geography-progress.json' with {type:'json'};
import boundaries from '../docs/geography-boundaries.json' with {type:'json'};
import reports from '../data/geography-reports.json' with {type:'json'};
import * as editions from '../lib/geography-editions.mjs';
import * as metrics from '../lib/impact-metric.mjs';
import * as reportHelpers from '../lib/geography-reports.mjs';

const read=file=>fs.readFileSync(new URL('../'+file,import.meta.url),'utf8');
const require=createRequire(import.meta.url);
const styles={shell:'shell',intro:'intro',caveat:'caveat',footer:'footer'};
function component(file,imports={}){
 const result=ts.transpileModule(read(file),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX},reportDiagnostics:true});
 assert.equal(result.diagnostics?.length,0);
 const module={exports:{}};
 vm.runInNewContext('(function(module,exports,require){'+result.outputText+'})')(module,module.exports,id=>{
  if(Object.hasOwn(imports,id))return imports[id];
  if(id.endsWith('.css'))return {default:styles};
  return require(id);
 });
 return module.exports.default;
}
const Intro=component('components/ResearchListIntro.tsx',{
 '@/lib/impact-metric.mjs':metrics,'@/lib/geography-editions.mjs':editions,
});
const Table=({reports})=>React.createElement('table',{'data-research-table':true},React.createElement('tbody',null,reports.map(r=>React.createElement('tr',{key:r.slug},React.createElement('td',null,r.organization)))));
const Geography=component('components/GeographyEdition.tsx',{
 '@/components/ImpactMetric':{impactNode:node=>node},'next/navigation':{notFound:()=>{throw Error('Not found');}},
 '@/docs/geography-progress.json':{default:progress},'@/docs/geography-boundaries.json':{default:boundaries},
 '@/lib/geography-editions.mjs':editions,'@/lib/geography-reports.mjs':reportHelpers,
 '@/lib/published-geography-reports':{reportRegistry:reports},
 './EditionResearchTable':{default:Table},'./ResearchListIntro':{default:Intro},
 './EditionDonorHome':{default:()=>React.createElement('div',{'data-donor-home':true})},
});
const render=(Component,props)=>renderToStaticMarkup(React.createElement(Component,props));

test('SF and regional lists share the same compact three-paragraph intro and two-link navigation',()=>{
 for(const props of [{label:'SF',location:'the San Francisco Bay Area',shortlistHref:'/san-francisco'},...progress.editions.map(e=>({label:e.label,shortlistHref:editions.canonicalBase+'/'+e.id}))]){
  const html=render(Intro,props);
  assert.equal((html.match(/<p\b/g)||[]).length,3);
  assert.equal((html.match(/<a\b/g)||[]).length,2);
  assert.match(html,/class="intro"/);assert.match(html,/What we learned across all reports/);
  assert.match(html,/Sorted by modeled cost, not recommendation strength/);
  assert.doesNotMatch(html,/<h2|Four featured|Prices include modeled|Compare the top four/);
 }
 assert.match(read('app/san-francisco/all/page.tsx'),/<ResearchListIntro label="SF"/);
});
test('all eleven regional research pages put the full table directly after the SF-style intro',()=>{
 for(const id of editions.editionIds){
  const html=render(Geography,{id,research:true});
  assert.match(html,/<main class="shell"><section class="intro">/);
  assert.match(html,/<\/section><section aria-label="Organization research" id="top-research"><table/);
  assert.doesNotMatch(html,/Four featured opportunities|Prices include modeled|Compare the top four across cities/);
  assert.match(html,/Research progress/);assert.match(html,/Which places count\?/);
  assert.match(html,/<footer class="footer">/);
  assert.equal((html.match(/<tr\b/g)||[]).length,reportHelpers.reportsForEdition(reports,id).length,id);
 }
});
test('donor homepages still render separately and research lists no longer depend on featured selection',()=>{
 for(const id of editions.editionIds)assert.match(render(Geography,{id}),/data-donor-home/);
 assert.doesNotMatch(read('components/GeographyEdition.tsx'),/featuredReports|editionReportPath/);
});
