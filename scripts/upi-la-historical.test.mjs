import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const frozen=JSON.parse(fs.readFileSync(new URL('../data/los-angeles/upi-la-pre-recalibration-model.json',import.meta.url)));
const close=(a,b)=>assert.ok(Math.abs(a-b)<=1e-10*Math.max(1,Math.abs(b)),`${a} versus ${b}`);
function parameters(row){const end=row.assumptions.indexOf('}.');return JSON.parse(row.assumptions.slice(0,end+1));}
function calculate(p){
  const A=(T)=>{let sum=0;for(let t=1;t<=T;t++)sum+=((1-p.m)/(1+p.d))**t;return sum;};
  let exposure=0;for(let t=0;t<Math.ceil(p.D);t++)exposure+=Math.min(1,p.D-t)*((1-p.m)*p.rho/(1+p.d))**t;
  const events=p.N*p.r*p.e*p.a*p.b*exposure;
  const benefit=events*(p.f*p.u*A(p.T)+(1-p.f)*(p.qa+p.du*A(p.Tn)));
  return {events,all:benefit-p.H,local:benefit*p.g-p.H};
}
test('all 22 frozen UPI scenarios reproduce the historical finite event model',()=>{
  assert.equal(frozen.model.scenarios.length,22);
  for(const row of frozen.model.scenarios){const p=parameters(row),out=calculate(p);close(out.all,row.allPopulationQalys);close(out.local,row.editionQalys);assert.equal(p.C,row.costUSD);}
});
test('historical central event count and price remain independently reproducible',()=>{
  const p=parameters(frozen.model.scenarios.find(x=>x.id==='central')),out=calculate(p);
  close(out.events,1.5405);close(out.local,5.7742936466569965);close(10*p.C/out.local,15409129.747239774);
});
