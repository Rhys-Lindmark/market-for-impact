import fs from 'node:fs';
import path from 'node:path';
import {validateEditionReports} from '../lib/geography-reports.mjs';

const dryRun=process.argv.includes('--dry-run');
const files=process.argv.slice(2).filter(arg=>arg!=='--dry-run');
if(files.length===0)throw Error('Provide at least one independently accepted packet path.');
const registryPath='data/geography-reports.json';
const progressPath='docs/geography-progress.json';
const registry=JSON.parse(fs.readFileSync(registryPath,'utf8'));
const progress=JSON.parse(fs.readFileSync(progressPath,'utf8'));
const changed=[];
for(const file of files){
 const packet=JSON.parse(fs.readFileSync(file,'utf8'));
 const reports=packet.acceptedReports??packet.reports;
 if(!Array.isArray(reports)||reports.length===0)throw Error(`No accepted reports in ${file}`);
 const candidates=[...packet.authorSessions??[],...packet.priorAuditSessions??[],...packet.auditSessions??[],...packet.sessions??[]];
 const sessions=candidates.map(candidate=>candidate.session??candidate);
 const referenced=new Set(reports.flatMap(report=>report.sessionIds));
 const newSessions=sessions.filter(session=>referenced.has(session.id));
 for(const report of reports){
  if(report.acceptance?.status==='accepted-with-clarifications'&&packet.independentAcceptance?.status==='accepted-with-clarifications'){
   report.acceptance={...report.acceptance,status:'accepted',evidence:`${path.basename(file)}: independently accepted with clarifications. ${report.acceptance.scope}`};
  }
  if(report.acceptance?.status!=='accepted')throw Error(`Report not accepted: ${report.slug}`);
  for(const source of report.sources){
   if(!Object.hasOwn(source,'published'))source.published=null;
   if(!source.publisher){
    const sourceUrl=new URL(source.url);
    source.publisher=sourceUrl.hostname==='doi.org'&&sourceUrl.pathname.startsWith('/10.1056/')
     ?'New England Journal of Medicine'
     :sourceUrl.hostname==='projects.propublica.org'
      ?'IRS, hosted by ProPublica'
      :`${report.organization} (source host)`;
   }
  }
  for(const id of report.sessionIds){
   const session=newSessions.find(item=>item.id===id)??registry.sessions.find(item=>item.id===id);
   if(!session)throw Error(`Missing session ${id} for ${report.slug}`);
   if(!session.organizationId)session.organizationId=report.organizationId;
   if(!session.stage)session.stage=report.stage;
   if(session.organizationId!==report.organizationId)throw Error(`Session organization mismatch: ${id}`);
  }
  const index=registry.reports.findIndex(item=>item.edition===report.edition&&item.organizationId===report.organizationId);
  if(index<0)registry.reports.push(report);else registry.reports[index]=report;
  const edition=progress.editions.find(item=>item.id===report.edition);
  if(!edition?.selectedAlphaIds.includes(report.organizationId))throw Error(`Report outside selected cohort: ${report.slug}`);
  if(!edition.alphaCohortIds.includes(report.organizationId))edition.alphaCohortIds.push(report.organizationId);
  if(report.stage==='beta'&&!edition.betaIds.includes(report.organizationId))edition.betaIds.push(report.organizationId);
  changed.push(`${report.edition}/${report.slug}:${report.stage}`);
 }
 for(const session of newSessions){
  if(session.phase==='review'||session.phase==='acceptance')session.phase='source-audit';
  if(!session.model.reasoningEffort){
   const effort=session.model.name==='GPT-6 Astra Light'?'low':session.model.name==='GPT-6 Astra Medium'?'medium':null;
   if(!effort||!session.model.evidence?.includes('dispatch')&&!session.model.evidence?.includes('runtime assignment'))throw Error(`Unknown model effort: ${session.id}`);
   session.model.reasoningEffort=effort;
  }
  const index=registry.sessions.findIndex(item=>item.id===session.id);
  if(index<0)registry.sessions.push(session);
  else if(JSON.stringify(registry.sessions[index])!==JSON.stringify(session))throw Error(`Session collision: ${session.id}`);
 }
}
for(const edition of progress.editions){
 const reports=registry.reports.filter(report=>report.edition===edition.id);
 edition.alphaPublished=reports.length;
 edition.betaAcceptedPublished=reports.filter(report=>report.stage==='beta').length;
}
progress.updated=new Date().toISOString().slice(0,10);
validateEditionReports(registry,progress);
console.log(`Validated ${changed.length} accepted reports: ${changed.join(', ')}`);
if(!dryRun){
 fs.writeFileSync(registryPath,JSON.stringify(registry,null,2)+'\n');
 fs.writeFileSync(progressPath,JSON.stringify(progress,null,2)+'\n');
}
