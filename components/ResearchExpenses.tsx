import data from '@/data/research-expenses.json';
import {expenseSummary} from '@/lib/research-expenses.mjs';
const money = (value:number) => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',notation:'compact',minimumFractionDigits:value>=1e6?1:0,maximumFractionDigits:value>=1e6?1:0}).format(value);
export default function ResearchExpenses({slug}:{slug:string}) {
 const recordSlug=slug==='ear-of-the-lion'?'ear-of-lion':slug;
 const record=data.organizations[recordSlug as keyof typeof data.organizations];
 const {average}=expenseSummary(record);
 return <a href={'/charities/'+slug+'#annual-expenses'} data-average-expenses={average??undefined} aria-label={'Average annual expenses: '+(average===null?'not available':money(average))+'; read years and sources in the report'}>{average===null?'Not available':money(average)}</a>;
}
