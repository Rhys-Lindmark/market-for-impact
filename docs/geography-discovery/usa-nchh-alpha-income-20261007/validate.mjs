import fs from 'node:fs';
import assert from 'node:assert/strict';
import {calculate} from './model.mjs';
import {reportPrice,scenarioIncomeEquivalent,validateEditionReports} from '../market-for-impact-california-six-surgery-beta/lib/geography-reports.mjs';
const read=p=>JSON.parse(fs.readFileSync(new URL(p,import.meta.url)));
const r=read('report.json'),o=read('original-report.json'),sessions=read('sessions.json');
assert.deepEqual(read('initial-diagnostic.json'),o);
assert.deepEqual(read('ledger.json'),calculate());
assert.equal(calculate().income,null);assert.equal(calculate({b:0}).editionQalys,0);assert.equal(calculate({u:0}).editionQalys,0);
for(const x of o.model.scenarios){assert.deepEqual(r.model.scenarios.find(s=>s.id===x.id),x);if(x.assumptions.startsWith('{')){const inputs=JSON.parse(x.assumptions.slice(0,x.assumptions.indexOf('}')+1));const c=calculate(inputs);assert(Math.abs(c.editionQalys-x.editionQalys)<1e-12);assert(Math.abs(c.allPopulationQalys-x.allPopulationQalys)<1e-12);assert.equal(c.costUSD,x.costUSD);}}
assert.equal(reportPrice(r),reportPrice(o));assert.equal(r.model.incomeAssessment.status,'assessed-unknown');assert.equal(r.model.incomeBridge,undefined);assert.equal(scenarioIncomeEquivalent(r.model.scenarios.find(s=>s.id==='combined-income-unknown')),null);assert(r.sessionIds.includes(sessions[0].id));
const data=read('../market-for-impact-california-six-surgery-beta/data/geography-reports.json');data.reports=data.reports.map(x=>x.edition===r.edition&&x.slug===r.slug?r:x);data.sessions.push(...sessions);validateEditionReports(data,read('../market-for-impact-california-six-surgery-beta/docs/geography-progress.json'));
console.log(JSON.stringify({passed:true,clinical:calculate().editionQalys,price:reportPrice(r),originalWorlds:o.model.scenarios.length,authorSeconds:68.024}));

