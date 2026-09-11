const phases=new Set(['research','modeling','source-audit']);
const utcTimestamp=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
export function validateResearchEffort(data){
 if(data.version!==1||!data.timeBasis?.trim()||!data.historicalCoverage?.trim()||!data.organizations||typeof data.organizations!=='object'||Array.isArray(data.organizations))throw new Error('Invalid research-effort registry');
 const ids=new Set(),workers=new Map();
 for(const [organization,record]of Object.entries(data.organizations)){
  if(!organization.trim()||organization!==organization.trim()||!['partial','complete'].includes(record.coverage)||!Array.isArray(record.sessions)||(record.coverage==='complete'&&!record.sessions.length))throw new Error('Invalid organization research record');
  for(const s of record.sessions){
   if(!s.id||ids.has(s.id)||!s.workerId||!phases.has(s.phase)||!s.evidence?.trim())throw new Error('Missing or duplicate research provenance');
   ids.add(s.id);
   const start=Date.parse(s.startedAt),end=Date.parse(s.endedAt);
   if(!utcTimestamp.test(s.startedAt)||!utcTimestamp.test(s.endedAt)||!Number.isFinite(start)||!Number.isFinite(end)||end<=start)throw new Error('Research intervals require increasing UTC timestamps');
   if(s.model!==null&&(!s.model?.id?.trim()||!s.model?.name?.trim()||!s.model?.evidence?.trim()))throw new Error('AI model requires recorded identity evidence');
   const prior=workers.get(s.workerId)||[];
   if(prior.some(([a,b])=>start<b&&end>a))throw new Error('A researcher cannot charge overlapping intervals to multiple reports');
   prior.push([start,end]);workers.set(s.workerId,prior);
  }
 }
 return data;
}
export function researchEffortSummary(data,organization,historical=null){
 const record=data.organizations[organization];
 const older=historical?.organizations.includes(organization);
 const phaseText={
  research:'Research — reviewed programs, finances and impact evidence.',
  modeling:'Modeling — estimated costs, QALYs and uncertainty.',
  'source-audit':'Source audit — checked claims, assumptions and calculations.',
 };
 if(!record?.sessions.length){
  if(older){
   const estimate=historical.minutesByOrganization?.[organization]??historical.minutes;
   return {label:'Research time: ~'+Math.round(estimate)+' min on '+historical.model.name,recorded:false,estimated:true,minutes:estimate,bullets:['Research — organization and evidence review.','Modeling — cost-effectiveness analysis.','Historical estimate for research done before time tracking.']};
  }
  return {label:'Research time: not recorded on an unrecorded AI model',recorded:false,estimated:false,minutes:null,bullets:['Research time and AI model have not been recorded.']};
 }
 const minutes=record.sessions.reduce((sum,s)=>sum+(Date.parse(s.endedAt)-Date.parse(s.startedAt))/60000,0);
 const display=Math.round(minutes);
 const models=[...new Set(record.sessions.map(s=>older&&s.model?.id===historical.model.id?historical.model.name:s.model?.name||'an unrecorded AI model'))];
 const lead=data.leadModelContext;
 const hasLead=lead&&record.sessions.some(s=>Date.parse(s.startedAt)>=Date.parse(lead.startsAt)&&Date.parse(s.startedAt)<Date.parse(lead.endsAt));
 const displayModels=hasLead?[lead.name,...new Set(models.map(name=>name.replace(' Sol Medium',' Sol')))].filter((name,index,list)=>list.indexOf(name)===index):models;
 return {
  label:'Research time: '+(record.coverage==='partial'?'~':'')+(display===0?'less than 1':String(display))+' min on '+displayModels.join(' + '),
  recorded:true,estimated:false,minutes,
  bullets:[...new Set(record.sessions.map(s=>s.phase))].map(phase=>phaseText[phase]),
 };
}
