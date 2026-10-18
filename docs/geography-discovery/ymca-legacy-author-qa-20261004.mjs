import fs from 'node:fs';import{pathToFileURL}from'node:url';import{createHash}from'node:crypto';
const root=process.argv[2];if(!root)throw Error('Pass read-only repository root');const path='/private/tmp/ymca-legacy-author-20261004-calculate.mjs';
const source=fs.readFileSync(path,'utf8').replace("'./income-health-equivalence.mjs'",JSON.stringify(pathToFileURL(root+'/lib/income-health-equivalence.mjs').href));const m=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const tested=m.selfTest();let manualAssertions=0;const close=(a,b,label)=>{manualAssertions++;if(Math.abs(a-b)>1e-10*Math.max(1,Math.abs(a),Math.abs(b)))throw Error(label+' '+a+' != '+b);};
for(const[name,o]of Object.entries(m.cases)){
 const x={...m.defaults,...o},result=tested.all[name];let hs=-x.independentClinicalHarmSF,hr=-x.independentClinicalHarmRestBay,is=0,ir=0;
 for(const[k,base]of Object.entries(m.defaults.routes)){
  const r={...base,...o.routes?.[k]},funded=x.gift*m.allocation[k]/r.cost,added=funded*r.additionality;let years=0;
  for(let i=0;i<Math.ceil(r.healthYears);i++)years+=Math.min(1,r.healthYears-i)*Math.pow(1+x.discount,-r.healthDelay-i);
  if(k==='fitness')years=Math.pow(1+x.discount,-r.healthDelay);
  const health=added*((r.healthPerUnit>0?r.healthPerUnit*r.positiveHealthIndependentShare:r.healthPerUnit)*years-r.clinicalHarm);
  const net=[r.accessSaving,r.realizedTakeHomePay,r.netTransfer,r.medicalSaving,-r.fees,-r.travel,-r.care,-r.lostActualPay,-r.displacedResources].reduce((s,v)=>s+(v>0?v*r.positiveResourceIndependentShare:v),0);let resourceYears=0;
  for(let i=0;i<Math.ceil(r.resourceYears);i++)resourceYears+=Math.min(1,r.resourceYears-i)*Math.pow(1+x.discount,-r.resourceDelay-i);
  const households=funded*r.resourceAdditionality*r.householdsPerUnit*r.resourceShare,income=.5*households*Math.log((r.baseline+net)/r.baseline)*resourceYears;
  close(result.routes[k].clinicalHealthyYears,health,name+k+' health');close(result.routes[k].netHouseholdAnnualResourcesUSD,net,name+k+' signed net');close(result.routes[k].incomeEquivalentYears,income,name+k+' log');
  hs+=health*r.healthSfShare;hr+=health*(1-r.healthSfShare);is+=income*r.householdSfShare;ir+=income*(1-r.householdSfShare);
 }
 const induced=.5*x.inducedHouseholds*Math.log((50000+x.inducedNetResources)/50000);is+=induced*x.inducedSfShare;ir+=induced*(1-x.inducedSfShare);
 for(const[k,h,i]of[['sf',hs,is],['restBay',hr,ir],['bayIncludingSF',hs+hr,is+ir]]){const g=result.geography[k];close(g.clinicalHealthyYears,h,name+k);close(g.incomeEquivalentYears,i,name+k);close(g.combinedEquivalentYears,h+i,name+k);if(h>0)close(g.donorUSDPer10ClinicalHealthyYears,10*x.gift/h,name+k+' price');if(h+i>0)close(g.donorUSDPer10CombinedEquivalentYears,10*x.gift/(h+i),name+k+' combinedprice');}
}
for(const o of[{routes:{fitness:{healthYears:2}}},{routes:{fitness:{healthDelay:0}}},{routes:{family:null}}]){let reject=false;try{m.calculate(o);}catch{reject=true;}if(!reject)throw Error('domain guard');manualAssertions++;}
const old=await import(pathToFileURL(root+'/lib/ymca-portfolio-model.mjs'));const historical=old.ymcaPortfolio.scenarios.map(s=>({id:s.id,inputs:s,engineOutputs:old.ymcaPortfolioModel(s)}));
const frozen=JSON.parse(fs.readFileSync(root+'/data/san-francisco/ymca-legacy-pre-recalibration-model.json'));let preservationAssertions=0;
for(const row of historical){const archived=frozen.evaluated.find(r=>r.id===row.id);if(!archived)throw Error('Missing archive');for(const[k,v]of Object.entries(row.engineOutputs)){preservationAssertions++;if(v!==archived.output[k])throw Error('historical changed '+row.id+k);}}
for(const rec of frozen.sources){preservationAssertions++;if(createHash('sha256').update(fs.readFileSync(root+'/'+rec.path)).digest('hex')!==rec.sha256)throw Error('historical source hash '+rec.path);}
const hashes={};for(const p of['lib/ymca-portfolio-model.mjs','data/san-francisco/ymca-portfolio-v1.json','data/san-francisco/ymca-portfolio-report.json','lib/income-health-equivalence.mjs'])hashes[p]=createHash('sha256').update(fs.readFileSync(root+'/'+p)).digest('hex');
console.log(JSON.stringify({qaAt:new Date().toISOString(),status:'PASS',candidateHash:createHash('sha256').update(fs.readFileSync(path)).digest('hex'),caseCount:tested.caseCount,selfTestAssertions:tested.assertions,manualAssertions,preservationAssertions,historicalWorldCount:historical.length,sourceHashes:hashes,central:tested.all.central,cases:tested.all,historical,qaNotes:['Initial strict cached-JSON comparison encountered final-bit dppQaly difference; final preservation uses exact root frozen live output and all source hashes, unchanged original cached outputs retained.','QA excluded from dedicated research/modeling sessions.']},null,2));
