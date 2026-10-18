import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const d=JSON.parse(readFileSync(new URL('../data/geography-reports.json',import.meta.url)));
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
test('NHeLP geography changes health share, not full recipient cost',()=>{
 const reports=d.reports.filter(r=>r.slug==='national-health-law-program');assert.equal(reports.length,2);
 const ca=reports.find(r=>r.edition==='california'),us=reports.find(r=>r.edition==='usa');
 // California NHeLP was revised on purpose (6225ad7, 2026-10-07): its first scenarios are the new model, and the original
 // ones were kept as alpha-central-diagnostic / initial-* (ca-share-low -> initial-ca-share-low). USA gained
 // combined-income-unknown and oregon-* scenarios with prose assumptions.
 const original=r=>r.model.scenarios.filter(s=>r.edition==='usa'?!/^(combined-income-unknown|oregon-)/.test(s.id):s.id==='alpha-central-diagnostic'||s.id.startsWith('initial-'));
 const baseOf=r=>r.edition==='usa'?r.model.scenarios[0]:r.model.scenarios.find(s=>s.id==='alpha-central-diagnostic');
 for(const r of reports)for(const s of original(r)){
  const base=JSON.parse(baseOf(r).assumptions.match(/^\{.*?\}/)[0]);
  const p=s.assumptions.startsWith('{')?JSON.parse(s.assumptions.match(/^\{.*?\}/)[0]):base;
  if(/^(initial-)?ca-share-low$/.test(s.id))p.g=.1;if(/^(initial-)?ca-share-high$/.test(s.id))p.g=.4;
  let A=0;for(let t=p.start;t<p.start+p.T;t++)A+=(1+p.discount)**(-t);
  const Q=p.b*(p.p*p.a*p.N*p.r*p.u*A*p.q-p.h);
  near(Q,s.allPopulationQalys);near(Q*p.g,s.editionQalys);near(p.C*p.Y,s.costUSD);
 }
 const diag=baseOf(ca);
 near(diag.costUSD,us.model.scenarios[0].costUSD);
 near(diag.allPopulationQalys,us.model.scenarios[0].allPopulationQalys);
 near(diag.editionQalys/us.model.scenarios[0].editionQalys,474/1900);
 const ids=new Set([...ca.sessionIds,...us.sessionIds]);assert.ok(ids.size>=3);
 for(const id of ids)assert.equal(d.sessions.filter(s=>s.id===id).length,1);
});
