import fs from 'node:fs';
import {healthTextEdits,isQalyQuantityLabel} from '../lib/health-display.mjs';
const base=process.argv[2]??'http://localhost:3012';
const registry=JSON.parse(fs.readFileSync('data/geography-reports.json'));
const pages=['/all','/san-francisco','/san-francisco/all','/archive/expanded-geography-research','/research/city-theory','/research/large-bay-nonprofits','/research/better-paying-jobs','/methodology/income'];
for(const d of fs.readdirSync('app/charities',{withFileTypes:true}))if(d.isDirectory()&&fs.existsSync('app/charities/'+d.name+'/page.tsx'))pages.push('/charities/'+d.name);
for(const r of registry.reports)pages.push('/'+r.edition+'/charities/'+r.slug);
for(const e of ['california','usa','new-york-city','los-angeles','chicago','houston','denver'])pages.push('/'+e,'/'+e+'/all');
const plain=s=>s.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'').replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/\s+/g,' ');
let at=0;const failures=[];let checked=0;
await Promise.all([0,1].map(async()=>{while(at<pages.length){const route=pages[at++];try{
 const r=await fetch(base+route),html=await r.text(),text=plain(html);
 const residual=[];
 for(const block of html.replace(/<table\b[^>]*>[\s\S]*?<\/table>/gi,'').matchAll(/<(?:p|li|dd)\b[^>]*>([\s\S]*?)<\/(?:p|li|dd)>/gi)){const t=plain(block[1]);for(const e of healthTextEdits(t))if(t.slice(e.start,e.end)!==e.text)residual.push(t.slice(Math.max(0,e.start-35),e.end+65));}
 for(const table of html.matchAll(/<table\b[^>]*>([\s\S]*?)<\/table>/gi)){
  const rows=[...table[1].matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map(r=>[...r[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)].map(c=>plain(c[1]).trim()));
  for(const row of rows.slice(1))for(let k=0;k<row.length;k++)if(isQalyQuantityLabel(rows[0]?.[k]??'')||(k>0&&isQalyQuantityLabel(row[0]??'')))for(const e of healthTextEdits(row[k],{quantityOnly:true}))if(row[k].slice(e.start,e.end)!==e.text)residual.push('table: '+row.join(' | '));
 }
 if(r.status!==200||residual.length)failures.push({route,status:r.status,residual:[...new Set(residual)]});checked++;
 }catch(e){failures.push({route,error:String(e)});}}}));
console.log(JSON.stringify({checked,reports:registry.reports.length+pages.filter(p=>p.startsWith('/charities/')).length,failures}));
if(failures.length)process.exitCode=1;
