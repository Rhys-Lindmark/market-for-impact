type Estimate={key:string;line:string;basis:string;scope:string;priceUSD:number|null;costUSD:number|null;units:number|null;denominatorLabel?:string;sources:{id:string;title:string;url:string}[]};
const money=(n:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(n);
const count=(n:number)=>new Intl.NumberFormat('en-US',{maximumSignificantDigits:6}).format(n);

export default function NativeUnitCost({estimate,reportHref}:{estimate:Estimate;reportHref:string}){
  // Keep only the existing DALY line when no defensible native denominator exists.
  if(estimate.priceUSD===null)return null;
  return <div className="sf-home-native-unit" data-native-unit={estimate.key} data-native-price={estimate.priceUSD??undefined}>
    <p><strong>{estimate.line}</strong><span className="sf-home-native-basis">{estimate.basis}</span></p>
    <details><summary>Calculation and scope</summary>
      {estimate.costUSD!==null&&estimate.units!==null&&estimate.priceUSD!==null&&<p data-native-calculation>{money(estimate.costUSD)} ÷ {count(estimate.units)} {estimate.denominatorLabel} ≈ {money(estimate.priceUSD)} per unit, before headline rounding.</p>}
      <p>{estimate.scope}</p>
      <p><a href={reportHref}>Report assumptions</a>{estimate.sources.map(source=><span key={source.id}> · <a href={source.url}>{source.title}</a></span>)}</p>
    </details>
  </div>;
}
