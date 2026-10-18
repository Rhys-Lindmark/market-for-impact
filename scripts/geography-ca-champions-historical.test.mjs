import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const model=JSON.parse(readFileSync(new URL('../data/california/champions-ca-pre-recalibration-model.json',import.meta.url)));
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-10*Math.max(1,Math.abs(b)),`${a} != ${b}`);
const yieldQ=i=>i.C*i.f/i.k*i.a*i.b*i.u*i.T*i.g_CA/(1+i.d);
test('Champions historical finite health bridge reproduces original central and joint scenarios',()=>{
 const i=Object.fromEntries(model.inputs.filter(i=>typeof i.value==='number').map(i=>[i.name,i.value]));
 const s=model.scenarios.find(s=>s.id==='historical-alpha-central');
 near(yieldQ(i),s.editionQalys);near(10*i.C/yieldQ(i),32960000);
 for(const id of ['low','high']){
  const s=model.scenarios.find(s=>s.id===id),overrides={...i};
  for(const match of s.assumptions.matchAll(/(f|k|a|b|u|T|g_CA|d)=((?:\d+(?:\.\d+)?|\.\d+))/g))overrides[match[1]]=Number(match[2]);
  near(yieldQ(overrides),s.editionQalys);
 }
});
test('Historical withdrawal, omitted portfolio, zero and harm are distinct and preserved',()=>{
 assert.equal(model.scenarios.find(s=>s.id==='central').editionQalys,null);
 assert.equal(model.scenarios.find(s=>s.id==='portfolio').editionQalys,null);
 assert.equal(model.scenarios.find(s=>s.id==='zero').editionQalys,0);
 assert.equal(model.scenarios.find(s=>s.id==='harm').editionQalys,-1);
 assert.equal(model.version,'ca-champions-beta-withdrawn-v3');
});
test('Historical budget cancels its price: modeled output is not an observed care yield',()=>{
 const i=Object.fromEntries(model.inputs.filter(i=>typeof i.value==='number').map(i=>[i.name,i.value]));
 const doubled={...i,C:i.C*2};near(yieldQ(doubled),yieldQ(i)*2);
 near(10*doubled.C/yieldQ(doubled),10*i.C/yieldQ(i));
 assert.equal(i.C,1963721+99031+315966);
});
