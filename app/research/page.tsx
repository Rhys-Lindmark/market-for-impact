import type { Metadata } from 'next';
/* eslint-disable @next/next/no-html-link-for-pages -- Preserve native navigation; Vinext prefetch failed in production on the existing research surface. */
import { sortedResearchPrograms } from '@/lib/sf-research-index';
import styles from './research-index.module.css';
import '../givebetter.css';

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
      <table className={styles.table}><caption>{sortedResearchPrograms.length} reviews, lowest central estimated cost first. Cost scopes and evidence quality vary; see each report.</caption><thead><tr><th scope="col">Organization / program</th><th scope="col">$ / better life</th></tr></thead><tbody>
        {sortedResearchPrograms.map(item => <tr key={item.href} data-research-slug={item.href.split('/').at(-1)} data-cost-per-ten-qalys={item.centralUsdPerTenQalys}>
          <th scope="row"><a className={styles.rowLink} href={item.href}><strong>{item.organization}</strong><span>{item.program}</span></a></th>
          <td><a href={item.href} aria-label={`${item.organization}: ${item.betterLifePrice.replace('≈ ', '')} per better life`}>{item.betterLifePrice.replace('≈ ', '')}</a></td>
        </tr>)}
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
