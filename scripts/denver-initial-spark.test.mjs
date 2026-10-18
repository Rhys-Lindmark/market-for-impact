import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {reportPrice,researchListPrice} from '../lib/geography-reports.mjs';
import {calculate as initial} from '../docs/geography-discovery/denver-cchi-spark-initial-20261006/spark-initial-model.mjs';
import {calculate} from '../docs/geography-discovery/denver-cchi-spark-initial-20261006/spark-model.mjs';
const data=JSON.parse(fs.readFileSync(new URL('../data/geography-reports.json',import.meta.url)));
test('Spark preserves complete initial diagnostic and requires completed suitable care for income',()=>{
 const r=data.reports.find(r=>r.edition==='denver'&&r.organizationId==='ein:84-0782124');
 assert.equal(r.acceptance.status,'accepted');assert.equal(r.stage,'alpha');
 const d=JSON.parse(fs.readFileSync(new URL('../docs/geography-discovery/denver-cchi-spark-initial-20261006/spark-initial-diagnostic.json',import.meta.url)));
 assert.equal(d.model.scenarios[0].price10,initial().price10);
 for(const s of r.model.scenarios){const want=JSON.parse(JSON.stringify(calculate(s.overrides)));for(const k of ['costUSD','editionQalys','incomeEquivalent','totalEquivalent','price10','incomePathways'])assert.deepEqual(s[k],want[k]);}
 const c=r.model.scenarios.find(x=>x.id==='central');assert.equal(c.costUSD,2111453);assert.equal(r.model.inputs.find(x=>x.name==='N').value,6000);
 assert.equal(reportPrice(r),10*c.costUSD/(c.editionQalys+c.incomeEquivalent));assert.equal(researchListPrice(r),reportPrice(r));assert.ok(c.incomeEquivalent<0);
 for(const o of [{eligible:0},{completion:0}])assert.ok(!calculate(o).incomePathways.some(p=>p.id==='changed-households'));
 for(const id of r.sessionIds){const s=data.sessions.find(x=>x.id===id);assert.ok(s?.endedAt&&s.model.id==='gpt-6.1-sol');assert.equal(s.organizationId,r.organizationId);}
 assert.ok(!data.sessions.some(x=>x.id==='3090aedf-f21f-4134-9744-213e6bfa52e5'));
 assert.match(r.priceScope,/not measured whole-portfolio or marginal-gift/);
});
