import data from '../data/annual-budget-supplements.json' with {type:'json'};
import {expenseSummary} from './research-expenses.mjs';
import {expenseAverage} from './geography-reports.mjs';

// Supplemental size figures do not change model costs or fiscal comparability.
export function annualBudgetSupplement(edition,slug){return data.entries[edition+'/'+slug]??null;}
export function editionAnnualBudget(report){
 const average=expenseAverage(report);
 return average!==null?{amountUSD:average,kind:'average',label:'Three-year average',period:'Three comparable consecutive fiscal years',note:'Organization-level reported expenses.',sources:[]}:annualBudgetSupplement(report.edition,report.slug);
}
export function annualBudgetLabel(budget){
 if(!budget)return 'Not estimated';
 const value=new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',notation:'compact',maximumFractionDigits:budget.amountUSD>=1e6?1:0}).format(budget.amountUSD);
 return (['estimate','historical-proxy'].includes(budget.kind)?'~':'')+value;
}

// A program-specific model must use its program allocation, even when institutional accounts exist.
export function sfAnnualBudget(slug,record){
 const supplement=annualBudgetSupplement('san-francisco',slug);
 if(supplement?.overridesOrganizationAverage)return supplement;
 const {average}=expenseSummary(record);
 return average!==null?{amountUSD:average,kind:'average',label:'Three-year average',period:'Three consecutive full fiscal years',note:'Reported organization expenses.'}:supplement;
}
