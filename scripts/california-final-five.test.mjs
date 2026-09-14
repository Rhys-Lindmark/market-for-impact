import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const d=JSON.parse(readFileSync(new URL('../data/geography-reports.json',import.meta.url)));
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-9*Math.max(1,Math.abs(b)),a+' != '+b);
const A=Array.from({length:10},(_,i)=>1/1.03**(i+3)).reduce((a,b)=>a+b,0);
const cases=[
 ['community-water-center',2*158*3*.1*.25*.25*.005/1.03],
 ['california-pan-ethnic-health-network',4984085*.3/224000*100*.1*.25*.02/1.03],
 ['california-dental-association-foundation',3438139*.2/1000*.5*.25*(.8*.04*(1-1.03**(-.25))/Math.log(1.03)-.0005)*.98],
 ['essential-access-health',46675922*.05/100*.25*(121/931-92/929)*.5*.01/1.03*.98],
 ['california-yimby-education-fund',1000*.1*.1*.25*A*.01]
];
for(const [slug,q] of cases)test(slug+' accepted California partial-health alpha',()=>{
 const r=d.reports.find(x=>x.edition==='california'&&x.slug===slug);
 assert.equal(r.stage,'alpha');assert.equal(r.acceptance.status,'accepted');
 close(r.model.scenarios.find(s=>s.id==='central').editionQalys,q);
 assert.ok(r.model.scenarios.some(s=>s.editionQalys===0));
 assert.ok(r.model.scenarios.some(s=>s.editionQalys<0));
 assert.ok(r.model.scenarios.some(s=>s.editionQalys===null));
 assert.equal(r.summary.reservations.length,3);assert.equal(r.summary.strengths.length,3);
 assert.ok(r.priceScope.includes('partial'));
 const ids=new Set(r.sources.map(s=>s.id));
 for(const input of r.model.inputs)for(const id of input.sourceIds)assert.ok(ids.has(id),id);
 for(const id of r.sessionIds){
  const s=d.sessions.find(x=>x.id===id);assert.ok(s,id);
  assert.equal(s.organizationId,r.organizationId);assert.equal(s.model.reasoningEffort,'low');
  assert.ok(Date.parse(s.endedAt)>Date.parse(s.startedAt));
 }
});
test('CDA burden stress and YIMBY noncomparable historical accounts preserved',()=>{
 const c=d.reports.find(r=>r.slug==='california-dental-association-foundation');
 const n=3438139*.2/1000;
 close(c.model.scenarios.find(s=>s.id==='unoffset-treatment-harm').editionQalys,n*.25*(.5*.8*.04*(1-1.03**(-.25))/Math.log(1.03)-.0005)*.98);
 assert.equal(c.sessionIds.length,1);
 const y=d.reports.find(r=>r.slug==='california-yimby-education-fund');
 assert.deepEqual(y.annualExpenses.map(x=>x.comparable),[false,false,true]);
});
