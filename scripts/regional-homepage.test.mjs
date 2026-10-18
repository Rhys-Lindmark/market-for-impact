import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import ts from 'typescript';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import sharp from 'sharp';
import registry from '../data/research-effort.json' with {type:'json'};
import reports from '../data/geography-reports.json' with {type:'json'};
import progress from '../docs/geography-progress.json' with {type:'json'};
import readiness from '../data/donor-readiness.json' with {type:'json'};
import * as time from '../lib/homepage-research.mjs';
import * as editions from '../lib/geography-editions.mjs';
import * as execution from '../lib/geography-execution.mjs';
const read=file=>fs.readFileSync(new URL('../'+file,import.meta.url),'utf8');
const session=(id,start,end,workerId='one',phase='research')=>({id,workerId,phase,startedAt:`2026-01-01T10:${start}:00Z`,endedAt:`2026-01-01T10:${end}:00Z`});

test('time is a union per worker across both ledgers, not duplicated report references or human equivalents',()=>{
 const one=session('one','00','30'),overlap=session('two','20','50'),parallel=session('three','00','15','other');
 const r={organizations:{A:{sessions:[one,overlap]}}},g={sessions:[one,parallel,{...session('test','00','59'),phase:'test'}],historicalMinutes:9000};
 const before=JSON.stringify([r,g]),actual=time.homepageResearchTime(r,g);
 assert.equal(actual.hours,65/60);assert.equal(actual.sessionCount,3);assert.equal(actual.workerCount,2);
 assert.equal(JSON.stringify([r,g]),before);
});
test('unknown timing is not zero and conflicting duplicate IDs fail closed',()=>{
 const unknown=time.homepageResearchTime({organizations:{A:{sessions:[{id:'unknown',phase:'research'}]}}},{sessions:[]});
 assert.equal(unknown.hours,null);assert.equal(unknown.missingIntervals,1);
 const s=session('same','00','30');
 assert.throws(()=>time.homepageResearchTime({organizations:{A:{sessions:[s]}}},{sessions:[{...s,workerId:'different'}]}),/Conflicting/);
});
test('real ledgers produce a conservative, dynamically computed total without changing provenance',()=>{
 const before=JSON.stringify([registry,reports]);
 const result=time.homepageResearchTime(registry,reports);
 const naive=[...Object.values(registry.organizations).flatMap(o=>o.sessions),...reports.sessions].reduce((sum,s)=>sum+(Date.parse(s.endedAt)-Date.parse(s.startedAt))/3600000,0);
 assert.ok(result.hours>0&&result.hours<naive);
 assert.equal(result.missingIntervals,0);
 assert.equal(JSON.stringify([registry,reports]),before);
});

const compiled=ts.transpileModule(read('app/all/page.tsx'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX},reportDiagnostics:true});
assert.equal(compiled.diagnostics?.length,0);
const require=createRequire(import.meta.url),module={exports:{}};
const imports={
 '@/docs/geography-progress.json':{default:progress},'@/data/donor-readiness.json':{default:readiness},
 '@/data/geography-reports.json':{default:reports},'@/data/research-effort.json':{default:registry},
 '@/lib/unified-research-index':{unifiedResearch:[]},'@/lib/geography-editions.mjs':editions,
 '@/lib/geography-execution.mjs':execution,'@/lib/homepage-research.mjs':time,
 '@/components/GeographyEdition':{EditionMasthead:()=>React.createElement('header',null,'GiveBetter')},
};
vm.runInNewContext('(function(module,exports,require){'+compiled.outputText+'})')(module,module.exports,id=>imports[id]??(id.endsWith('.css')?{}:require(id)));

