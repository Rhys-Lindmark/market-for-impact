import assert from 'node:assert/strict';
import {calculate,cases} from './model.mjs';
const central=calculate();
assert.equal(central.union,105.12);
assert.equal(calculate({resourceYears:0}).jointGain,0);
assert(calculate({resourceYears:0}).incomeEquivalent<0);
assert.equal(calculate({utility:0}).incomeEquivalent,central.incomeEquivalent);
assert.equal(calculate({response:0}).totalEquivalent,0);
assert.equal(calculate({workGain:-200,positiveOverlap:0}).jointGain,-200);
assert.equal(calculate({moveGain:-800,depositGain:-300,workGain:-200,positiveOverlap:0}).jointGain,-1300);
assert.equal(calculate({moveGain:-800,depositGain:-300,workGain:-200,positiveOverlap:1}).jointGain,-1300);
assert.throws(()=>calculate({discount:-1}));
assert.throws(()=>calculate({harmPerHousehold:-1}));
for(const c of cases){if(c.overrides===null)continue;const r=calculate(c.overrides);assert(Number.isFinite(r.totalEquivalent));assert.equal(r.incomeEquivalentYears,r.incomeEquivalent);assert.equal(r.costPer10Qalys,r.price10);assert(r.clinicalPeople<=r.union);}
assert.throws(()=>calculate({landlordIncidence:1.1}));
console.log('PASS: '+cases.filter(c=>c.overrides!==null).length+' numerical cases plus unknown control and signed/duration/union guards');
