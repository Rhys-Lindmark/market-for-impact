import {impactMetric} from '@/lib/impact-metric.mjs';
import {formatNativeUnitMoney} from '@/lib/featured-unit-costs.mjs';

type Estimate={key:string;lead?:string;unit?:string;scope:string;priceUSD:number|null};
export default function NativeUnitCost({estimate,reportHref,comparisonPrice}:{estimate:Estimate;reportHref:string;comparisonPrice:string}){
  const hasNative=estimate.priceUSD!==null;
  return <p className="sf-home-cost-effectiveness" data-cost-effectiveness>
    {hasNative&&<><span data-native-unit={estimate.key} data-native-price={estimate.priceUSD}>{estimate.lead??'About'} <strong>{formatNativeUnitMoney(estimate.priceUSD!)}</strong> {estimate.unit}{estimate.unit?.endsWith('.')?'':'.'}</span><sup><a href={reportHref} title={estimate.scope} aria-label="Service-cost source and assumptions">[1]</a></sup>{' '}</>}
    <span data-daly-comparison>We estimate <strong>{comparisonPrice}</strong> per {impactMetric().label}.</span><sup><a href={reportHref} aria-label="Impact-estimate source and assumptions">[{hasNative?'2':'1'}]</a></sup>
  </p>;
}
