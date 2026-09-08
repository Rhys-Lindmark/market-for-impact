import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const d=JSON.parse(readFileSync(new URL('../data/san-francisco/large-bay-v1.json',import.meta.url)));
test('large Bay shortlist preserves audited expense semantics and descending selected order',()=>{
assert.equal(d.rows.length,5);assert.equal(d.periodEnd,'2025-06-30');assert.match(d.selection,/not an exhaustive/);assert.equal(d.amountSemantics,'audited whole-entity annual expenses');
assert.deepEqual(d.rows.map(r=>r.expenses),[261211852,170982609,157389300,136772481,117874257]);
assert.deepEqual(d.rows.map(r=>r.foodExpense),[179510457,115551129,128642363,90760157,null]);
for(const r of d.rows){assert.match(r.url,/^https:.*\.pdf$/);assert.ok(r.foodExpense===null||r.foodExpense<r.expenses);assert.ok(!('centralUsdPerTenQalys'in r));}
});
