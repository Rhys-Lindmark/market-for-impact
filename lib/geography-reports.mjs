import {editionPath} from './geography-editions.mjs';
import {validateResearchEffort, researchEffortSummary} from './research-effort.mjs';
import {incomeHealthyYearEquivalent} from './income-health-equivalence.mjs';

export const editionReportSections = [
 ['what','1. What do they do?'],
 ['monitoring','2. Monitoring and information sharing'],
 ['qualitative','3. Qualitative assessment'],
 ['cost','4. What do you get for your dollar?'],
 ['funding','5. Funding and previous grants'],
];
const text=value=>typeof value==='string'&&value.trim().length>0;
const https=value=>typeof value==='string'&&/^https:\/\//.test(value);
const date=value=>/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value));
const requireValue=(ok,message)=>{if(!ok)throw Error(message);};

export function reportPrice(report) {
 const s=report.model.scenarios.find(s=>s.id==='central');
 if(!s||!(s.costUSD>0)||!Number.isFinite(s.editionQalys))return null;
 if(s.incomeUnknown===true)return null;
 const income=scenarioIncomeEquivalent(s)??(report.model.incomeBridge?incomeHealthyYearEquivalent(report.model.incomeBridge):0);
 const total=s.editionQalys+income;
 return total>0?10*s.costUSD/total:null;
}
export function scenarioIncomeEquivalent(s){
 return s.incomeUnknown===true||s.incomePathways===undefined?null:s.incomePathways.reduce((sum,p)=>sum+incomeHealthyYearEquivalent(p),0);
}
export function incomeAdjustedReportPrice(report){
 const central=report.model.scenarios.find(s=>s.id==='central'),bridge=report.model.incomeBridge;
 if(!central||(!bridge&&central.incomePathways===undefined)||!(central.costUSD>0))return null;
 if(central.incomeUnknown===true)return null;
 const health=central.editionQalys;
 if(!Number.isFinite(health))return null;
 const income=scenarioIncomeEquivalent(central)??incomeHealthyYearEquivalent(bridge);
 const total=health+income;
 return total>0?{price:10*central.costUSD/total,healthQalys:health,incomeEquivalentYears:income}:null;
}
export function formatEditionSensitivity(item){
 if(text(item))return item;
 const label=item.label||item.name||item.id;
 const price=item.pricePer10Qalys??item.pricePer10;
 const result=Number.isFinite(price)&&price>0?`${formatEditionMoney(price)} per better life`:'no finite positive estimate';
 return `${label}: ${result}${text(item.assumptions)?`. ${item.assumptions}`:''}`;
}
export function formatEditionMoney(value){
 if(value===null||!Number.isFinite(value))return 'Not estimated';
 if(value>=1e6)return '$'+(value/1e6).toFixed(1)+'M';
 if(value>=1e3)return '$'+Math.round(value/1e3)+'K';
 return '$'+Math.round(value).toLocaleString('en-US');
}
export function formatEditionReportPrice(report){
 const price=researchListPrice(report);
 if(price!==null)return formatEditionMoney(price);
 if(/illustrative annual-average/i.test(report.priceScope??'')){
  const example=report.model?.scenarios?.find(s=>s.id==='illustrative-average');
  if(example?.costUSD>0&&example?.editionQalys>0)return 'Illustrative '+formatEditionMoney(10*example.costUSD/example.editionQalys);
 }
 return 'Not estimated';
}
// Preserve the original alpha estimate in comparison lists when a later review
// cannot calibrate a new central estimate. Do not change the current model or
// promote historical scenarios into the landing-page shortlist.
export function researchListPrice(report){
 const current=reportPrice(report);
 if(current!==null)return current;
 const original=report.model.scenarios.find(s=>[
  'historical-alpha-central','alpha-central-diagnostic','alpha-reproduced',
  'alpha-diagnostic','alpha-retained-diagnostic','alpha-reference',
 ].includes(s.id));
 return original?.costUSD>0&&original?.editionQalys>0?10*original.costUSD/original.editionQalys:null;
}
export function editionReportPath(report){return editionPath(report.edition)+'/charities/'+report.slug;}
export function formatAnnualExpense(year){return year.currency==='USD'?formatEditionMoney(year.amount):year.amount.toLocaleString('en-US',{maximumFractionDigits:0})+' '+year.currency;}
export function expenseAverage(report){
 const years=[...report.annualExpenses].sort((a,b)=>a.year-b.year);
 if(years.length!==3||years[1].year!==years[0].year+1||years[2].year!==years[1].year+1)return null;
 if(years.some(y=>y.periodMonths!==12||y.currency!=='USD'||y.comparable!==true))return null;
 if(new Set(years.map(y=>y.entity)).size!==1||new Set(years.map(y=>y.accountingBasis)).size!==1)return null;
 return years.reduce((sum,y)=>sum+y.amount,0)/3;
}
export function editionResearchEffort(data,report){
 const sessions=report.sessionIds.map(id=>data.sessions.find(s=>s.id===id));
 return researchEffortSummary({organizations:{[report.organizationId]:{coverage:report.timeCoverage,sessions}}},report.organizationId);
}
export function reportsForEdition(data,id){
 return data.reports.filter(r=>r.edition===id).sort((a,b)=>(researchListPrice(a)??Infinity)-(researchListPrice(b)??Infinity)||a.organization.localeCompare(b.organization));
}

