import {impactMetadata} from '@/lib/impact-metadata.mjs';
import {impactNode} from '@/components/ImpactMetric';
import {impactMetric,impactUnitExplanation} from '@/lib/impact-metric.mjs';
import type { Metadata } from 'next';
/* eslint-disable @next/next/no-html-link-for-pages -- Native navigation avoids the existing Vinext prefetch failure. */
import {unifiedResearch} from '@/lib/unified-research-index';
import {researchListDescription} from '@/lib/research-list-copy.mjs';
import ResearchExpenses from '@/components/ResearchExpenses';
import {researchListPrice} from '@/lib/research-list-price.mjs';
import styles from '../../research/research-index.module.css';
import '../../givebetter.css';
import '../../sf-home.css';
export const metadata:Metadata=impactMetadata({title:'GiveBetter x SF Research',description:'Bay Area research ordered by estimated cost per ten combined health and income-equivalent years.',alternates:{canonical:'https://ai.rhyslindmark.com/givebetter/san-francisco/all'}});
export default function ResearchIndex(){
 return impactNode(<div className="givebetter"><header className="givebetter-masthead"><a href="/san-francisco">Give<span>Better</span> <small>x SF</small></a></header><main className={styles.shell}>
  <section className={styles.intro}><h1>GiveBetter x SF Research</h1><p>Estimated {impactMetric().priceLabel} in the San Francisco Bay Area. {impactUnitExplanation}</p><p className={styles.caveat}>Sorted by modeled cost, not recommendation strength. These are uncertain research estimates, not verified donation offers. Cost boundaries differ; see each report before comparing.</p><p><a href="/san-francisco">Our giving shortlist</a> · <a href="/research/city-theory">What we learned across all reports</a></p></section>
  <section aria-label="Organization research" id="top-research"><table className={styles.table} data-research-table>
   <caption>{unifiedResearch.length} Bay Area reviews, ordered by estimated {impactMetric().priceLabel}. Only benefits quantified in each report are credited; unmodeled regional spillovers are excluded.</caption>
   <thead><tr><th scope="col">Organization</th><th scope="col">$ per better life</th><th scope="col">Annual budget</th></tr></thead>
   <tbody>{unifiedResearch.map(item=>{const price=researchListPrice(item.localUsdPerTenQalys,item.organization);const detail=[`${item.estimateGeography} estimate.`,item.localStatus,price.detail].filter(Boolean).join(' ');return <tr key={item.href} data-research-slug={item.href.split('/').at(-1)} data-geography={item.scope} data-estimate-geography={item.estimateGeography} data-cost-per-ten-qalys={item.localUsdPerTenQalys??undefined}>
    <th scope="row"><a className={styles.rowLink} href={item.href}><strong>{item.organization}</strong><span>{researchListDescription(item.program)}</span></a></th>
    <td><a href={item.href} title={detail} aria-label={`${item.organization}: ${price.label} per ${impactMetric().label}. ${detail}`}>{price.label}</a>{price.note&&<small>{price.note}</small>}</td>
    <td className={styles.expenses}><ResearchExpenses slug={item.href.split('/').at(-1)!} /></td>
   </tr>})}</tbody>
  </table></section>
  <p className={styles.expenseNote}>Expenses include programs, administration and fundraising. Fiscal years, sources and accounting scope are listed in each report.</p>
  <footer className={styles.footer}><a href="/san-francisco/all">All San Francisco research</a><span className="sf-footer-separator" aria-hidden="true">·</span><a href="/all">All cities and regions</a></footer>
 </main></div>);
}
