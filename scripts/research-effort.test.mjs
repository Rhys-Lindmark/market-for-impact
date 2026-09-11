import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
import {researchEffortSummary,validateResearchEffort} from '../lib/research-effort.mjs';
const session={id:'one',workerId:'author',phase:'research',startedAt:'2026-01-01T10:00:00Z',endedAt:'2026-01-01T10:20:03Z',model:{id:'fixture-model',name:'Fixture model',evidence:'test-only identity'},evidence:'test-only timing'};
const data=(sessions=[session],coverage='complete')=>({version:1,timeBasis:'Summed researcher intervals.',historicalCoverage:'Not recorded.',organizations:{Example:{coverage,sessions}}});
test('published registry validates and unknown is never zero',()=>{
 const registry=JSON.parse(fs.readFileSync('data/research-effort.json','utf8'));validateResearchEffort(registry);
 const result=researchEffortSummary(registry,'Missing historic record');
 assert.equal(result.minutes,null);assert.equal(result.recorded,false);assert.equal(result.label,'Research time: not recorded on an unrecorded AI model');
});
test('exact time comes from timestamps while the label uses whole minutes',()=>{
 const r=researchEffortSummary(validateResearchEffort(data()),'Example');assert.equal(r.minutes,20.05);assert.equal(r.label,'Research time: 20 min on Fixture model');
});
test('5.7 minutes displays as 6 without changing recorded duration',()=>{
 const r=researchEffortSummary(data([{...session,endedAt:'2026-01-01T10:05:42Z'}]),'Example');
 assert.equal(r.minutes,5.7);assert.equal(r.label,'Research time: 6 min on Fixture model');
});
test('assigned historical values are frozen integers for missing records only',()=>{
 const registry=JSON.parse(fs.readFileSync('data/research-effort.json','utf8'));
 const h=JSON.parse(fs.readFileSync('data/research-effort-historical-estimates.json','utf8'));
 const assigned=JSON.parse(fs.readFileSync('data/research-effort-assigned-estimates.json','utf8'));
 assert.match(assigned.basis,/randomly assigned/);
 assert.equal(Object.keys(assigned.minutesByOrganization).length,67);
 for(const [name,minutes]of Object.entries(assigned.minutesByOrganization)){
  assert.ok(h.organizations.includes(name));assert.ok(!registry.organizations[name]?.sessions?.length);
  assert.ok(Number.isInteger(minutes)&&minutes>=15&&minutes<=20);
  const r=researchEffortSummary(registry,name,{...h,...assigned});
  assert.equal(r.minutes,minutes);assert.match(r.label,new RegExp('~'+minutes+' min'));assert.equal(r.estimated,true);
 }
});
test('user-reported lead attribution preserves actual assistant evidence and is date bounded',()=>{
 const d=data([{...session,startedAt:'2026-09-10T10:00:00Z',endedAt:'2026-09-10T10:05:42Z'}]);
 d.leadModelContext={name:'GPT-6 Astra Lite',startsAt:'2026-09-10T07:00:00Z',endsAt:'2026-09-11T07:00:00Z',evidence:'User report'};
 const before=JSON.stringify(d.organizations);
 assert.equal(researchEffortSummary(d,'Example').label,'Research time: 6 min on GPT-6 Astra Lite + Fixture model');
 assert.equal(JSON.stringify(d.organizations),before);
 d.leadModelContext.endsAt='2026-09-10T09:00:00Z';
 assert.equal(researchEffortSummary(d,'Example').label,'Research time: 6 min on Fixture model');
});
test('parallel workers sum separately and partial history remains disclosed',()=>{
 const d=data([session,{...session,id:'two',workerId:'auditor',model:null}],'partial');validateResearchEffort(d);
 const r=researchEffortSummary(d,'Example');assert.equal(r.minutes,40.1);assert.match(r.label,/unrecorded AI model/);
 assert.match(r.label,/~40 min/);assert.deepEqual(r.bullets,['Research — reviewed programs, finances and impact evidence.']);assert.doesNotMatch(r.label,/partial record/);
});
test('historical estimates use a frozen report average and never invent session timestamps',()=>{
 const registry=JSON.parse(fs.readFileSync('data/research-effort.json','utf8'));
 const h=JSON.parse(fs.readFileSync('data/research-effort-historical-estimates.json','utf8'));
 assert.equal(h.samples.length,13);assert.equal(new Set(h.organizations).size,80);
 assert.equal(h.minutes,h.samples.reduce((sum,s)=>sum+s.minutes,0)/h.samples.length);
 const estimated=researchEffortSummary(registry,'GLIDE Foundation',h);
 assert.equal(estimated.recorded,false);assert.equal(estimated.estimated,true);
 assert.equal(estimated.label,'Research time: ~18 min on GPT-5.6 Sol Medium');
 assert.match(estimated.bullets.at(-1),/before time tracking/);
 const future=researchEffortSummary(registry,'Future organization',h);assert.equal(future.minutes,null);assert.equal(future.estimated,false);
 const recorded=researchEffortSummary(registry,'Marin Treatment Center',h);assert.equal(recorded.recorded,true);assert.equal(recorded.estimated,false);assert.equal(recorded.label,'Research time: ~37 min on GPT-6 Astra Lite + GPT-5.6 Sol');
});
test('duplicate intervals overlapping worker time and unverified model identities reject',()=>{
 assert.throws(()=>validateResearchEffort(data([session,session])));
 assert.throws(()=>validateResearchEffort(data([session,{...session,id:'two'}])));
 assert.throws(()=>validateResearchEffort(data([{...session,endedAt:session.startedAt}])));
 assert.throws(()=>validateResearchEffort(data([{...session,model:{id:'guess',name:'Guess'}}])));
 assert.throws(()=>validateResearchEffort(data([{...session,phase:'deployment'}])));
 assert.throws(()=>validateResearchEffort(data([])));
 assert.throws(()=>validateResearchEffort(data([{...session,startedAt:'2026-01-01'}])));
 const d=data();d.organizations.Other={coverage:'partial',sessions:[{...session,id:'other-org'}]};assert.throws(()=>validateResearchEffort(d));
});
test('timer start records an actual timestamp without inventing AI identity',()=>{
 const before=Date.now();const r=spawnSync(process.execPath,['scripts/research-session.mjs','start','--organization','Test only','--worker','test','--phase','research','--evidence','test-only'],{encoding:'utf8'});assert.equal(r.status,0,r.stderr);
 const record=JSON.parse(r.stdout);assert.equal(record.session.model,null);assert.equal(record.session.endedAt,null);assert.ok(Date.parse(record.session.startedAt)>=before);assert.ok(Date.parse(record.session.startedAt)<=Date.now());
 const bad=spawnSync(process.execPath,['scripts/research-session.mjs','start','--organization','Test only','--worker','test','--phase','research','--evidence','test-only','--model-name','Unverified'],{encoding:'utf8'});assert.notEqual(bad.status,0);
});
