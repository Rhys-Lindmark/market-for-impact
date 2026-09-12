// Read-only collection: inspect stdout before applying it to the expense registry.
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const records=JSON.parse(fs.readFileSync('data/research-expenses.json','utf8')).organizations;
const get=url=>execFileSync('curl',['--compressed','-fLs','--max-time','15',url],{encoding:'utf8',maxBuffer:5000000});
const field=(html,name)=>html.match(new RegExp('id="[^"]*/'+name+'\\[1\\]"[^>]*>([^<]*)'))?.[1];
const parseDate=value=>{const m=value?.match(/^(\d{2})-(\d{2})-(\d{4})$/);return m?new Date(m[3]+'-'+m[1]+'-'+m[2]+'T00:00:00Z'):null;};
const out={};
for(const slug of process.argv.slice(2)){
 const record=records[slug]; if(!record?.ein)continue;
 const years=new Map();const errors=[];
 try{
  const listing=get('https://projects.propublica.org/nonprofits/organizations/'+record.ein);
  const ids=[...new Set([...listing.matchAll(/(\d{18})\/full/g)].map(m=>m[1]))].slice(0,3);
  for(const id of ids){
   const source='https://projects.propublica.org/nonprofits/full_text/'+id+'/IRS990';
   const html=get(source);
   if(field(html,'EIN')?.replace(/\D/g,'')!==record.ein)throw Error('Identity mismatch');
   const end=parseDate(field(html,'TaxPeriodEndDt')),begin=parseDate(field(html,'TaxPeriodBeginDt'));
   const days=begin&&end?(end-begin)/86400000:null;
   const amount=Number(field(html,'CYTotalExpensesAmt')?.replaceAll(',',''));
   if(!end||days===null||days<350||days>380||!Number.isFinite(amount)||amount<=0){errors.push(id+': not a verified positive full-year expense');continue;}
   const year=end.getUTCFullYear();
   if(!years.has(year))years.set(year,{year,expenses:amount,source});
  }
 }catch(e){errors.push(e.message);}
 out[slug]={...record,years:[...years.values()].sort((a,b)=>b.year-a.year),note:'Original returns checked for legal identity, full-year period and total expenses. '+(errors.length?errors.join('; '):'Latest three linked original returns.'),collectionErrors:errors};
}
console.log(JSON.stringify(out));
