// Shared builder for the 2026-10-18 evidence-tier batch (Arnold Ventures
// Social Programs That Work candidates). Each organization folder defines its
// inputs, scenarios and prose in review.mjs and calls writeReview().
import fs from 'node:fs';
import {incomeHealthyYearEquivalent} from '../../../lib/income-health-equivalence.mjs';

export const hye=ps=>ps.reduce((s,p)=>s+incomeHealthyYearEquivalent(p),0);
export function price(s){const t=(s.editionQalys??0)+hye(s.incomePathways??[]);return t>0?10*s.costUSD/t:null;}
export const fmt=x=>x==null?'no credited benefit':'$'+(x>=1e6?(x/1e6).toFixed(2)+'M':Math.round(x/1e3)+'K')+' per better life';
export const usd=x=>'$'+Math.round(x).toLocaleString('en-US');

// Income pathway with an explicit product of causal factors.
export function incomePath({people,base,gain,years,delay,discount=0.03,editionShare=1,factors,sourceIds,rationale,counterfactual}){
 const causalShare=Object.values(factors).reduce((a,b)=>a*b,1);
 return {people,annualIncomeBeforeUSD:base,annualIncomeGainUSD:gain,years,delayYears:delay,discountRate:discount,editionShare,independentShare:1,causalFactors:factors,causalShare,sourceIds,rationale,counterfactual};
}

export function writeReview(dir,spec){
 const sc=spec.scenarios.map(s=>({allPopulationQalys:s.editionQalys??0,editionQalys:0,...s,incomePathways:(s.incomePathways??[]).filter(p=>p.causalShare>0)}));
 const p=Object.fromEntries(sc.map(s=>[s.id,price(s)]));
 const sessionsFile=new URL('sessions.json',dir);
 const report={
  edition:spec.edition,boundaryVersion:spec.boundaryVersion,organizationId:spec.organizationId,slug:spec.slug,
  organization:spec.organization,program:spec.program,published:spec.date,updated:spec.date,stage:'beta',donationUrl:spec.donationUrl,
  acceptance:{status:'accepted',evidence:spec.acceptanceEvidence},
  priceScope:spec.priceScope,
  summary:spec.summary(p),sections:spec.sections(p),sources:spec.sources,
  model:{...spec.model,scenarios:sc,
   sensitivity:sc.filter(s=>s.id!=='central').map(s=>({id:s.id,label:s.label,pricePer10:p[s.id]??undefined,assumptions:s.assumptions}))},
  annualExpenses:spec.annualExpenses,timeCoverage:'complete',
  sessionIds:fs.existsSync(sessionsFile)?JSON.parse(fs.readFileSync(sessionsFile,'utf8')).sessions.map(s=>s.id):[]
 };
 fs.writeFileSync(new URL('report.json',dir),JSON.stringify(report,null,1)+'\n');
 return {report,prices:p};
}
