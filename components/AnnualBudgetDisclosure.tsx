import {annualBudgetSupplement,annualBudgetLabel} from '@/lib/annual-budget-supplements.mjs';
export default function AnnualBudgetDisclosure({edition,slug}:{edition:string;slug:string}){
 const budget=annualBudgetSupplement(edition,slug);if(!budget)return null;
 return <div data-budget-supplement data-budget-kind={budget.kind} data-budget-amount={budget.amountUSD}>
  <h3>Annual size figure used in comparisons</h3>
  <p><strong>{annualBudgetLabel(budget)} — {budget.label}.</strong> {budget.period}.</p>
  <p>{budget.note}</p>
  {budget.rangeUSD&&<p>Planning sensitivity range: {budget.rangeUSD.map((n:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n)).join('–')}. This is not a confidence interval.</p>}
  <p>{budget.sources.map((source:{title:string;url:string},i:number)=><span key={source.url}>{i>0?' · ':''}<a href={source.url}>{source.title}</a></span>)} · Reviewed {budget.reviewedAt}.</p>
 </div>;
}
