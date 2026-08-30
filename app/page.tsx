'use client';

import { useEffect, useMemo, useState } from 'react';
import coefficientIndex from '@/data/normalized/coefficient-market-summary.json';

type CoefficientMarket = {
  source: { retrievedAt: string; coverageNote: string; url: string };
  summary: { grant_count: number; total_amount_usd: number; latest_decision_date: number; recipient_count: number };
  recent: Array<{ external_id: string; source_url: string | null; recipient: string; recipient_url: string | null; purpose: string; amount_usd: number; decision_date: number; status: string }>;
};

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const compactMoney = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 2 });
const integer = new Intl.NumberFormat('en-US');
const month = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
const day = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

const flowMetrics = [
  { name: 'Coefficient Giving', amount: '$1B+', note: 'directed in 2025', width: 100, color: '#8e6cf0' },
  { name: 'ACE', amount: '$81M', note: 'estimated influenced, cumulative', width: 36, color: '#38a679' },
  { name: 'Giving Green', amount: '$26M', note: 'announced for 2025–26', width: 22, color: '#e2a72e' },
  { name: 'Coefficient careers RFP', amount: '$13.1M', note: 'awarded in Aug 2026', width: 15, color: '#ff7657' },
];

const opportunities = [
  { rank: 1, name: 'Malaria Consortium', intervention: 'Seasonal malaria chemoprevention', cause: 'Global health', evidence: 'Very high', impact: '~$4k / life', room: 'Rolling review', source: 'GiveWell', href: 'https://www.givewell.org/charities/top-charities' },
  { rank: 2, name: 'Against Malaria Foundation', intervention: 'Insecticide-treated nets', cause: 'Global health', evidence: 'Very high', impact: '~$5.5k / life', room: 'Rolling review', source: 'GiveWell', href: 'https://www.givewell.org/charities/top-charities' },
  { rank: 3, name: 'Imagine Worldwide', intervention: 'Adaptive digital education in Malawi', cause: 'Education', evidence: 'Moderate', impact: '~11× cash', room: 'Scale-up', source: 'Founders Pledge', href: 'https://www.founderspledge.com/research/education-evidence-and-recommendations' },
  { rank: 4, name: 'The Humane League', intervention: 'Corporate welfare campaigns', cause: 'Animal welfare', evidence: 'High', impact: '~12 animals / $', room: '$28.7M / yr', source: 'ACE', href: 'https://animalcharityevaluators.org/charity-review/the-humane-league/' },
  { rank: 5, name: 'Clean Air Task Force', intervention: 'Technology-neutral climate policy', cause: 'Climate', evidence: 'Modeled', impact: 'Not comparable', room: 'Funding need', source: 'Giving Green', href: 'https://www.givinggreen.earth/top-climate-nonprofits' },
  { rank: 6, name: 'GiveDirectly', intervention: 'Unconditional cash transfers', cause: 'Global health', evidence: 'Very high', impact: '1× baseline', room: 'High', source: 'Benchmark', href: 'https://www.givedirectly.org/' },
];

