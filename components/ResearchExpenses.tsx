import data from '@/data/research-expenses.json';
import {expenseSummary} from '@/lib/research-expenses.mjs';
type Record = {entity:string; basis:string; note?:string; sources?:string[]; years:{year:number; expenses:number|null; source:string}[]};
const records = data.organizations as {[slug:string]:Record};
const money = (value:number) => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',notation:'compact',minimumFractionDigits:value>=1e6?1:0,maximumFractionDigits:value>=1e6?1:0}).format(value);
export default function ResearchExpenses({slug}:{slug:string}) {
 const record=records[slug];
 const {years,average}=expenseSummary(record);
 return <details data-expense-details data-average-expenses={average??undefined}>
  <summary aria-label={'Annual expenses: '+(average===null?'not available':money(average))+'; show years and sources'}>{average===null?'Not available':money(average)}{average!==null&&<span data-expense-years>{years.at(-1)!.year}–{String(years[0].year).slice(-2)}</span>}</summary>
  <div><p>{record?.entity??'Organization expenses'}</p>
   <p>{record?.basis??'Three years of organization-level expenses have not yet been verified.'}</p>
   {years.length>0&&<ul>{years.map(row=><li key={row.year}><a href={row.source} target="_blank" rel="noreferrer">FY{row.year}: {row.expenses===null?'Unresolved':new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(row.expenses)}</a></li>)}</ul>}
   {average===null&&years.length>0&&<p>Three consecutive full-year expense totals are not verified.</p>}
   {record?.note&&<p>{record.note}</p>}
   {record?.sources?.map((source,i)=><a key={source} href={source} target="_blank" rel="noreferrer">Source {i+1}</a>)}
  </div>
 </details>;
}
