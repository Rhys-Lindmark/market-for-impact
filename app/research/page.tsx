import type { Metadata } from 'next';
/* eslint-disable @next/next/no-html-link-for-pages -- Native navigation avoids the existing Vinext prefetch failure. */
import {unifiedResearch} from '@/lib/unified-research-index';
import styles from './research-index.module.css';
import '../givebetter.css';
const price=(value:number|null)=>value===null?'Not estimated':new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',notation:'compact',minimumFractionDigits:value>=1e6&&value<1e9?1:0,maximumFractionDigits:value>=1e6&&value<1e9?1:0}).format(value);
export const metadata:Metadata={title:'GiveBetter x SF Research',description:'Research ordered by estimated cost per 10 additional SF or Bay Area QALYs.'};
export default function ResearchIndex(){
 return <div className="givebetter"><header className="givebetter-masthead"><a href="/">Give<span>Better</span> <small>x SF</small></a></header><main className={styles.shell}>
  <section className={styles.intro}><h1>GiveBetter x SF Research</h1><p>Estimated dollars per better life in San Francisco or the Bay Area (10 QALYs).</p><p className={styles.caveat}>These are uncertain research estimates, not verified donation offers. International comparisons are preserved in the archive.</p></section>
  <section aria-label="Organization research" id="top-research"><table className={styles.table}>
   <caption>{unifiedResearch.length} SF-relevant reviews, ordered by the most local modeled estimate available. SF estimates take precedence; otherwise the Bay Area estimate is shown. Local impact shares may be assumptions rather than measured recipient shares; each report explains the basis.</caption>
   <thead><tr><th scope="col">Organization</th><th scope="col">$ per better life</th></tr></thead>
   <tbody>{unifiedResearch.map(item=><tr key={item.href} data-research-slug={item.href.split('/').at(-1)} data-geography={item.scope} data-estimate-geography={item.estimateGeography} data-cost-per-ten-qalys={item.localUsdPerTenQalys??undefined}>
    <th scope="row"><a className={styles.rowLink} href={item.href}><strong>{item.organization}</strong><span>{item.program}</span></a></th>
    <td><a href={item.href} title={`${item.estimateGeography} estimate. ${item.localStatus}`} aria-label={item.organization+': '+price(item.localUsdPerTenQalys)+' per 10 '+item.estimateGeography+' QALYs. '+item.localStatus}>{price(item.localUsdPerTenQalys)}<small>{item.estimateGeography==='San Francisco'?'SF':'Bay Area'}</small>{item.href==='/charities/bayview-hunters-point-foundation'&&<small>Subjective 65% SF-resident share</small>}</a></td>
   </tr>)}</tbody>
  </table></section>
  <footer className={styles.footer}><a href="/">Our top charities</a><a href="/research/city-theory">What makes city giving cost-effective?</a><a href="/research/large-bay-nonprofits">Regional research</a><a href="/archive/international-research">International research archive</a><a href="/archive">Full archive</a></footer>
 </main></div>;
}
