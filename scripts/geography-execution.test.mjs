import test from 'node:test';
import assert from 'node:assert/strict';
import progress from '../docs/geography-progress.json' with {type:'json'};
import reports from '../data/geography-reports.json' with {type:'json'};
import budget from '../docs/geography-execution-budget.json' with {type:'json'};
import {activeEditions,remainingResearchMinutes,recordedEditionResearch,incomeAssessmentBacklog,documentedUnknownIncomeAssessments} from '../lib/geography-execution.mjs';
test('Latest user scope retains seven active editions and archives four without deleting data',()=>{
 const active=activeEditions(progress);assert.equal(active.length,7);assert.deepEqual(active.map(e=>e.id),budget.activeEditionIds);
 for(const id of budget.deferredEditionIds)assert.ok(progress.editions.some(e=>e.id===id));
 assert.equal(budget.plannedFullEditionResearchMinutes,60+5*25+15*10);
 const remaining=active.map(remainingResearchMinutes);
 const expectedInitial=active.reduce((n,e)=>n+Math.max(0,25-e.alphaPublished),0);
 const expectedDeep=active.reduce((n,e)=>n+Math.max(0,10-e.betaAcceptedPublished),0);
 assert.equal(remaining.reduce((sum,r)=>sum+r.initialRemaining,0),expectedInitial);
 assert.equal(remaining.reduce((sum,r)=>sum+r.deepRemaining,0),expectedDeep);
 assert.equal(remaining.reduce((sum,r)=>sum+r.total,0),5*expectedInitial+15*expectedDeep);
 assert.deepEqual(remainingResearchMinutes({alphaPublished:14,betaAcceptedPublished:1}),{initialRemaining:11,deepRemaining:9,initialMinutes:55,deepMinutes:135,total:190});
});
test('Recorded stage minutes deduplicate sessions and do not manufacture historical time',()=>{
 for(const e of activeEditions(progress)){const t=recordedEditionResearch(reports,e.id);assert.ok(t.initialMinutes>=0&&t.deepMinutes>=0);}
 const sample={reports:[{edition:'x',sessionIds:['s','s','missing']},{edition:'x',sessionIds:['s']},{edition:'y',sessionIds:['s']}],sessions:[{id:'s',phase:'research',stage:'alpha',startedAt:'2026-10-04T01:00:00Z',endedAt:'2026-10-04T01:05:00Z',model:{name:'GPT-6.1 Sol'}}]};
 const t=recordedEditionResearch(sample,'x');assert.equal(t.initialMinutes,5);assert.equal(t.deepMinutes,0);assert.equal(t.missingSessions,1);assert.deepEqual(t.sharedSessionIds,['s']);
});
test('Economic-coverage triage cannot mistake published counts or health outputs for signed assessment',()=>{
 const report=(model)=>({edition:'x',model});
 const sample={reports:[report({scenarios:[{id:'central',editionQalys:10}]}),report({scenarios:[{id:'central',incomePathways:[]}]}),report({incomeBridge:{},scenarios:[]}),report({scenarios:[{id:'low',incomePathways:[]},{id:'central'}]})]};
 assert.equal(incomeAssessmentBacklog(sample,'x').length,2);
 assert.equal(incomeAssessmentBacklog(sample,'y').length,0);
 const pending=activeEditions(progress).flatMap(e=>incomeAssessmentBacklog(reports,e.id));
 assert.ok(pending.every(r=>r.stage==='alpha'),'Current deep reports have structured resource assessment');
 // Counts shrink only as report models actually acquire coverage; fixtures do not freeze69 forever.
 assert.ok(pending.length<=69);
});
test('Unknown dispositions require reviewed evidence and remain visibly distinct from numerical valuation',()=>{
 const r={edition:'x',sources:[{id:'s'}],acceptance:{status:'accepted',evidence:'docs/a.md'},model:{scenarios:[{id:'central'}],incomeAssessment:{status:'assessed-unknown',acceptance:'independently-reviewed',evidence:'docs/a.md',sourceIds:['s']}}};
 assert.equal(documentedUnknownIncomeAssessments({reports:[r]},'x').length,1);
 assert.equal(incomeAssessmentBacklog({reports:[r]},'x').length,0);
 const bad=structuredClone(r);bad.model.incomeAssessment.sourceIds=['missing'];
 assert.equal(incomeAssessmentBacklog({reports:[bad]},'x').length,1);
 const unreviewed=structuredClone(r);delete unreviewed.acceptance;
 assert.equal(incomeAssessmentBacklog({reports:[unreviewed]},'x').length,1);
});
