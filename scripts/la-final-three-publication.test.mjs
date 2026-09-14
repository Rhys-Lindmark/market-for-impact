import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const data=JSON.parse(readFileSync(new URL('../data/geography-reports.json',import.meta.url)));
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-9*Math.max(1,Math.abs(b)));
const assumptions=[
 ['hunger-action-los-angeles',[[240,.5,.25,.005,.98],[480,.2,.05,.0005,.9],[120,.8,.75,.02,1]]],
 ['illumination-foundation',[[.5,.25,.005,.8],[.2,.05,.0005,.5],[.9,.75,.03,.95]]],
 ['dayle-mcintosh-center',[[.2,5000,.5,.25,.01,.98],[.05,15000,.2,.05,.001,.9],[.4,2000,.8,.75,.05,1]]]
];
for(const [slug,sets] of assumptions)test(slug+' finite first-year component and author provenance',()=>{
 const r=data.reports.find(r=>r.edition==='los-angeles'&&r.slug===slug);
 assert.equal(r.acceptance.status,'accepted');assert.match(r.priceScope,/component/);
 for(const [i,id] of ['central','low','high'].entries()){
  const p=sets[i],s=r.model.scenarios.find(s=>s.id===id);
  let q,g;
  if(slug==='hunger-action-los-angeles'){q=1224579/p[0]*p[1]*p[2]*p[3]/1.03;g=p[4];}
  else if(slug==='illumination-foundation'){q=2329*p[0]*p[1]*p[2]/1.03;g=p[3];}
  else{q=3729186*p[0]/p[1]*p[2]*p[3]*p[4]/1.03;g=p[5];}
  close(q,s.allPopulationQalys);close(q*g,s.editionQalys);
 }
 assert.ok(r.model.scenarios.some(s=>s.editionQalys===0));
 assert.ok(r.model.scenarios.some(s=>s.editionQalys<0));
 assert.ok(r.model.scenarios.some(s=>s.editionQalys===null));
 assert.ok(r.model.scenarios.every(s=>typeof s.assumptions==='string'));
 assert.ok(r.sessionIds.every(id=>data.sessions.some(s=>s.id===id&&s.model.reasoningEffort==='low')));
});
