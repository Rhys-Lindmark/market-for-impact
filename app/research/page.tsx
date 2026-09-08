import type { Metadata } from 'next';
/* eslint-disable @next/next/no-html-link-for-pages -- Preserve native navigation; Vinext prefetch failed in production on the existing research surface. */
import { sortedResearchPrograms } from '@/lib/sf-research-index';
import styles from './research-index.module.css';

export const metadata: Metadata = {
  title: 'All San Francisco charity research | Market for Impact',
  description: 'Compare program-specific research by estimated dollars per 10 incremental QALYs. Read the evidence, models, uncertainty and funding constraints.',
};

export default function ResearchIndex() {
  return <main className={styles.shell}>
    <header className={styles.nav}>
      <a className="brand" href="/"><span className="brand-mark">M</span><span>Market for Impact</span></a>
      <a href="/">← Our top four</a>
    </header>
    <section className={styles.intro}>
      <p className="kicker">SAN FRANCISCO · RESEARCH LIBRARY</p>
      <h1>Rest of the research.</h1>
      <p>{sortedResearchPrograms.length} program reviews, ordered by our central estimate of <strong>dollars per better life: 10 incremental QALYs</strong>. Lower is better.</p>
      <p className={styles.caveat}>These are uncertain research estimates, not verified donation offers. Cost boundaries and evidence quality differ; every report explains the assumptions and what could change our view.</p>
    </section>
    <section aria-label="San Francisco program research" id="top-research">
      <div className={styles.columnLabels} aria-hidden="true"><span>PROGRAM & RESEARCH</span><span>ESTIMATED $ / 10 QALYs</span></div>
      <ol className={styles.list}>
        {sortedResearchPrograms.map(item => <li key={item.href} data-research-slug={item.href.split('/').at(-1)} data-cost-per-ten-qalys={item.centralUsdPerTenQalys}>
          <article className={styles.card}>
            <div><p className={styles.organization}>{item.organization}</p><h2><a href={item.href}>{item.program}</a></h2><p>{item.overview}</p><a className={styles.reportLink} href={item.href}>Read the research →</a></div>
            <div className={styles.price}><strong>{item.betterLifePrice}</strong><span>per 10 incremental QALYs</span><small>Exploratory estimate<br />Funding room unverified</small></div>
          </article>
        </li>)}
      </ol>
    </section>
    <footer className={styles.footer}>
      <a href="/research/city-theory">What makes city giving cost-effective? →</a>
      <a href="/research/large-bay-nonprofits">Five large Bay nonprofits: separate regional comparison →</a>
      <a href="/archive">Cross-cause research archive →</a>
    </footer>
  </main>;
}
