import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {sameData} from './same-data.mjs';

// Durable replacements for "everything before this release is unchanged" checks.
// The old form compared the current registry to a git snapshot taken when a report was
// added (report-by-report, session-prefix and exact counts). Reports are revised on purpose
// all the time (NHeLP, the LA/NYC/USA rebuilds, alpha->beta promotions), so those checks
// failed on every later release without finding any bug. What must stay true is that
// history is never lost: no report disappears, and every research session and measured
// effort record that existed then still exists, unchanged. Revised reports keep their keys.

export const gitJson=(commit,file)=>JSON.parse(execFileSync('git',['show',`${commit}:${file}`],{maxBuffer:1<<26}));
export const reportKey=r=>`${r.edition}/${r.organizationId}`;

export function reportsRetained(data,old){
 assert.ok(data.reports.length>=old.reports.length,`reports ${data.reports.length} < snapshot ${old.reports.length}`);
 const keys=new Set(data.reports.map(reportKey));
 for(const r of old.reports)assert.ok(keys.has(reportKey(r)),`${reportKey(r)} was removed`);
}

// `evidence` is a repo path to the session's audit file; docs were reorganised (e.g. the
// Chicago source audit moved into docs/geography-discovery/final-seven-edition-audit-20261007/).
const withoutPath=({evidence,...rest})=>rest;

export function sessionsRetained(data,old){
 const byId=new Map(data.sessions.map(s=>[s.id,s]));
 assert.equal(byId.size,data.sessions.length,'duplicate session ids');
 for(const s of old.sessions){assert.ok(byId.has(s.id),`session ${s.id} was removed`);sameData(withoutPath(byId.get(s.id)),withoutPath(s),`session ${s.id}`);}
}

export function effortRetained(effort,prior,{skip=[]}={}){
 for(const[k,v]of Object.entries(prior.organizations)){
  const now=effort.organizations[k];
  assert.ok(now,`effort record ${k} was removed`);
  if(skip.includes(k))continue;
  const byId=new Map((now.sessions||[]).map(s=>[s.id,s]));
  for(const s of v.sessions||[]){assert.ok(byId.has(s.id),`${k}: effort session ${s.id} was removed`);sameData(byId.get(s.id),s,`${k} effort session ${s.id}`);}
 }
}
