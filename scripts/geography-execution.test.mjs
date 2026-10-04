import test from 'node:test';
import assert from 'node:assert/strict';
import progress from '../docs/geography-progress.json' with {type:'json'};
import reports from '../data/geography-reports.json' with {type:'json'};
import budget from '../docs/geography-execution-budget.json' with {type:'json'};
import {activeEditions,remainingResearchMinutes,recordedEditionResearch} from '../lib/geography-execution.mjs';
test('Latest user scope retains seven active editions and archives four without deleting data',()=>{
 const active=activeEditions(progress);assert.equal(active.length,7);assert.deepEqual(active.map(e=>e.id),budget.activeEditionIds);
 for(const id of budget.deferredEditionIds)assert.ok(progress.editions.some(e=>e.id===id));
 assert.equal(budget.plannedFullEditionResearchMinutes,60+5*25+15*10);
 const remaining=active.map(remainingResearchMinutes);assert.equal(remaining.reduce((sum,r)=>sum+r.initialRemaining,0),57);assert.equal(remaining.reduce((sum,r)=>sum+r.deepRemaining,0),43);assert.equal(remaining.reduce((sum,r)=>sum+r.total,0),930);
});
test('Recorded stage minutes deduplicate sessions and do not manufacture historical time',()=>{
 for(const e of activeEditions(progress)){const t=recordedEditionResearch(reports,e.id);assert.ok(t.initialMinutes>=0&&t.deepMinutes>=0);}
 const sample={reports:[{edition:'x',sessionIds:['s','s','missing']},{edition:'x',sessionIds:['s']},{edition:'y',sessionIds:['s']}],sessions:[{id:'s',phase:'research',stage:'alpha',startedAt:'2026-10-04T01:00:00Z',endedAt:'2026-10-04T01:05:00Z',model:{name:'GPT-6.1 Sol'}}]};
 const t=recordedEditionResearch(sample,'x');assert.equal(t.initialMinutes,5);assert.equal(t.deepMinutes,0);assert.equal(t.missingSessions,1);assert.deepEqual(t.sharedSessionIds,['s']);
});
