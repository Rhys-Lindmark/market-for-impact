import assert from 'node:assert/strict';
import * as m from '../lib/melp-model.mjs';
import * as r from '../lib/recares-model.mjs';
import {compare,replacement,categoryPairs,positiveScenarioNames} from '../lib/device-clinical-comparison.mjs';
const before=JSON.stringify([m.inputs,m.scenarios,r.inputs,r.scenarios]);
for(const [target,source,pairs]of [[m,r,categoryPairs],[r,m,categoryPairs.map(([a,b])=>[b,a])]]){
 for(const names of [['central'],positiveScenarioNames]){
  const x=replacement(target.scenarios,source.scenarios,pairs,names);
  assert.equal(x.maps.length,names.length*3);
  x.scenarios.forEach((s,i)=>{
   const old=target.scenarios[i];assert.deepEqual({...s,mix:null},{...old,mix:null});
   s.mix.forEach((d,j)=>{const od=old.mix[j];assert.deepEqual({...d,utility:null,years:null},{...od,utility:null,years:null});if(!names.includes(s.name)||!pairs.some(p=>p[0]===d.name))assert.deepEqual(d,od);});
  });
 }
}
const out=compare();assert.equal(out.diagnostics.length,4);
assert.ok(Math.abs(out.diagnostics[0].centralBayPrice-572533.2036816214)<1e-7);
assert.ok(Math.abs(out.diagnostics[0].weightedBayPrice-2117235.508209762)<1e-7);
assert.equal(out.diagnostics[0].centralBayPrice,out.diagnostics[1].centralBayPrice);
assert.equal(out.diagnostics[2].centralBayPrice,out.diagnostics[3].centralBayPrice);
assert.equal(JSON.stringify([m.inputs,m.scenarios,r.inputs,r.scenarios]),before);
// console.log(JSON.stringify({status:'PASS',checks:['only utility/years replaced','three matched categories','null/harm unchanged','pediatric unchanged','costs/mix/weights/geography unchanged','base objects unmodified','central diagnostic independently anchored'],results:out},null,2));
