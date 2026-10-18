import fs from 'node:fs';
const base=process.argv[2]??'http://localhost:3012';
const registry=JSON.parse(fs.readFileSync('data/geography-reports.json'));
const pages=['/all','/san-francisco','/san-francisco/all','/archive/expanded-geography-research','/research/city-theory','/research/large-bay-nonprofits','/research/better-paying-jobs','/methodology/income'];
for(const d of fs.readdirSync('app/charities',{withFileTypes:true}))if(d.isDirectory()&&fs.existsSync('app/charities/'+d.name+'/page.tsx'))pages.push('/charities/'+d.name);
for(const r of registry.reports)pages.push('/'+r.edition+'/charities/'+r.slug);
for(const e of ['california','usa','new-york-city','los-angeles','chicago','houston','denver'])pages.push('/'+e,'/'+e+'/all');
let at=0;const rows=[];
await Promise.all([0,1].map(async()=>{while(at<pages.length){const route=pages[at++];try{
 const response=await fetch(base+route),html=await response.text();
 const text=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ');
 const residual=[...text.matchAll(/better[- ]life|per\s*(?:10|ten)[- ]+(?:(?:additional|incremental|combined|local|global|Bay|SF|LA|USA|California|metro|clinical|healthy|health)\s*)*(?:QALY|equivalent|year)/gi)].map(m=>text.slice(Math.max(0,m.index-60),m.index+100));
 rows.push({route,status:response.status,residual,hasMetric:/DALY-equivalent/.test(text)});
 }catch(e){rows.push({route,error:String(e)});}}}));
console.log(JSON.stringify({pages:rows.length,reportCounts:Object.fromEntries([...new Set(registry.reports.map(r=>r.edition))].map(e=>[e,registry.reports.filter(r=>r.edition===e).length])),failures:rows.filter(r=>r.error||r.status!==200||r.residual.length),rows}));
