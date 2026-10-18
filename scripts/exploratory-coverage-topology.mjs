// Inventory-only inspection; does not establish scientific acceptance.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
const slugs=['curry-senior-center','eviction-defense-collaborative','farming-hope','five-keys','harm-reduction-therapy-center','homeless-youth-alliance','huckleberry-youth-programs','institute-on-aging','jcyc','larkin-street','lyon-martin','mission-neighborhood-centers','openhouse','progress-foundation','project-open-hand','rams','sf-marin-food-bank','self-help-for-the-elderly','sf-lgbt-center','tenderloin-housing-clinic','united-playaz'];
const hash=path=>createHash('sha256').update(fs.readFileSync(path)).digest('hex');
const library=fs.readFileSync('app/san-francisco/ResearchLibrary.tsx','utf8');
const routeEins=new Map([...library.matchAll(/\['(\d+)', '(\/charities\/[^']+)'\]/g)].map(m=>[m[2],m[1]]));
const funnel=JSON.parse(fs.readFileSync('data/san-francisco/research-funnel-v1.json','utf8'));
const api=fs.readdirSync('app/api',{withFileTypes:true}).filter(x=>x.isDirectory()).map(x=>'app/api/'+x.name+'/route.ts').filter(p=>fs.existsSync(p));
const boundaries=slugs.map(slug=>{
 const reportFile='app/charities/'+slug+'/page.tsx',text=fs.readFileSync(reportFile,'utf8');
 const imports=[...text.matchAll(/from\s*['"](@\/(?:data|lib)\/[^'"]+)['"]/g)].map(x=>x[1].slice(2));
 const inputs=imports.filter(p=>p.startsWith('data/'));
 const consumers=api.filter(p=>{
  const source=fs.readFileSync(p,'utf8');
  return inputs.some(input=>source.includes(input)||source.includes(input.slice(5)));
 });
 const route='/charities/'+slug,ein=routeEins.get(route),row=funnel.deepDiveRows.find(row=>row.ein===ein);
 if(!ein||!row)throw Error('Route not linked to original funnel: '+route);
 return {slug,organization:row.displayName,ein,route,reportFile,reportSha256:hash(reportFile),imports:imports.map(path=>({path,sha256:hash(path)})),apiConsumers:consumers.map(path=>({path,sha256:hash(path)})),historicalReportStatus:row.reportStatus,historicalCostEffectivenessStatus:row.costEffectivenessStatus,status:'source-and-health-income-assessment-required',accepted:false};
});
if(boundaries.length!==21||boundaries.some(b=>!b.imports.length))throw Error('Incomplete topology');
console.log(JSON.stringify({capturedAt:new Date().toISOString(),basis:'Root route/import topology only; not organization-specific research or independent acceptance',boundaries},null,2));
