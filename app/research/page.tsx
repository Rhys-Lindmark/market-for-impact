import type { Metadata } from 'next';
/* eslint-disable @next/next/no-html-link-for-pages -- Preserve native navigation; Vinext prefetch failed in production on the existing research surface. */
import { sortedResearchPrograms } from '@/lib/sf-research-index';
import { internationalResearch } from '@/lib/international-research-index';
import styles from './research-index.module.css';
import '../givebetter.css';
const price = (value:number|null) => value === null ? 'Not yet estimated' : new Intl.NumberFormat('en-US', {style:'currency',currency:'USD',notation:'compact',minimumFractionDigits:value>=1_000_000&&value<1_000_000_000?1:0,maximumFractionDigits:value>=1_000_000_000?0:value>=1_000_000?1:0}).format(value);

export const metadata: Metadata = {
  title: 'GiveBetter x SF Research',
  description: 'Compare program-specific research by estimated dollars per 10 incremental QALYs. Read the evidence, models, uncertainty and funding constraints.',
};

export default function ResearchIndex() {
  return <div className="givebetter"><header className="givebetter-masthead"><a href="/">Give<span>Better</span> <small>x SF</small></a></header><main className={styles.shell}>
    <section className={styles.intro}>
      <h1>GiveBetter x SF Research</h1>
      <p>Estimated dollars per better life (10 QALYs).</p>
      <p className={styles.caveat}>These are uncertain research estimates, not verified donation offers.</p>
    </section>
    <section aria-label="San Francisco program research" id="top-research">
      <table className={styles.table}><caption>{sortedResearchPrograms.length} reviews, lowest central estimated cost first. Cost scopes and evidence quality vary; see each report.</caption><thead><tr><th scope="col">Organization</th><th scope="col">$ per better life</th></tr></thead><tbody>
        {sortedResearchPrograms.map(item => <tr key={item.href} data-research-slug={item.href.split('/').at(-1)} data-cost-per-ten-qalys={item.centralUsdPerTenQalys}>
          <th scope="row"><a className={styles.rowLink} href={item.href}><strong>{item.organization}</strong><span>{item.program}</span></a></th>
          <td><a href={item.href} aria-label={`${item.organization}: ${price(item.centralUsdPerTenQalys)} per better life`}>{price(item.centralUsdPerTenQalys)}</a></td>
        </tr>)}
      </tbody></table>
    </section>
    <section aria-label="International organization research">
      <h2>International research</h2>
      <p>Global health estimates, separate from the SF ranking. No direct Bay Area benefit is credited; indirect local effects are unknown.</p>
      <table className={styles.table}><caption>Central dollars per 10 global QALYs. Cost scopes and evidence vary.</caption><thead><tr><th scope="col">Organization</th><th scope="col">$ per better life globally</th></tr></thead><tbody>
        {internationalResearch.map(item=><tr key={item.href} data-international-slug={item.href.split('/').at(-1)}><th scope="row"><a className={styles.rowLink} href={item.href}><strong>{item.organization}</strong><span>{item.program}</span></a></th><td><a href={item.href}>{price(item.globalUsdPer10Qaly)}</a></td></tr>)}
      </tbody></table>
    </section>
    <footer className={styles.footer}>
      <a href="/">Our top charities</a>
      <a href="/research/city-theory">What makes city giving cost-effective?</a>
      <a href="/research/large-bay-nonprofits">Regional research</a>
      <a href="/archive">Archive</a>
    </footer>
  </main></div>;
}
