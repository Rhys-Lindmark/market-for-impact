import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const frozen=JSON.parse(fs.readFileSync(new URL('../data/usa/remote-area-medical-usa-pre-recalibration-model.json',import.meta.url),'utf8'));
const close=(a,b)=>assert.ok(Math.abs(a-b)<=1e-11*Math.max(1,Math.abs(a),Math.abs(b)),`${a} != ${b}`);
// Independently reconstruct the historical annual-scale vision diagnostics.
function original(overrides={}){
 const p={G:10000,C:10522622,N:7999,b:.5,f:.6,s:.5,u:.04,p:.8,T:3,m:.01,h:.0002,g:1,other:0,...overrides};
 let D=0;for(let t=1;t<=p.T;t++)D+=((1-p.m)/1.03)**t;
 const health=p.N*(p.f*p.s*p.u*p.p*D-p.h)+p.other;
 return {all:p.G/p.C*p.b*health,usa:p.g*p.G/p.C*p.b*health};
}
test('RAM frozen withdrawal and all ten historical diagnostic cases reproduce',()=>{
 assert.equal(frozen.edition,'usa');assert.equal(frozen.slug,'remote-area-medical');
 const cases={
  'alpha-reproduced':{g:.75},'location-corrected-vision':{},
  'recorded-resource':{C:19852655},
  'low-clinical-yield':{f:.3,s:.25,u:.02,p:.6,T:1,m:.02,h:.0005},
  'other-pathways-75-net':{other:75},'other-pathways-300-net':{other:300},
  'no-new-throughput':{b:0},'identical-replacement':{s:0,h:0},
  'duplicative-extra-care':{s:0},
  'favorable-vision':{b:1,f:.9,s:.8,u:.08,p:.9,T:4,m:.005,h:.0001}
 };
 assert.equal(frozen.model.scenarios.length,11);
 const central=frozen.model.scenarios.find(s=>s.id==='central');
 assert.equal(central.editionQalys,null);assert.equal(central.allPopulationQalys,null);
 for(const [id,p] of Object.entries(cases)){
  const s=frozen.model.scenarios.find(s=>s.id===id),v=original(p);assert.ok(s,id);
  close(s.costUSD,10000);close(s.allPopulationQalys,v.all);close(s.editionQalys,v.usa);
 }
 assert.ok(original({s:0}).usa<0);
 close(original({s:0,h:0}).usa,0);
});
