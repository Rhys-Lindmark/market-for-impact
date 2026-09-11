import type { Metadata } from 'next';
/* eslint-disable @next/next/no-html-link-for-pages -- Native navigation avoids the existing Vinext prefetch failure. */
import {unifiedResearch} from '@/lib/unified-research-index';
import {researchListDescription} from '@/lib/research-list-copy.mjs';
import readiness from '@/data/donor-readiness.json';
import styles from './research-index.module.css';
import '../givebetter.css';
const price=(value:number|null)=>value===null?'Not estimated':new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',notation:'compact',minimumFractionDigits:value>=1e6&&value<1e9?1:0,maximumFractionDigits:value>=1e6&&value<1e9?1:0}).format(value);
export const metadata:Metadata={title:'GiveBetter x SF Research',description:'Bay Area research ordered by estimated cost per 10 additional quality-adjusted life years.'};
export default function ResearchIndex(){
 return <div className="givebetter"><header className="givebetter-masthead"><a href="/">Give<span>Better</span> <small>x SF</small></a></header><main className={styles.shell}>
  <section className={styles.intro}><h1>GiveBetter x SF Research</h1><p>Estimated dollars per better life in the San Francisco Bay Area (10 QALYs).</p><p className={styles.caveat}>Sorted by modeled cost, not recommendation strength. These are uncertain research estimates, not verified donation offers. Cost boundaries differ; see each report before comparing.</p><p><a href="/">Our giving shortlist</a> · <a href="/research/city-theory">What we learned from 100 reports</a></p></section>
  <section aria-label="Organization research" id="top-research"><table className={styles.table}>
   <caption>{unifiedResearch.length} Bay Area reviews, ordered by estimated cost per 10 local QALYs. Only benefits quantified in each report are credited; unmodeled regional spillovers are excluded.</caption>
   <thead><tr><th scope="col">Organization</th><th scope="col">$ per better life</th></tr></thead>
   <tbody>{unifiedResearch.map(item=><tr key={item.href} data-research-slug={item.href.split('/').at(-1)} data-geography={item.scope} data-estimate-geography={item.estimateGeography} data-cost-per-ten-qalys={item.localUsdPerTenQalys??undefined}>
    <th scope="row"><a className={styles.rowLink} href={item.href}><strong>{item.organization}</strong><span>{researchListDescription(item.program)}</span>{readiness.reviews.filter(row=>item.href==='/charities/'+row.slug).map(row=><span className={styles.readiness} key={row.slug}>{row.short}</span>)}</a></th>
    <td><a href={item.href} title={`${item.estimateGeography} estimate. ${item.localStatus}`} aria-label={item.organization+': '+price(item.localUsdPerTenQalys)+' per 10 '+item.estimateGeography+' QALYs. '+item.localStatus}>{price(item.localUsdPerTenQalys)}</a></td>
   </tr>)}</tbody>
  </table></section>
  <footer className={styles.footer}><a href="/">Our top charities</a><a href="/research/city-theory">What makes city giving cost-effective?</a><a href="/research/large-bay-nonprofits">Regional research</a><a href="/archive/expanded-geography-research">Expanded Geography Research</a><a href="/archive">Full archive</a></footer>
 </main></div>;
}
