import {impactMetric} from '@/lib/impact-metric.mjs';
import {formatNativeUnitMoney} from '@/lib/featured-unit-costs.mjs';
import {annualBudgetLabel} from '@/lib/annual-budget-supplements.mjs';

type Estimate={key:string;lead?:string;unit?:string;scope:string;priceUSD:number|null};
type Budget={amountUSD:number;kind:string;period:string;note?:string;scope?:string;year?:number}|null;
export default function NativeUnitCost({estimate,reportHref,comparisonPrice,budget}:{estimate:Estimate;reportHref:string;comparisonPrice:string;budget:Budget}){
  const hasNative=estimate.priceUSD!==null;
  return <p className="sf-home-cost-effectiveness" data-cost-effectiveness>
    {hasNative&&<><span data-native-unit={estimate.key} data-native-price={estimate.priceUSD}>{estimate.lead??'About'} <strong>{formatNativeUnitMoney(estimate.priceUSD!)}</strong> {estimate.unit}{estimate.unit?.endsWith('.')?'':'.'}</span><sup><a href={reportHref} title={estimate.scope} aria-label="Service-cost source and assumptions">[1]</a></sup>{' '}</>}
    <span data-daly-comparison>We estimate <strong>{comparisonPrice}</strong> per {impactMetric().label}.</span><sup><a href={reportHref} aria-label="Impact-estimate source and assumptions">[{hasNative?'2':'1'}]</a></sup>
    {' '}<span data-organization-budget={budget?.amountUSD}>
      {budget?<>{budget.kind==='historical-proxy'?'Historical program budget was ':budget.scope==='program'?'Yearly program budget is ':budget.kind==='estimate'?'Estimated nonprofit yearly budget is ':budget.kind==='reported-year'?'Nonprofit yearly budget was ':'Nonprofit yearly budget is '}<strong>{annualBudgetLabel(budget).replace(/^~/,'')}</strong>{budget.year?` (${budget.year})`:''}.</>:'Nonprofit yearly budget is not available.'}
    </span>{budget&&<sup><a href={reportHref+'#annual-expenses'} title={[budget.period,budget.note].filter(Boolean).join('. ')} aria-label="Annual-budget source and scope">[{hasNative?'3':'2'}]</a></sup>}
  </p>;
}
