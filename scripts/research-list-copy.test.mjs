import test from 'node:test';
import assert from 'node:assert/strict';
import {researchListDescription as clean} from '../lib/research-list-copy.mjs';
test('research-list scope wording is concise without changing source',()=>{
 assert.equal(clean('Whole-gift medical equipment and supply reuse'),'Medical equipment and supply reuse');
 assert.equal(clean('Conditional whole-gift opioid treatment access'),'Conditional opioid treatment access');
 assert.equal(clean('Housing-health component; whole-gift cost, food health unquantified'),'Housing-health component; food health unquantified');
 assert.equal(clean('Whole-organization behavioral health'),'Behavioral health');
 assert.equal(clean('Rental assistance'),'Rental assistance');
});
