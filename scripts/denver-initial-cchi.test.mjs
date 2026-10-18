import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {reportPrice,researchListPrice} from '../lib/geography-reports.mjs';
import {calculate as initial} from '../docs/geography-discovery/denver-cchi-spark-initial-20261006/cchi-initial-model.mjs';
import {calculate} from '../docs/geography-discovery/denver-cchi-spark-initial-20261006/cchi-model.mjs';
const data=JSON.parse(fs.readFileSync(new URL('../data/geography-reports.json',import.meta.url)));
test('CCHI preserves first calculator, matched annual reference and only verified closed provenance',()=>{
 const r=data.reports.find(x=>x.edition==='denver'&&x.organizationId==='org:colorado-consumer-health');
 assert.equal(r.acceptance.status,'accepted');assert.equal(r.stage,'alpha');
 const d=JSON.parse(fs.readFileSync(new URL('../docs/geography-discovery/denver-cchi-spark-initial-20261006/cchi-initial-diagnostic.json',import.meta.url)));
 assert.equal(d.defaults.C,1801425);assert.equal(d.defaults.N,1000);assert.deepEqual(initial(),d.central);
 for(const s of r.model.scenarios){const want=JSON.parse(JSON.stringify(calculate(s.overrides)));for(const k of ['costUSD','editionQalys','incomeEquivalent','totalEquivalent','price10','incomePathways'])assert.deepEqual(s[k],want[k]);}
 const c=r.model.scenarios.find(x=>x.id==='central');assert.equal(c.costUSD,1536690);assert.equal(r.model.inputs.find(x=>x.name==='N').value,777);
 assert.deepEqual(r.model.inputs.find(x=>x.name==='C').sourceIds,['finance-2023']);assert.deepEqual(r.model.inputs.find(x=>x.name==='N').sourceIds,['annual']);
 assert.equal(reportPrice(r),10*c.costUSD/(c.editionQalys+c.incomeEquivalent));assert.equal(researchListPrice(r),reportPrice(r));assert.ok(c.incomeEquivalent<0);
 for(const id of r.sessionIds){const s=data.sessions.find(x=>x.id===id);assert.ok(s?.endedAt&&s.model.id==='gpt-6.1-sol');assert.equal(s.organizationId,r.organizationId);}
 assert.ok(!data.sessions.some(x=>x.id==='66275f7a-f687-4ab9-ae70-822b1e087a5b'));
 assert.match(r.priceScope,/policy benefits unknown/);
});