export default function Home() {
  const [cause, setCause] = useState('All causes');
  const [query, setQuery] = useState('');
  const [coefficientMarket, setCoefficientMarket] = useState<CoefficientMarket | null>(null);
  const [coefficientError, setCoefficientError] = useState(false);
  useEffect(() => {
    fetch('/api/coefficient-grants').then((response) => {
      if (!response.ok) throw new Error('Grant market unavailable');
      return response.json() as Promise<CoefficientMarket>;
    }).then(setCoefficientMarket).catch(() => setCoefficientError(true));
  }, []);
  const filtered = useMemo(() => opportunities.filter((item) =>
    (cause === 'All causes' || item.cause === cause) &&
    `${item.name} ${item.intervention} ${item.source}`.toLowerCase().includes(query.toLowerCase())
  ), [cause, query]);

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Market for Impact home">
          <span className="brand-mark">M</span>
          <span>Market for Impact</span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#opportunities">Opportunities</a>
          <a href="#flows">Funding flows</a>
          <a href="#methodology">Methodology</a>
        </nav>
        <button className="outline-button">Explore the market <span>↗</span></button>
      </header>

      <section className="hero" id="top">
        <div className="eyebrow"><span className="live-dot" /> Independent impact intelligence</div>
        <h1>Put every dollar<br />where it matters most.</h1>
        <p className="hero-copy">A living market of the world’s most promising funding opportunities—compared across evidence, expected impact, and room for more funding.</p>
        <div className="hero-actions">
          <a className="primary-button" href="#opportunities">Find opportunities <span>→</span></a>
          <a className="text-link" href="#methodology">How we compare impact</a>
        </div>
        <div className="hero-stats" aria-label="Dataset summary">
          <div><strong>{integer.format(coefficientIndex.summary.grantCount)}</strong><span>Coefficient grant records</span></div>
          <div><strong>{compactMoney.format(coefficientIndex.summary.totalPublishedAmountUsd)}</strong><span>published grant amounts</span></div>
          <div><strong>{coefficientIndex.summary.listedFundCount}</strong><span>currently listed funds</span></div>
          <div><strong>Aug 2026</strong><span>sources reviewed</span></div>
        </div>
      </section>

      <section className="market-section" id="opportunities">
        <div className="section-heading">
          <div>
            <p className="kicker">THE OPPORTUNITY MARKET</p>
            <h2>Compare the next dollar.</h2>
          </div>
          <p>These are research leads, not a universal ranking. Unlike outcomes stay visibly unlike until a defensible conversion is available.</p>
        </div>

        <div className="filters">
          <label className="search"><span>⌕</span><input aria-label="Search opportunities" placeholder="Search organizations, interventions, or evaluators" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
          <label className="select-wrap">Cause area<select aria-label="Filter by cause" value={cause} onChange={(event) => setCause(event.target.value)}><option>All causes</option><option>Global health</option><option>Climate</option><option>Animal welfare</option><option>Education</option><option>AI safety</option></select></label>
          <button className="filter-button">More filters <span>＋</span></button>
        </div>

        <div className="table-wrap">
          <table>
            <thead><tr><th>#</th><th>Opportunity</th><th>Cause</th><th>Evidence</th><th>Published metric</th><th>Room for funding</th><th>Research source</th><th /></tr></thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.name}>
                  <td className="rank">{item.rank}</td>
                  <td><strong>{item.name}</strong><span className="subline">{item.intervention}</span></td>
                  <td><span className={`cause-pill ${item.cause.toLowerCase().replace(' ', '-')}`}>{item.cause}</span></td>
                  <td><span className="evidence-dot" />{item.evidence}</td>
                  <td className="mono">{item.impact}</td>
                  <td className="mono">{item.room}</td>
                  <td>{item.source}</td>
                  <td><a className="row-arrow" aria-label={`View source for ${item.name}`} href={item.href} target="_blank" rel="noreferrer">↗</a></td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={8} className="empty">No opportunities match those filters.</td></tr>}
            </tbody>
          </table>
        </div>
        <p className="data-note">Source review: August 2026. Metrics preserve each evaluator’s native unit; “room” can mean a modeled gap, capacity, or open recommendation and is not yet normalized.</p>
      </section>

      <section className="flows-section" id="flows">
        <div className="flow-copy">
          <p className="kicker">THE FLOW OF CAPITAL</p>
          <h2>See where impact funding is actually going.</h2>
          <p>Recommendations reveal what researchers believe. Grants reveal what funders do. Market for Impact connects both.</p>
          <a className="text-link light" href="#methodology">Explore all funding flows <span>→</span></a>
        </div>
        <div className="flow-card">
          <div className="flow-card-head"><div><span>DISCLOSED FUNDING SIGNALS</span><strong>A first map of the ecosystem</strong></div><span className="tag">LATEST</span></div>
          <div className="metric-bars" aria-label="Published funding signals">
            {flowMetrics.map((item) => <div className="metric-row" key={item.name}><div><strong>{item.name}</strong><span>{item.note}</span></div><div className="bar-track"><span style={{ width: `${item.width}%`, background: item.color }} /></div><b>{item.amount}</b></div>)}
          </div>
          <div className="flow-insight"><span>!</span><p><strong>These numbers are intentionally not summed.</strong><br />They mix annual grants, announced allocations, and influenced giving. The grant ledger will separate each type.</p></div>
        </div>
      </section>

      <section className="coefficient-market-section" id="coefficient-market">
        <div className="coefficient-market-heading">
          <div><p className="kicker">THE COEFFICIENT MARKET</p><h2>One index. Fourteen fund lenses.</h2></div>
          <p>{integer.format(coefficientIndex.summary.grantCount)} unique public grant records, classified against every fund on Coefficient’s current funds page. Overall totals count a source record once; fund rows are intentionally non-additive.</p>
        </div>
        <div className="coefficient-overview" aria-label="Coefficient public index summary">
          <div><span>Published records</span><strong>{integer.format(coefficientIndex.summary.grantCount)}</strong></div>
          <div><span>Published amounts</span><strong>{compactMoney.format(coefficientIndex.summary.totalPublishedAmountUsd)}</strong></div>
          <div><span>Recipient names</span><strong>{integer.format(coefficientIndex.summary.uniqueRecipientCount)}</strong></div>
          <div><span>Index coverage</span><strong>2012–2026</strong></div>
        </div>
        <div className="fund-market-grid">
          {coefficientIndex.funds.map((fund) => (
            <a href={fund.url} target="_blank" rel="noreferrer" className="fund-market-row" key={fund.fund}>
              <span><strong>{fund.fund}</strong>{fund.status === 'closed' && <em>Closed</em>}</span>
              <span>{integer.format(fund.grantCount)} grants</span>
              <b>{compactMoney.format(fund.publishedAmountUsd)}</b>
              <i>↗</i>
            </a>
          ))}
        </div>
        <div className="index-caveats">
          <p><strong>Coverage, not certainty.</strong> {integer.format(coefficientIndex.summary.grantsWithoutListedFund)} records have no currently listed fund tag; {integer.format(coefficientIndex.summary.grantsWithMultipleListedFunds)} have multiple listed fund tags; {integer.format(coefficientIndex.summary.grantsWithoutFocusArea)} have no focus-area tag.</p>
          <p><strong>Amounts are partial.</strong> The unique-record total excludes {integer.format(coefficientIndex.summary.grantsWithoutPublishedAmount)} record without a published amount. “Published” does not mean paid, and one source award date is later than this snapshot’s retrieval date.</p>
        </div>
        <p className="data-note">Public index retrieved {day.format(new Date(coefficientIndex.source.retrievedAt))} · {coefficientIndex.source.contentHash.slice(0, 12)} content hash · <a href="https://coefficientgiving.org/funds/" target="_blank" rel="noreferrer">Fund taxonomy ↗</a></p>
      </section>

      <section className="ledger-section" id="grant-ledger">
        <div className="ledger-heading">
          <div><p className="kicker">FIRST LIVE GRANT LEDGER</p><h2>Inside one Coefficient fund.</h2></div>
          <p>All 79 records currently displayed by the Effective Giving & Careers fund page, normalized without claiming that “published” means paid.</p>
        </div>
        <div className="ledger-stats">
          <div><span>Published records</span><strong>{coefficientMarket?.summary.grant_count ?? 79}</strong></div>
          <div><span>Published amounts</span><strong>{coefficientMarket ? money.format(coefficientMarket.summary.total_amount_usd) : '$46.7M'}</strong></div>
          <div><span>Distinct recipients</span><strong>{coefficientMarket?.summary.recipient_count ?? 51}</strong></div>
          <div><span>Latest decision month</span><strong>{coefficientMarket ? month.format(new Date(coefficientMarket.summary.latest_decision_date * 1000)) : 'July 2026'}</strong></div>
        </div>
        <div className="ledger-grid">
          <div className="ledger-table">
            <div className="ledger-row ledger-labels"><span>Recipient</span><span>Purpose</span><span>Amount</span></div>
            {coefficientMarket?.recent.map((grant) => (
              <div className="ledger-row" key={grant.external_id}>
                <span>{grant.recipient_url ? <a href={grant.recipient_url} target="_blank" rel="noreferrer">{grant.recipient} ↗</a> : grant.recipient}</span>
                <span>{grant.source_url ? <a href={grant.source_url} target="_blank" rel="noreferrer">{grant.purpose} ↗</a> : grant.purpose}</span><strong>{money.format(grant.amount_usd)}</strong>
              </div>
            )) ?? <div className="ledger-loading">{coefficientError ? 'The live ledger is temporarily unavailable; the verified snapshot remains shown above.' : 'Loading the D1-backed ledger…'}</div>}
          </div>
          <aside className="coverage-card">
            <span className="tag">COVERAGE NOTE</span>
            <h3>Published is not complete.</h3>
            <p>Coefficient says entries can lag grantmaking by months, sensitive grants may be withheld, some rows group grants, and its database omits most funding advised for donors other than Good Ventures.</p>
            <p>We therefore store “published” as its own status, leave the originating funder unknown, and never add this ledger to the $1B annual figure.</p>
            <a className="text-link" href="https://coefficientgiving.org/grant-publishing-process/" target="_blank" rel="noreferrer">Read their publishing process ↗</a>
          </aside>
        </div>
        <p className="data-note">Retrieved {coefficientMarket ? day.format(new Date(coefficientMarket.source.retrievedAt)) : 'August 29, 2026'} · Public index snapshot · Content-addressed · Removed records remain detectable through last-seen timestamps.</p>
      </section>

      <section className="sources-section">
        <div><p className="kicker">SOURCE LEDGER</p><h2>Every claim should lead back to evidence.</h2></div>
        <div className="source-list">
          <a href="https://coefficientgiving.org/wp-content/uploads/2025-Letter-from-the-CEO-final.pdf" target="_blank" rel="noreferrer"><span>Coefficient Giving</span><strong>2025 letter: $1B+ directed</strong><b>↗</b></a>
          <a href="https://www.givewell.org/charities/top-charities" target="_blank" rel="noreferrer"><span>GiveWell</span><strong>Top charities, updated Sep 2025</strong><b>↗</b></a>
          <a href="https://animalcharityevaluators.org/blog/announcing-our-2025-charity-recommendations/" target="_blank" rel="noreferrer"><span>ACE</span><strong>2025 recommended charities</strong><b>↗</b></a>
          <a href="https://www.givinggreen.earth/post/2025-2026-top-climate-nonprofits" target="_blank" rel="noreferrer"><span>Giving Green</span><strong>2025–26 climate recommendations</strong><b>↗</b></a>
          <a href="https://www.founderspledge.com/research/education-evidence-and-recommendations" target="_blank" rel="noreferrer"><span>Founders Pledge</span><strong>Education evidence & recommendations</strong><b>↗</b></a>
        </div>
      </section>

      <section className="method-section" id="methodology">
        <p className="kicker">A COMMON LANGUAGE FOR IMPACT</p>
        <h2>Comparable where possible.<br />Transparent where it isn’t.</h2>
        <div className="method-grid">
          <article><span>01</span><h3>Evidence</h3><p>How confident should we be that the intervention causes the intended outcome?</p></article>
          <article><span>02</span><h3>Marginal impact</h3><p>What additional good is expected from the next dollar—not the average past dollar?</p></article>
          <article><span>03</span><h3>Funding room</h3><p>How much capital can the organization productively deploy, and on what timeline?</p></article>
          <article><span>04</span><h3>Uncertainty</h3><p>Which estimates are measured, modeled, judgment-based, or fundamentally incomparable?</p></article>
        </div>
      </section>

      <footer><div className="brand"><span className="brand-mark">M</span><span>Market for Impact</span></div><p>Built to make consequential giving legible.</p><span>Research preview · 2026</span></footer>
    </main>
  );
}
