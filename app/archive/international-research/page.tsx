import type {Metadata} from 'next';
/* eslint-disable @next/next/no-html-link-for-pages -- Native navigation avoids the existing Vinext prefetch failure. */
import {internationalResearch} from '@/lib/international-research-index';
import styles from '../../research/research-index.module.css';
import '../../givebetter.css';

const price=(value:number|null)=>value===null?'Not estimated':new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',notation:'compact',minimumFractionDigits:value>=1e6&&value<1e9?1:0,maximumFractionDigits:value>=1e6&&value<1e9?1:0}).format(value);

export const metadata:Metadata={
 title:'International research archive — GiveBetter x SF',
 description:'International comparison reports preserved outside the San Francisco and Bay Area donor ranking.'
};

export default function InternationalResearchArchive(){
 return <div className="givebetter"><header className="givebetter-masthead"><a href="/">Give<span>Better</span> <small>x SF</small></a></header><main className={styles.shell}>
  <section className={styles.intro}><h1>International research archive</h1><p>Global-health comparison reports, outside the San Francisco and Bay Area ranking.</p><p className={styles.caveat}>No direct Bay Area health benefit is credited. Global estimates are retained for calibration and do not answer which gift helps local residents most.</p></section>
  <section aria-label="International organization research"><table className={styles.table}>
   <caption>{internationalResearch.length} archived international comparison reports, ordered by estimated global cost per 10 QALYs.</caption>
   <thead><tr><th scope="col">Organization</th><th scope="col">$ per global better life</th></tr></thead>
   <tbody>{internationalResearch.map(item=><tr key={item.href} data-research-slug={item.href.split('/').at(-1)} data-geography="International" data-cost-per-ten-qalys={item.globalUsdPer10Qaly??undefined}>
    <th scope="row"><a className={styles.rowLink} href={item.href}><strong>{item.organization}</strong><span>{item.program}</span></a></th>
    <td><a href={item.href} aria-label={item.organization+': '+price(item.globalUsdPer10Qaly)+' per 10 global QALYs'}>{price(item.globalUsdPer10Qaly)}<small>Global</small></a></td>
   </tr>)}</tbody>
  </table></section>
  <footer className={styles.footer}><a href="/research">SF and Bay Area research</a><a href="/archive">Full archive</a><a href="/">Our top charities</a></footer>
 </main></div>;
}