// Reject incomplete publication packets. This validates structure and arithmetic;
// source truth, scientific assumptions and acceptance remain human/agent reviews.
export function validateEditionReports(data,progress){
 requireValue(data.schemaVersion===1&&Array.isArray(data.reports)&&Array.isArray(data.sessions),'Invalid edition report registry');
 const registry={version:1,timeBasis:'Dedicated researcher intervals',historicalCoverage:'New edition reports',organizations:{}};
 for(const s of data.sessions){
  requireValue(text(s.organizationId)&&['alpha','beta'].includes(s.stage),'Session requires organization and research stage');
  // An unverified runtime must remain unknown; never manufacture model provenance.
  requireValue(s.model===null||(s.model?.id==='gpt-6-astra'&&['low','medium'].includes(s.model.reasoningEffort))||(s.model?.id==='gpt-6.1-sol'&&/runtime model assignment|user-confirmed model assignment/i.test(s.model.evidence??'')),'Record verified research model provenance');
  if(s.phase==='research'&&s.model?.id==='gpt-6-astra')requireValue(s.model.reasoningEffort===(s.stage==='alpha'?'low':'medium'),'Wrong author model for stage');
  requireValue(!/\/tmp\/|\/Users\/|file:\/\//.test(s.evidence),'Session evidence must be publishable');
  (registry.organizations[s.organizationId]??={coverage:'complete',sessions:[]}).sessions.push(s);
 }
 validateResearchEffort(registry);
 const keys=new Set();
 for(const r of data.reports){
  const e=progress.editions.find(e=>e.id===r.edition);
  requireValue(e&&editionPath(r.edition)&&r.boundaryVersion===e.boundaryVersion,'Report geography mismatch');
  requireValue(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(r.slug),'Invalid report slug');
  const key=r.edition+':'+r.slug;requireValue(!keys.has(key),'Duplicate edition report route');keys.add(key);
  requireValue(e.selectedAlphaIds?.includes(r.organizationId)||e.supplementalAlphaIds?.includes(r.organizationId),'Report not in accepted research cohort');
  requireValue(text(r.organization)&&text(r.program)&&date(r.published)&&date(r.updated)&&['alpha','beta'].includes(r.stage),'Missing report metadata');
  requireValue(r.donationUrl===null||https(r.donationUrl),'Unsafe donation route');
  requireValue(r.priceScope===undefined||text(r.priceScope),'Invalid price scope label');
  requireValue(r.acceptance?.status==='accepted'&&text(r.acceptance.evidence),'Missing publication acceptance');
  requireValue(Array.isArray(r.summary.what)&&r.summary.what.length===3&&r.summary.what.every(text),'Summary needs three substantive introductory sentences');
  for(const name of ['strengths','reservations'])requireValue(r.summary[name]?.length===3&&r.summary[name].every(text),'Summary needs three '+name);
  for(const [id] of editionReportSections)requireValue(text(r.sections[id]),'Missing section '+id);
  requireValue(Array.isArray(r.sources)&&r.sources.length>0,'No report sources');
  const sourceIds=new Set(r.sources.map(s=>s.id));requireValue(sourceIds.size===r.sources.length,'Duplicate source ids');
  for(const s of r.sources)requireValue(/^[a-zA-Z0-9-]+$/.test(s.id)&&text(s.title)&&text(s.publisher)&&https(s.url)&&date(s.retrieved)&&(s.published===null||date(s.published)),'Source provenance missing');
  const m=r.model;
  for(const field of ['version','costScope','geographicAttribution','formula','counterfactual','attribution','uncertainty','nativeOutcomes'])requireValue(text(m[field]),'Missing model '+field);
  requireValue(Array.isArray(m.inputs)&&Array.isArray(m.scenarios)&&Array.isArray(m.sensitivity)&&Array.isArray(m.missingInputs),'Missing inspectable model arrays');
  if(m.incomeBridge!==undefined){
   const b=m.incomeBridge;
   requireValue(text(b.rationale)&&text(b.counterfactual)&&Array.isArray(b.sourceIds)&&b.sourceIds.length>0&&b.sourceIds.every(id=>sourceIds.has(id)),'Income bridge needs rationale, counterfactual and report sources');
   incomeHealthyYearEquivalent(b);
  }
  requireValue(m.sensitivity.every(item=>text(item)||(item&&typeof item==='object'&&text(item.label||item.name||item.id))),'Sensitivity notes must be renderable text or labeled scenarios');
  for(const i of m.inputs){requireValue(text(i.name)&&text(i.unit)&&text(i.rationale)&&['observed','judgment','unknown'].includes(i.basis),'Invalid model input');requireValue(Array.isArray(i.sourceIds)&&i.sourceIds.every(id=>sourceIds.has(id)),'Invalid input sources');if(i.basis==='observed')requireValue(i.sourceIds.length>0,'Observed input needs a source');}
  requireValue(new Set(m.scenarios.map(s=>s.id)).size===m.scenarios.length,'Duplicate scenarios');
  for(const s of m.scenarios){requireValue(text(s.id)&&text(s.label)&&text(s.assumptions),'Missing scenario assumptions');for(const f of ['costUSD','allPopulationQalys','editionQalys'])requireValue(s[f]===null||Number.isFinite(s[f]),'Invalid scenario '+f);requireValue(s.costUSD===null||s.costUSD>=0,'Cost must be nonnegative or unknown');
   requireValue(s.incomeUnknown===undefined||typeof s.incomeUnknown==='boolean','Invalid income unknown flag');
   if(s.incomePathways!==undefined){requireValue(Array.isArray(s.incomePathways),'Income pathways must be an array');for(const b of s.incomePathways){requireValue(text(b.rationale)&&text(b.counterfactual)&&Array.isArray(b.sourceIds)&&b.sourceIds.length>0&&b.sourceIds.every(id=>sourceIds.has(id)),'Income pathway needs rationale, counterfactual and report sources');incomeHealthyYearEquivalent(b);}}
  }
  if(reportPrice(r)===null)requireValue(m.missingInputs.length>0||m.scenarios.some(s=>s.id==='central'&&s.editionQalys!==null&&Number.isFinite(s.editionQalys)&&s.editionQalys<=0),'Unestimated model needs blocking inputs or nonpositive outcome');
  else requireValue(m.sensitivity.length>0,'Numeric estimate needs sensitivity analysis');
  requireValue(Array.isArray(r.annualExpenses),'Missing annual expense disclosure');
  requireValue(new Set(r.annualExpenses.map(y=>y.year)).size===r.annualExpenses.length,'Duplicate annual expense years');
  for(const y of r.annualExpenses)requireValue(Number.isInteger(y.year)&&Number.isFinite(y.amount)&&y.amount>=0&&sourceIds.has(y.sourceId)&&text(y.entity)&&text(y.accountingBasis)&&/^[A-Z]{3}$/.test(y.currency)&&(y.periodMonths===null||(Number.isInteger(y.periodMonths)&&y.periodMonths>0)),'Invalid annual expenses');
  requireValue(['partial','complete'].includes(r.timeCoverage)&&r.sessionIds?.length>0&&new Set(r.sessionIds).size===r.sessionIds.length,'Missing or duplicate report research intervals');
  for(const id of r.sessionIds)requireValue(data.sessions.some(s=>s.id===id&&s.organizationId===r.organizationId),'Session not recorded for this organization');
  const timedAuthorResearch=r.sessionIds.some(id=>data.sessions.some(s=>s.id===id&&s.stage===r.stage&&s.phase==='research'));
  // A lost author clock stays excluded, not relabeled or reconstructed. A
  // separately timed author-modeling correction can supply partial coverage.
  let timedAuthorCorrection=false;
  if(r.excludedResearchSessions!==undefined){
   requireValue(r.timeCoverage==='partial'&&Array.isArray(r.excludedResearchSessions)&&r.excludedResearchSessions.length>0,'Excluded research requires explicit partial coverage');
   requireValue(Array.isArray(r.authorWorkerIds)&&r.authorWorkerIds.length>0&&r.authorWorkerIds.every(text),'Excluded research needs declared authors');
   for(const s of r.excludedResearchSessions)requireValue(text(s.id)&&s.status==='excluded'&&text(s.reason)&&s.phase==='research'&&r.authorWorkerIds.includes(s.workerId)&&!data.sessions.some(real=>real.id===s.id),'Invalid excluded author clock');
   timedAuthorCorrection=r.sessionIds.some(id=>data.sessions.some(s=>s.id===id&&s.stage===r.stage&&s.phase==='modeling'&&r.authorWorkerIds.includes(s.workerId)));
  }
  requireValue(timedAuthorResearch||timedAuthorCorrection,'Missing author research interval or documented timed correction for report stage');
 }
 for(const e of progress.editions){
  const reports=data.reports.filter(r=>r.edition===e.id);
  requireValue(new Set(reports.map(r=>r.organizationId)).size===reports.length,'Organization duplicated within edition');
  requireValue(reports.length===e.alphaPublished,'Published report count differs from registry');
  requireValue(reports.filter(r=>r.stage==='beta').length===e.betaAcceptedPublished,'Published beta count differs from registry');
  for(const r of reports)requireValue(e.alphaCohortIds.includes(r.organizationId)&&(r.stage!=='beta'||e.betaIds.includes(r.organizationId)),'Published membership differs from ledger');
 }
 return data;
}
