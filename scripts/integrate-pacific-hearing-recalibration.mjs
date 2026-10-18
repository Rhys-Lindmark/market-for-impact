// Emits reviewable apply_patch input; never writes files itself.
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const root=path.resolve(new URL('..',import.meta.url).pathname);
const target=process.argv[2];
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const old=JSON.parse(execFileSync('git',['show','ab64bb4:data/bay/pacific-hearing-v2-report.json'],{cwd:root,encoding:'utf8',maxBuffer:20*1024*1024}));
const section=(title)=>old.markdown.split('## '+title+'\n')[1].split('\n## ')[0].trim();
const summary=`**What do they do?** Pacific Hearing Connection offers reduced-fee hearing assessments, hearing aids and follow-up in the Bay Area. Donated devices, professional time and space help support access. It also provides outreach and education.

**Why this approach interests us**

- Appropriately fitted hearing aids can improve communication for people without equivalent treatment alternatives.
- Reused devices and donated clinical resources can make specialist care more accessible.
- An operating local service provides a practical route from referral to fitting and follow-up.

**Our main reservations**

- Additional offers, completed fittings, continued use and equivalent-care alternatives are not established by a reconciled patient ledger.
- The clinical estimate depends on utility measurement, discontinuation, later alternative treatment and donor responsiveness.
- Sliding-scale fees, access costs and maintenance can offset household savings; complete external costs and additional funding capacity remain unknown.

**What do you get for your dollar?** The current planning model estimates about $9.72M per better life in the Bay Area, including health and signed household-resource benefits. A $10,000 comparison produces about 1.43 additional paired-person offers, 1.13 fittings and 0.55 initial useful users without equivalent alternative care. Hearing gains improve communication, but fees and maintenance reduce the combined benefit. These delivery figures are judgments, not a current treatment quote. [More](#4-model-and-results)

**What information has the organization shared?** Original annual returns provide expense and asset data; current program pages explain eligibility, sliding-scale fees and donated resources. They support a real operating service, but do not establish current unique fitting totals, treatment retention or a marginal expansion budget. [More](#6-funding-and-monitoring)

**Our qualitative assessment** The service has a plausible local mechanism and identifiable leadership. A reconciled delivery ledger, actual recipient-cost data and a priced expansion plan would materially strengthen the evidence for donations. [More](#7-what-would-change-our-view)
`;
const titles=['Summary','1. Organization and current delivery','2. Three years of finances','3. Clinical evidence and its limits','4. Model and results','5. Whole resources and the ordinary gift','6. Funding and monitoring','7. What would change our view?','8. Research provenance and model boundary'];
const body=titles.map(t=>{
 let s=section(t);
 if(t==='Summary')s=summary;
 if(t==='4. Model and results')s=read('docs/geography-discovery/pacific-hearing-current-report-integration-2026-10-02.md').trim()+'\n\n'+s;
 if(t==='5. Whole resources and the ordinary gift')s='Current comparison retains whole FY2024 accrual expense, including inventory, with no invented current marginal budget. The captured accounting envelope is not comprehensive societal cost. Household-resource effects are modeled separately in the preceding section.\n\n### Historical resource discussion\n\nThe original discussion below explains the former clinical-only comparison, not the current combined estimate.\n\n'+s;
 if(t==='8. Research provenance and model boundary')s='The October 2026 reassessment records 112.787 seconds of source research and 1,609.804 seconds of modeling/writing, plus 55.680 seconds of independent source/packet audit and 65.922 seconds of independent scientific synthesis. The total is 1,844.193 seconds, approximately 31 minutes on user-confirmed GPT-6.1 Sol. Runtime identity and reasoning effort were not independently introspected. Earlier recorded Astra research remains separate. Deterministic testing, numerical QA, integration, waiting and publication are excluded.\n\nThe current model is an unweighted conditional Bay health/resource comparison. All six original worlds and thirteen historical diagnostics remain available separately; their subjective weights are not new empirical probabilities. SF attribution, complete societal resources, whole-portfolio value and current funding capacity remain unresolved. Independent numerical review found and corrected near-zero-decay cancellation; exact central output was unaffected.\n\n'+s;
 return '## '+t+'\n\n'+s;
}).join('\n\n');
const markdown='# Pacific Hearing Connection\n\nUpdated: 3 October 2026. Legal recipient: Pacific Hearing Connection, EIN 81-2591375.\n\n'+body+'\n';
let before,after;
if(target==='report'){
 const file='data/bay/pacific-hearing-v2-report.json';before=read(file);old.markdown=markdown;old.program='Reduced-fee hearing assessment, hearing aids and follow-up';
 const receipts=JSON.parse(read('docs/geography-discovery/pacific-hearing-legacy-recalibration-2026-10-02.receipts.json'));
 for(const s of old.sources){const fresh=receipts.fresh.find(x=>x.url===s.url&&x.status===200);if(fresh){s.retrieved='2026-10-03';s.limit='Fresh selected source passages; original-source receipt records scope. Other conclusions remain explicit judgments.';}}
 after=JSON.stringify(old,null,2)+'\n';emit(file,before,after);
}else if(target==='markdown')emit('docs/reports/pacific-hearing-v2.md',read('docs/reports/pacific-hearing-v2.md'),markdown);
else if(target==='summary'){
 const file='data/report-summary-editorial.json';const s=JSON.parse(read(file));const current=s['Pacific Hearing Connection'];
 current.intro='Pacific Hearing Connection offers reduced-fee hearing assessments, hearing aids and follow-up in the Bay Area. Donated devices, professional time and space help support access. It also provides outreach and education.';
 current.reservations=['Additional offers, completed fittings, continued use and equivalent alternatives are not established by a reconciled patient ledger.','Clinical benefits depend on utility measurement, discontinuation, later alternative care and donor responsiveness.','Fees, access costs and maintenance can offset household savings; complete external costs and additional funding capacity remain unknown.'];
 current.cost='We estimate about $9.72M per better life in the Bay Area, including health and signed household-resource benefits. A $10,000 comparison models about 1.43 additional paired-person offers, 1.13 fittings and 0.55 initial useful users without equivalent alternative care. Hearing gains improve communication, while fees and maintenance reduce the combined benefit. These are planning judgments, not a current treatment quote.';
 // Only replace this organization object, preserving every other editorial entry.
 const original=read(file);const start=original.indexOf('  "Pacific Hearing Connection": {'),end=original.indexOf('\n  "North East Medical Services":',start);
 const replacement='  "Pacific Hearing Connection": '+JSON.stringify(current,null,2).split('\n').map((x,i)=>i? '  '+x:x).join('\n')+',\n';
 emit(file,original.slice(start,end),replacement.trimEnd(),true);
}else if(target==='effort'){
 const file='data/research-effort.json';const text=read(file);const line=text.split('\n').find(x=>x.startsWith('    "Pacific Hearing Connection":'));
 const record=JSON.parse('{'+line.trim().replace(/,$/,'')+'}')['Pacific Hearing Connection'];
 const author=JSON.parse(read('docs/geography-discovery/pacific-hearing-legacy-recalibration-2026-10-02.closed.json'));
 const review=JSON.parse(read('docs/geography-discovery/pacific-hearing-independent-review-2026-10-02.closed.json'));
 for(const [p,s] of [['pacific-hearing-legacy-recalibration',author.closedSource],['pacific-hearing-legacy-recalibration',author.session],['pacific-hearing-independent-review',review.closedSource],['pacific-hearing-independent-review',review.session]]){
  if(record.sessions.some(x=>x.id===s.id))continue;
  const evidence='docs/geography-discovery/'+p+'-2026-10-02.closed.json';
  record.sessions.push({...s,model:{id:'gpt-6.1-sol',name:'GPT-6.1 Sol',evidence:'User-confirmed assignment; raw runtime model and effort remain null in the archived source record.'},evidence});
 }
 emit(file,line,'    "Pacific Hearing Connection": '+JSON.stringify(record)+',',true);
}else throw Error('target: report, markdown, summary or effort');
function emit(file,a,b,fragment=false){
 console.log('*** Begin Patch\n*** Update File: '+path.join(root,file)+'\n@@\n'+a.trimEnd().split('\n').map(x=>'-'+x).join('\n')+'\n'+b.trimEnd().split('\n').map(x=>'+'+x).join('\n')+'\n*** End Patch');
}
