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
test('time comes from timestamps and is not rounded up',()=>{
 const r=researchEffortSummary(validateResearchEffort(data()),'Example');assert.equal(r.minutes,20.05);assert.equal(r.label,'Research time: 20 min on Fixture model');
});
test('parallel workers sum separately and partial history remains disclosed',()=>{
 const d=data([session,{...session,id:'two',workerId:'auditor',model:null}],'partial');validateResearchEffort(d);
 const r=researchEffortSummary(d,'Example');assert.equal(r.minutes,40.1);assert.match(r.label,/unrecorded AI model/);
 assert.match(r.label,/40.1\+ min/);assert.deepEqual(r.bullets,['Research — reviewed programs, finances and impact evidence.']);assert.doesNotMatch(r.label,/partial record/);
});
test('historical estimates use a frozen report average and never invent session timestamps',()=>{
 const registry=JSON.parse(fs.readFileSync('data/research-effort.json','utf8'));
 const h=JSON.parse(fs.readFileSync('data/research-effort-historical-estimates.json','utf8'));
 assert.equal(h.samples.length,13);assert.equal(new Set(h.organizations).size,80);
 assert.equal(h.minutes,h.samples.reduce((sum,s)=>sum+s.minutes,0)/h.samples.length);
 const estimated=researchEffortSummary(registry,'GLIDE Foundation',h);
 assert.equal(estimated.recorded,false);assert.equal(estimated.estimated,true);
 assert.equal(estimated.label,'Research time: ~18 min on GPT-5.6 Sol Medium');
 assert.match(estimated.bullets.at(-1),/AI model assumed/);
 const future=researchEffortSummary(registry,'Future organization',h);assert.equal(future.minutes,null);assert.equal(future.estimated,false);
 const recorded=researchEffortSummary(registry,'Marin Treatment Center',h);assert.equal(recorded.recorded,true);assert.equal(recorded.estimated,false);assert.equal(recorded.label,'Research time: 37+ min on GPT-5.6 Sol Medium');
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
