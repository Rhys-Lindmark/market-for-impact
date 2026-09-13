import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read = p => JSON.parse(readFileSync(new URL('../docs/'+p, import.meta.url)));
const p=read('geography-progress.json'), b=read('geography-boundaries.json');
assert.equal(p.editions.length,11);
assert.equal(new Set(p.editions.map(e=>e.id)).size,11);
assert.equal(p.models.discovery.effort,'medium'); assert.equal(p.models.alpha.effort,'low'); assert.equal(p.models.beta.effort,'medium');
for(const e of p.editions){
 assert.ok(e.boundaryVersion);
 const stages=[['acceptedDiscoveryIds','discoveryAccepted',100],['alphaCohortIds','alphaPublished',25],['betaIds','betaAcceptedPublished',10],['topPickIds','topPicksPublished',4]];
 let previous;
 for(const [ids,counter,max] of stages){
  assert.equal(e[ids].length,e[counter]); assert.equal(new Set(e[ids]).size,e[ids].length);
  assert.ok(e[counter]>=0&&e[counter]<=max);
  if(previous)for(const id of e[ids])assert.ok(previous.includes(id));
  previous=e[ids];
 }
}
assert.equal(b.metros.length,9); assert.equal(b.metros.reduce((s,m)=>s+m.counties.length,0),102);
for(const m of b.metros){
 assert.equal(m.countyCount,m.counties.length); assert.equal(new Set(m.counties.map(c=>c.fips)).size,m.countyCount);
 assert.ok(m.counties.every(c=>/^\d{5}$/.test(c.fips)));
 assert.ok(p.editions.some(e=>e.id===m.id&&e.boundaryVersion===m.boundaryVersion));
}
for(const edition of ['california','usa']){
 const seed=read('geography-discovery/'+edition+'-seed.json');
 assert.equal(seed.candidates.length,20); assert.equal(new Set(seed.candidates.map(c=>c.name)).size,20);
 assert.equal(seed.model.id,'gpt-6-astra'); assert.equal(seed.model.reasoning,'medium');
 assert.equal(p.editions.find(e=>e.id===edition).discoveryProvisional,20);
}
console.log('PASS:11 editions; stage models and nested counts;9 MSAs/102 counties;40 provisional seeds.');

