import budget from '../docs/geography-execution-budget.json' with {type:'json'};
export const activeEditionIds=budget.activeEditionIds;
export const deferredEditionIds=budget.deferredEditionIds;
export const activeEditions=progress=>progress.editions.filter(e=>activeEditionIds.includes(e.id));
// Coverage triage, not scientific acceptance or evidence that economic effects are zero.
export function incomeAssessmentBacklog(data,edition){
 return data.reports.filter(r=>r.edition===edition && !r.model.incomeBridge &&
  !r.model.scenarios.some(s=>s.id==='central' && (s.incomeBridge || s.incomePathways)));
}
export function remainingResearchMinutes(edition){
 const initial=Math.max(0,budget.targetCounts.initial-edition.alphaPublished);
 const deep=Math.max(0,budget.targetCounts.deep-edition.betaAcceptedPublished);
 return {initialRemaining:initial,deepRemaining:deep,initialMinutes:initial*budget.stageBudgetsMinutes.initialPerReport,deepMinutes:deep*budget.stageBudgetsMinutes.deepPerReport,total:initial*budget.stageBudgetsMinutes.initialPerReport+deep*budget.stageBudgetsMinutes.deepPerReport};
}
// A session referenced by two editions remains one actual interval, not new research twice.
export function recordedEditionResearch(data,edition){
 const ids=new Set(data.reports.filter(r=>r.edition===edition).flatMap(r=>r.sessionIds));
 const result={initialMinutes:0,deepMinutes:0,missingSessions:0,sharedSessionIds:[],models:{}};
 for(const id of ids){const s=data.sessions.find(s=>s.id===id);
  if(!s||!s.startedAt||!s.endedAt||!Number.isFinite(Date.parse(s.startedAt))||!Number.isFinite(Date.parse(s.endedAt))||Date.parse(s.endedAt)<=Date.parse(s.startedAt)){result.missingSessions++;continue;}
  if(!['research','modeling','source-audit'].includes(s.phase))continue;
  const minutes=(Date.parse(s.endedAt)-Date.parse(s.startedAt))/60000;
  if(s.stage==='alpha')result.initialMinutes+=minutes;else if(s.stage==='beta')result.deepMinutes+=minutes;
  const model=s.model?.name??'Identity unavailable';result.models[model]=(result.models[model]??0)+minutes;
  const editions=new Set(data.reports.filter(r=>r.sessionIds.includes(id)).map(r=>r.edition));if(editions.size>1)result.sharedSessionIds.push(id);
 }
 return result;
}