test('homepage has the requested single headline, an honest research figure and eight region links',()=>{
 const html=renderToStaticMarkup(React.createElement(module.exports.default));
 const h1=html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1].replace(/<[^>]*>/g,'');
 assert.equal(h1,'We research programs that improve lives the most per dollar, for a given region.');
 assert.equal((html.match(/<h1\b/g)||[]).length,1);
 assert.doesNotMatch(html,/Explore our giving funds|share our work openly|direct donations to the programs/i);
 assert.ok(html.includes(`Backed by ${Math.floor(time.homepageResearchTime(registry,reports).hours)}+ hours of AI research`));
 const hero=html.match(/<section class="gb-home-hero"[^>]*>([\s\S]*?)<\/section>/)[1];
 assert.match(hero,/<\/h1><p class="gb-home-hero-research"><a href="https:\/\/ai.rhyslindmark.com\/givebetter\/research-time">Backed by/);
 assert.equal((hero.match(/<p\b/g)||[]).length,1);
 assert.doesNotMatch(html,/class="gb-home-research|How we count research time|Logged research and source-review time/);
 assert.doesNotMatch(html,/No AI-to-human productivity multiplier is applied|Health and income assessment flags|<details|GiveBetter x SF/);
 const grid=html.match(/<ul class="gb-home-region-grid">([\s\S]*?)<\/ul>/)[1];
 assert.equal((grid.match(/<li\b/g)||[]).length,8);
 for(const region of time.homepageRegions){assert.ok(grid.includes(editions.canonicalBase+'/'+region.id));assert.ok(grid.includes(region.label));}
 assert.doesNotMatch(html,/Early research|gb-home-early/);
 for(const id of ['seattle','boston','atlanta','detroit'])assert.ok(!html.includes(editions.canonicalBase+'/'+id));
 assert.match(html,/id="research-time" href="https:\/\/ai.rhyslindmark.com\/givebetter\/research-time"/);
 assert.match(html,/Point your agent here/);assert.ok(html.includes(editions.canonicalBase+'/llms.txt'));assert.ok(html.includes(editions.canonicalBase+'/agents'));
 const css=read('app/all/home.css');
 assert.match(css,/grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
 assert.match(css,/@media\(max-width:650px\)/);
 assert.match(css,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
});
test('dedicated research-time page retains the full methodology and all three progress tables',()=>{
 const result=ts.transpileModule(read('app/research-time/page.tsx'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX},reportDiagnostics:true});
 assert.equal(result.diagnostics?.length,0);
 const page={exports:{}};
 vm.runInNewContext('(function(module,exports,require){'+result.outputText+'})')(page,page.exports,id=>imports[id]??(id.endsWith('.css')?{}:require(id)));
 const html=renderToStaticMarkup(React.createElement(page.exports.default));
 assert.equal(page.exports.metadata.alternates.canonical,editions.canonicalBase+'/research-time');
 assert.match(html,/<h1>Research time and progress<\/h1>/);
 assert.ok(html.includes(time.homepageResearchTime(registry,reports).hours.toFixed(1)+' recorded hours'));
 for(const label of ['Research by city and region','Health and income assessment flags','Stage time and progress'])assert.ok(html.includes(label));
 assert.equal((html.match(/<table\b/g)||[]).length,3);
 assert.match(html,/No AI-to-human productivity multiplier is applied/);
 assert.match(html,/historical time estimates, missing intervals, planned budgets, tests and publishing/);
 assert.doesNotMatch(html,/<details|GiveBetter x SF/);
 assert.ok(html.includes(editions.canonicalBase+'/all'));
});
test('all new illustrations exist, are optimized and reserve dimensions',async()=>{
 const ids=['hero',...time.homepageRegions.filter(r=>r.image).map(r=>r.image)];
 for(const id of ids){
  const path=new URL('../public/images/regions/'+id+'.webp',import.meta.url).pathname;
  const m=await sharp(path).metadata();assert.equal(m.format,'webp');
  if(id==='hero'){assert.equal(m.width,1800);assert.equal(m.height,693);}else{assert.equal(m.width,400);assert.equal(m.height,400);}
  assert.ok(fs.statSync(path).size<300000,id);
 }
});
