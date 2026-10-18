import assert from 'node:assert/strict';
import test from 'node:test';
import frozen from '../data/san-francisco/clinic-legacy-pre-recalibration-model.json' with {type:'json'};
import {calculate,expectedValue,inputsFor} from '../lib/clinic-portfolio-model.mjs';
test('Clinic historical34 scenarios and signed weighted outputs remain exact',()=>{
 assert.equal(frozen.scenarios.length,34);
 for(const s of frozen.model.scenarios){const row=frozen.scenarios.find(x=>x.id===s.id);assert(row);assert.deepEqual(calculate(inputsFor(frozen.model,s)),row.result);}
 assert.deepEqual(expectedValue(frozen.model),frozen.expected);
 assert.equal(frozen.expected.donor_bay_per_10q,2002577.5026953523);
 assert.equal(frozen.expected.donor_sf_per_10q,2860825.0038505034);
 for(const s of frozen.model.expected_value.weight_sensitivity){
  const w=frozen.model.expected_value.weights.map((x,i)=>({...x,weight:s.weights[i]}));
  const r=expectedValue(frozen.model,w);assert(Number.isFinite(r.bay_q));
 }
});
test('Clinic old accounting scope and region ledgers are preserved rather than repurposed as marginal quotes',()=>{
 assert.equal(frozen.model.finance.expense_part_ix,1183897);
 assert.equal(frozen.model.finance.event_direct_expenses_outside_part_ix,38265);
 assert.equal(frozen.model.finance.gross_reported_cost,1222162);
 for(const {id,result:r} of frozen.scenarios){const p=inputsFor(frozen.model,frozen.model.scenarios.find(s=>s.id===id));assert.equal(r.bay_q,r.all_q*p.bay_share);assert.equal(r.sf_q,r.all_q*p.sf_share);assert(r.gross_resource_usd>=p.gift_usd);}
});
