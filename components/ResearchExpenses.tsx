import data from '@/data/research-expenses.json';
import {expenseSummary,historicalContractExpenseSummary} from '@/lib/research-expenses.mjs';
import {annualBudgetSupplement,annualBudgetLabel} from '@/lib/annual-budget-supplements.mjs';
const money = (value:number) => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',notation:'compact',minimumFractionDigits:value>=1e6?1:0,maximumFractionDigits:value>=1e6?1:0}).format(value);
export default function ResearchExpenses({slug}:{slug:string}) {
 const recordSlug=slug==='ear-of-the-lion'?'ear-of-lion':slug;
 const record=data.organizations[recordSlug as keyof typeof data.organizations];
 const {average}=expenseSummary(record);
 const candidate=annualBudgetSupplement('san-francisco',slug);
 const supplement=average===null||candidate?.overridesOrganizationAverage?candidate:null;
 if(supplement)return <a href={'/charities/'+slug+'#annual-expenses'} data-annual-budget={supplement.amountUSD} data-budget-kind={supplement.kind} title={[supplement.label,supplement.period,supplement.note].join('. ')}>{annualBudgetLabel(supplement)}<small>{supplement.label}</small></a>;
 const historical=historicalContractExpenseSummary(record);
 const useHistorical=average===null&&historical.average!==null;
 const period=useHistorical?'FY'+historical.years.at(-1)!.year+'–'+historical.years[0].year:'';
 const label=useHistorical?'Historical city-contract spending average: '+money(historical.average!)+'; '+period+'; not current whole-project expenses':'Average annual expenses: '+(average===null?'not available':money(average));
 return <a href={'/charities/'+slug+'#annual-expenses'} data-average-expenses={average??undefined} data-historical-contract-average={useHistorical?historical.average:undefined} aria-label={label+'; read years and sources in the report'} title={useHistorical?label:undefined}>{useHistorical?<>{money(historical.average!)}<small>{period} city contract only</small></>:average===null?'Not available':money(average)}</a>;
}
