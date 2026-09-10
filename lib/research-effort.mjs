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
export function researchEffortSummary(data,organization){
 const record=data.organizations[organization];
 if(!record?.sessions.length)return {label:'Research time: not recorded · AI model: not recorded',recorded:false,details:data.historicalCoverage,minutes:null};
 const minutes=record.sessions.reduce((sum,s)=>sum+(Date.parse(s.endedAt)-Date.parse(s.startedAt))/60000,0);
 const display=Math.floor((minutes+Number.EPSILON)*10)/10;
 const models=[...new Set(record.sessions.map(s=>s.model?.name||'an unrecorded AI model'))];
 return {
  label:(display===0?'Less than 0.1':String(display))+' min of tracked research with '+models.join(' + ')+(record.coverage==='partial'?' (partial record)':''),
  recorded:true,minutes,
  details:data.timeBasis+' Included phases: '+[...new Set(record.sessions.map(s=>s.phase))].join(', ')+'. '+record.sessions.map(s=>s.description||'').filter(Boolean).join(' ')+(record.coverage==='partial'?' Earlier research is not fully recorded; this is a partial total.':''),
 };
}
