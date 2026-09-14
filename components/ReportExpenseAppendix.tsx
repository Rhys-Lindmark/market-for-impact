import data from '@/data/research-expenses.json';
import {expenseSummary} from '@/lib/research-expenses.mjs';
import {unifiedResearch} from '@/lib/unified-research-index';

type ExpenseRecord={entity:string;basis:string;note?:string;sources?:string[];years:{year:number;expenses:number|null;source:string;fullYear?:boolean}[]};
const records=data.organizations as Record<string,ExpenseRecord>;
const normalize=(name:string)=>name.normalize('NFKC').toLocaleLowerCase('en-US').replace(/[’‘]/g,"'").replace(/[–—]/g,'-').trim();
const money=(value:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(value);
// Report titles differ from directory labels for these verified existing routes.
const reportAliases:Record<string,string>={
 [normalize('Berkeley NEED — Needle Exchange Emergency Distribution')]:'berkeley-need',
 [normalize('Ear of the Lion Foundation of California–Nevada')]:'ear-of-lion',
 [normalize('HIV Education and Prevention Project of Alameda County (HEPPAC)')]:'heppac',
 [normalize('HOPE: Healing, Overdose Prevention, and Education')]:'hope-pacifica',
 [normalize('Richmond Area Multi-Services (RAMS)')]:'rams',
 [normalize('Bayview Hunters Point Foundation for Community Improvement')]:'bayview-hunters-point-foundation',
};

// Exact display/entity names only; never infer a match from a fuzzy name or sponsor.
export function expenseRecordForOrganization(organization:string) {
 const name=normalize(organization);
 const slugs=new Set([
  ...(reportAliases[name]?[reportAliases[name]]:[]),
  ...unifiedResearch.filter(row=>normalize(row.organization)===name).map(row=>row.href.split('/').at(-1)!).map(slug=>slug==='ear-of-the-lion'?'ear-of-lion':slug).filter(slug=>Object.hasOwn(records,slug)),
  ...Object.entries(records).filter(([,record])=>normalize(record.entity)===name).map(([slug])=>slug),
 ]);
 return slugs.size===1?records[[...slugs][0]]:undefined;
}

export default function ReportExpenseAppendix({organization,slug}:{organization:string;slug?:string}) {
 const record=slug?records[slug==='ear-of-the-lion'?'ear-of-lion':slug]:expenseRecordForOrganization(organization);
 const {average}=expenseSummary(record);
 const years=[...(record?.years??[])].sort((a,b)=>b.year-a.year);
 return <section id="annual-expenses" data-expense-appendix data-average-expenses={average??undefined}>
  <h2>Annual expenses: years and sources</h2>
  <p><strong>Average annual expenses (three consecutive fiscal years): {average===null?'Not available':money(average)}.</strong> Organization size is separate from the modeled cost-effectiveness of a donation.</p>
  <p>{record?.entity??organization}</p>
  <p>{record?.basis??'Three years of organization-level expenses have not yet been verified for this report. No other organization or fiscal sponsor budget has been substituted.'}</p>
  {years.length>0&&<ul>{years.map((row,i)=><li key={row.year+'-'+i}><a href={row.source} target="_blank" rel="noreferrer">FY{row.year}: {row.expenses===null?'Unresolved':money(row.expenses)}</a>{row.fullYear===false&&' (partial fiscal year; excluded from the three-year mean)'}</li>)}</ul>}
  {average===null&&years.length>0&&<p>Three consecutive full-year expense totals are not verified.</p>}
  {record?.note&&<p>{record.note}</p>}
  {!!record?.sources?.length&&<ul>{record.sources.map((source,i)=><li key={source}><a href={source} target="_blank" rel="noreferrer">Additional expense source {i+1}</a></li>)}</ul>}
 </section>;
}
