import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const d=JSON.parse(readFileSync(new URL('../data/geography-reports.json',import.meta.url)));
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
test('NHeLP geography changes health share, not full recipient cost',()=>{
 const reports=d.reports.filter(r=>r.slug==='national-health-law-program');assert.equal(reports.length,2);
 const ca=reports.find(r=>r.edition==='california'),us=reports.find(r=>r.edition==='usa');
 for(const r of reports)for(const s of r.model.scenarios){
  const base=JSON.parse(r.model.scenarios[0].assumptions.match(/^\{.*?\}/)[0]);
  const p=s.assumptions.startsWith('{')?JSON.parse(s.assumptions.match(/^\{.*?\}/)[0]):base;
  if(s.id==='ca-share-low')p.g=.1;if(s.id==='ca-share-high')p.g=.4;
  let A=0;for(let t=p.start;t<p.start+p.T;t++)A+=(1+p.discount)**(-t);
  const Q=p.b*(p.p*p.a*p.N*p.r*p.u*A*p.q-p.h);
  near(Q,s.allPopulationQalys);near(Q*p.g,s.editionQalys);near(p.C*p.Y,s.costUSD);
 }
 near(ca.model.scenarios[0].costUSD,us.model.scenarios[0].costUSD);
 near(ca.model.scenarios[0].allPopulationQalys,us.model.scenarios[0].allPopulationQalys);
 near(ca.model.scenarios[0].editionQalys/us.model.scenarios[0].editionQalys,474/1900);
 const ids=new Set([...ca.sessionIds,...us.sessionIds]);assert.equal(ids.size,3);
 for(const id of ids)assert.equal(d.sessions.filter(s=>s.id===id).length,1);
});
