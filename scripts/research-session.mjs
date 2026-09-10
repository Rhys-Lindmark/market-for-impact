// Print timestamped records; the owner reviews and persists them with apply_patch.
import fs from 'node:fs';
import {randomUUID} from 'node:crypto';
import {validateResearchEffort} from '../lib/research-effort.mjs';
const [command,...args]=process.argv.slice(2);
const values=Object.fromEntries(args.reduce((pairs,arg,i)=>i%2===0?[...pairs,[arg,args[i+1]]]:pairs,[]));
if(command==='start'){
 for(const key of ['--organization','--worker','--phase','--evidence'])if(!values[key]?.trim())throw new Error('Required: '+key);
 if(!['research','modeling','source-audit'].includes(values['--phase']))throw new Error('Only organization-specific research phases are timed');
 const modelKeys=['--model-id','--model-name','--model-evidence'];
 if(modelKeys.some(k=>values[k])&&!modelKeys.every(k=>values[k]?.trim()))throw new Error('AI model flags are all-or-none');
 const model=values['--model-id']?{id:values['--model-id'],name:values['--model-name'],evidence:values['--model-evidence']}:null;
 if(model&&(!model.name||!model.evidence))throw new Error('Record model name and identity evidence; never guess');
 console.log(JSON.stringify({organization:values['--organization'],session:{id:randomUUID(),workerId:values['--worker'],phase:values['--phase'],startedAt:new Date().toISOString(),endedAt:null,model,evidence:values['--evidence']}},null,2));
}else if(command==='finish'){
 if(!values['--record'])throw new Error('Required: --record path to the saved start record');
 const record=JSON.parse(fs.readFileSync(values['--record'],'utf8'));
 if(typeof record.organization!=='string'||!record.organization.trim()||record.organization!==record.organization.trim())throw new Error('Missing or invalid organization');
 if(record.session.endedAt!==null||!Number.isFinite(Date.parse(record.session.startedAt)))throw new Error('Not an open research record');
 record.session.endedAt=new Date().toISOString();
 if(Date.parse(record.session.endedAt)<=Date.parse(record.session.startedAt))throw new Error('Invalid clock interval');
 validateResearchEffort({version:1,timeBasis:'Dedicated research intervals',historicalCoverage:'See report record',organizations:{[record.organization]:{coverage:'partial',sessions:[record.session]}}});
 console.log(JSON.stringify(record,null,2));
}else throw new Error('Use start or finish; see docs/research-effort.md');
