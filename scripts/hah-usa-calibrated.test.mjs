import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {calculate,defaults,cases,test as ownTests,correctionTest} from '../lib/hah-usa-calibrated-model.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<=1e-12*Math.max(1,Math.abs(b)),`${a} != ${b}`);
test('HAH all38 candidates independently rebuild finite health and household cash before aggregation',()=>{
 assert.equal(Object.keys(cases).length,38);
 for(const[id,o] of Object.entries(cases)){
  const p={...defaults,...o},r=calculate(o);
  const work=Math.min(p.gift/p.annualCash,p.workCapacity);
  const completed=p.aids/p.aidsPerPerson*work*(p.completionWith-p.completionWithout);
  const newly=completed*p.addedCare,otherwise=completed-newly;
  const discount=t=>Math.exp(-Math.log1p(p.discount)*t);
  const utility=cash=>Math.log(1+cash/p.baseline)/2;
  let health=-(newly*p.fittingHarm+otherwise*p.equivalentFittingHarm)*discount(p.delay)*p.geography-p.independentHealthHarm*p.gift/10000;
  let resources=(newly*utility(p.initialCash)+otherwise*utility(p.equivalentCareCash))*discount(p.delay)*p.geography;
  resources+=p.gift/10000*utility(-p.independentCashHarm);
  for(let y=1;y<=3;y++){
   const exposure=(1-p.mortality)**(y-.5)*discount(p.delay+y-.5)*p.geography;
   let h=y<=p.healthYears?newly*p['health'+y]*exposure:0;
   const paid=y<=p.incomeYears?p.workerGain:0;
   const workingNet=p['use'+y]*(paid-p.maintenance);
   if(p.incomeKnown&&y<=p.resourceYears&&y<=p.incomeYears&&workingNet>0) h-=Math.max(h,0)*p.working*p.overlap;
   health+=h;
   if(y<=p.resourceYears) resources+=newly*exposure*(p.working*utility(workingNet)+(1-p.working)*utility(-p['use'+y]*p.maintenance));
  }
  p.healthKnown?near(r.healthYears,health):assert.equal(r.healthYears,null,id);
  p.incomeKnown?near(r.incomeYears,resources):assert.equal(r.incomeYears,null,id);
  if(p.healthKnown&&p.incomeKnown){near(r.combinedYears,health+resources);if(health+resources>0&&p.gift>0)near(r.price10,10*p.gift/(health+resources));else assert.equal(r.price10,null);}
  else assert.equal(r.price10,null,id);
 }
 near(calculate().price10,3067549.367123098);
 near(calculate().incomeYears,-.001749901299722775);
});
test('HAH one annual opportunity, convex probabilities and signed unknown/independent harms are distinct',()=>{
 assert.equal(ownTests(),'assertions passed');assert.equal(correctionTest(),'correction assertions passed');
 assert.equal(calculate({gift:3035220}).workYears,1);
 assert.equal(calculate({workerGain:10,overlap:1}).overlapRemoved,0);
 assert.equal(calculate({incomeKnown:false,overlap:1}).overlapRemoved,0);
 assert.equal(calculate({addedCare:0}).healthYears,0);
 assert.ok(calculate({addedCare:0,equivalentFittingHarm:.002}).healthYears<0);
 assert.ok(calculate({workCapacity:0,independentHealthHarm:.01,independentCashHarm:100}).combinedYears<0);
 for(const o of [null,[],Object.create(null),{workCapacity:1.1},{annualCash:NaN},{completionWith:1.01},{initialCash:-25000}])assert.throws(()=>calculate(o));
});
test('HAH resource horizon/use and earnings do not automatically re-scale clinical utility',()=>{
 const c=calculate();
 near(calculate({resourceYears:0}).healthYears,c.healthYears);
 near(calculate({working:0}).healthYears,c.healthYears);
 near(calculate({use1:0,use2:0,use3:0}).healthYears,c.healthYears);
 assert.notEqual(calculate({healthYears:1}).healthYears,c.healthYears);
 near(calculate({healthYears:1}).incomeYears,c.incomeYears);
 assert.throws(()=>calculate({clinicalZero:0}));
});
test('HAH author clock receipts preserve361.722seconds without inventing a runtime model',()=>{
 const d=JSON.parse(readFileSync(new URL('../docs/geography-discovery/hah-usa-recalibration-2026-10-02.closed.json',import.meta.url)));
 near(d.sessions.reduce((sum,s)=>sum+(Date.parse(s.endedAt)-Date.parse(s.startedAt))/1000,0),361.722);
 assert.equal(new Set(d.sessions.map(s=>s.id)).size,3);
 for(const s of d.sessions)assert.equal(s.model,null);
 assert.equal(d.userAssignedModel,'GPT-6.1 Sol');
});
