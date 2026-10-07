import assert from 'node:assert/strict';import fs from 'node:fs';import {execFileSync} from 'node:child_process';
import data from '../data/geography-reports.json' with {type:'json'};
import progress from '../docs/geography-progress.json' with {type:'json'};
import selection from '../data/edition-featured.json' with {type:'json'};
import images from '../data/edition-highlights.json' with {type:'json'};
import {featuredReports} from '../lib/edition-featured.mjs';import {reportPrice} from '../lib/geography-reports.mjs';
const base=JSON.parse(execFileSync('git',['show','a859d9cf55f8c12693cdc390a41efd6f83ef15d8:data/geography-reports.json'],{encoding:'utf8',maxBuffer:40*1024*1024}));
let checks=0;function ok(value,msg){assert(value,msg);checks++;}
const picks=featuredReports(data.reports,'denver'),entry=selection.editions.denver,e=progress.editions.find(e=>e.id==='denver');
ok(picks.length===4,'four');ok(new Set(entry.slugs).size===4,'distinct');
assert.deepEqual(picks.map(r=>r.organizationId),e.topPickIds);checks++;
ok(e.alphaPublished===25&&e.betaAcceptedPublished===10&&e.topPicksPublished===4,'counts');
for(const r of picks){ok(r.stage==='beta'&&r.acceptance.status==='accepted','accepted');
ok(fs.existsSync(r.acceptance.evidence),'actual acceptance evidence');
ok(reportPrice(r)>0,'current positive');ok(!!images['denver/'+r.slug],'image');}
for(let i=0;i<data.reports.length;i++){const before=JSON.parse(JSON.stringify(base.reports[i]));if(before.edition==='denver'&&['energy-outreach-colorado','doctors-care'].includes(before.slug))before.acceptance.evidence=before.acceptance.evidence.replace('/acceptance.md','/acceptance.json');assert.deepEqual(data.reports[i],before,'no scientific mutation '+before.slug);checks++;}
assert.deepEqual(data.sessions,base.sessions);checks++;
const effort=fs.readFileSync('data/research-effort.json','utf8');assert.equal(effort,execFileSync('git',['show','a859d9cf55f8c12693cdc390a41efd6f83ef15d8:data/research-effort.json'],{encoding:'utf8',maxBuffer:20*1024*1024}));checks++;
console.log(JSON.stringify({pass:true,checks,denver:'25/25,10/10,4/4',prices:picks.map(r=>({slug:r.slug,price:reportPrice(r)}))}));

