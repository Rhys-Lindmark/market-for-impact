// Read-only source extraction; output must be reviewed before publication.
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const input=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
const output={};
for(const row of input.rows){
 const years=new Map(row.extractedExpenses.map(y=>[y.fiscalYear,{year:y.fiscalYear,expenses:y.expenseUsd,source:y.sourceUrl}]));
 let originalVerified=false;
 for(const source of row.reportFilingSources??[]){
  if(!source.url.includes('/full_text/')||!source.url.endsWith('/IRS990'))continue;
  try{
   const html=execFileSync('curl',['--compressed','-fLs','--max-time','12',source.url],{encoding:'utf8',maxBuffer:5000000});
   const field=(name)=>{const m=html.match(new RegExp('id="[^"]*/'+name+'\\[1\\]"[^>]*>([^<]*)'));return m?.[1];};
   const ein=field('EIN');
   if(!ein||ein.replace(/\D/g,'')!==row.ein)continue;
   const date=field('TaxPeriodEndDt');
   const year=Number(date?.slice(-4));
   const current=Number(field('CYTotalExpensesAmt')?.replaceAll(',',''));
   const previous=Number(field('PYTotalExpensesAmt')?.replaceAll(',',''));
   if(year>=2023&&year<=2026&&current>0){
    years.set(year,{year,expenses:current,source:source.url});
    if(previous>0)years.set(year-1,{year:year-1,expenses:previous,source:source.url});
    originalVerified=true;
   }
  }catch{/* Preserve missingness rather than substitute a budget. */}
 }
 output[row.slug]={entity:row.legalName,ein:row.ein,basis:'Form 990/990-EZ reported whole-entity expenses; includes program, administration and fundraising costs, but excludes any costs netted against revenue.',note:originalVerified?'Latest original return and prior-year comparative combined with earlier filing data.':'Historical extracted filing window; newer original filings may be available and have not yet been reconciled.',years:[...years.values()].sort((a,b)=>b.year-a.year).slice(0,3)};
}
console.log(JSON.stringify(output));
