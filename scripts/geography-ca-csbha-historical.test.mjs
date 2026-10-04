import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const original=JSON.parse(readFileSync(new URL('../data/california/csbha-ca-original-alpha-model.json',import.meta.url))).model;
const frozen=JSON.parse(readFileSync(new URL('../data/california/csbha-ca-pre-recalibration-model.json',import.meta.url))).model;
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-10*Math.max(1,Math.abs(b)),`${a} != ${b}`);
const inputs=Object.fromEntries(original.inputs.filter(i=>typeof i.value==='number').map(i=>[i.name,i.value]));
const q=p=>p.E*p.f/p.k*p.n*p.a*p.b*p.u*p.T/365*p.g_CA/(1+p.d);
test('CSBHA original alpha health reproduces with112days, not112years',()=>{
 assert.equal(original.inputs.find(i=>i.name==='T').unit,'days');
 for(const id of ['central','low','high']){
  const s=original.scenarios.find(s=>s.id===id),p={...inputs};
  for(const m of s.assumptions.matchAll(/(f|k|n|a|b|u|T|g|d)=((?:\d+(?:\.\d+)?|\.\d+))/g))p[m[1]==='g'?'g_CA':m[1]]=Number(m[2]);
  near(q(p),s.editionQalys);
 }
 near(q(inputs),.8528504322383295);near(10*inputs.E/q(inputs),26853571.42857143);
 const s=frozen.scenarios.find(s=>s.id==='historical-alpha-central');near(s.editionQalys,q(inputs));
});
test('annual cost cancels historical price; provider-resource diagnostic was not fullsocietal cost',()=>{
 const double={...inputs,E:2*inputs.E};near(q(double),2*q(inputs));near(10*double.E/q(double),10*inputs.E/q(inputs));
 const episodes=inputs.E*inputs.f/inputs.k*inputs.n*inputs.a*inputs.b;
 const social=original.scenarios.find(s=>s.id==='clinical-resources');
 near(episodes,57.2552);near(social.costUSD,inputs.E+episodes*inputs.z);near(social.editionQalys,q(inputs));
});
test('currentunknown, historicalnumeric, zero, adverse and portfolio are distinct',()=>{
 assert.equal(frozen.scenarios.find(s=>s.id==='central').editionQalys,null);
 assert.equal(frozen.scenarios.find(s=>s.id==='portfolio').editionQalys,null);
 assert.equal(frozen.scenarios.find(s=>s.id==='zero').editionQalys,0);
 assert.ok(original.scenarios.find(s=>s.id==='adverse').editionQalys<0);
 assert.ok(frozen.scenarios.find(s=>s.id==='historical-alpha-central').editionQalys>0);
});
