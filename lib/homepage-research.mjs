const researchPhases=new Set(['research','modeling','source-audit']);

// These ledgers share sessions. Count each worker's union of recorded intervals,
// not report references, planned budgets, historical estimates or human equivalents.
export function homepageResearchTime(registry,geography){
 const groups=new Map(),ids=new Set(),fingerprints=new Map();let missingIntervals=0;
 const sessions=[...Object.values(registry.organizations??{}).flatMap(record=>record.sessions??[]),...(geography.sessions??[])];
 for(const session of sessions){
  if(!researchPhases.has(session.phase))continue;
  const start=Date.parse(session.startedAt),end=Date.parse(session.endedAt);
  if(!session.id||!session.workerId||!Number.isFinite(start)||!Number.isFinite(end)||end<=start){missingIntervals++;continue;}
  const fingerprint=[session.workerId,start,end].join('|');
  if(fingerprints.has(session.id)&&fingerprints.get(session.id)!==fingerprint)throw Error('Conflicting research session: '+session.id);
  fingerprints.set(session.id,fingerprint);
  ids.add(session.id);
  const intervals=groups.get(session.workerId)??[];
  intervals.push([start,end]);groups.set(session.workerId,intervals);
 }
 let milliseconds=0;
 for(const intervals of groups.values()){
  intervals.sort((a,b)=>a[0]-b[0]);let end=-Infinity;
  for(const [start,stop] of intervals){milliseconds+=Math.max(0,stop-Math.max(start,end));end=Math.max(end,stop);}
 }
 return {hours:groups.size?milliseconds/3600000:null,sessionCount:ids.size,workerCount:groups.size,missingIntervals};
}

export const homepageRegions=[
 {id:'san-francisco',label:'San Francisco',image:'san-francisco'},
 {id:'new-york-city',label:'New York City',image:'new-york-city'},
 {id:'los-angeles',label:'Los Angeles',image:'los-angeles'},
 {id:'chicago',label:'Chicago',image:'chicago'},
 {id:'houston',label:'Houston',image:'houston'},
 {id:'denver',label:'Denver',image:'denver'},
 {id:'california',label:'California',image:null},
 {id:'usa',label:'United States',image:null},
];
