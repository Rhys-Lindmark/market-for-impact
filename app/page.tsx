'use client';

import { useEffect, useMemo, useState } from 'react';
import giveWellSnapshot from '@/data/givewell/top-charities.json';
import renPhilSnapshot from '@/data/renphil/ai-for-math-2025.json';

type CoefficientMarket = {
  source: { retrievedAt: string; coverageNote: string; url: string };
  summary: { grant_count: number; total_amount_usd: number; latest_decision_date: number; recipient_count: number };
  recent: Array<{ external_id: string; source_url: string | null; recipient: string; recipient_slug: string; recipient_url: string | null; purpose: string; amount_usd: number; decision_date: number; status: string }>;
};

type CoefficientExplorer = {
  source: { retrievedAt: string; coverageNote: string | null; url: string; contentHash: string | null };
  summary: {
    grantCount: number; totalPublishedAmountUsd: number; uniqueRecipientCount: number; listedFundCount: number;
    grantsWithMultipleListedFunds: number; grantsWithoutListedFund: number; grantsWithoutFocusArea: number;
    grantsWithoutPublishedAmount: number; grantsWithoutRecipient: number; grantsWithoutAwardDate: number;
    futureDatedGrants: number; earliestAwardDate: string | null; latestAwardDate: string | null;
  };
  funds: Array<{ fund: string; url: string; status: string; grantCount: number; publishedAmountUsd: number; latestAwardDate: string | null }>;
  pagination: { page: number; pageSize: number; total: number; pageCount: number };
  grants: Array<{
    sourceRecordId: string;
    sourceUrl: string | null;
    purpose: string | null;
    amountUsd: number | null;
    awardDate: string | null;
    sourcePublishedAt: string | null;
    recipients: string[];
    focusAreas: string[];
    listedFunds: string[];
  }>;
};

type GiveWellMarket = {
  source: { retrievedAt: string; url: string; coverageNote: string };
  summary: { grant_count: number; total_amount_usd: number; recipient_count: number; latest_decision_date: number; missing_amount_count: number };
  opportunities: Array<{
    organization: string; slug: string; program: string; geographies: string[]; evidenceLevel: string;
    costPerDeliveryUsd: number; deliveryUnit: string; costPerLifeSavedUsd: number | null;
    modelVersion: string; modelUrl: string; researchUrl: string; fundingRoomStatus: string;
    fundingRoomUsd: number | null; fundingRoomNote: string; limitations: string;
  }>;
};

type GiveDirectlyBenchmark = {
  retrievedAt: string;
  benchmarks: Array<{
    benchmarkKey: string; name: string; benchmarkType: 'welfare-anchor' | 'program-estimate' | 'funding-bar';
    effectiveAt: string; modelVersion: string; referenceBenchmarkKey: string | null;
    estimateLow: number; estimateHigh: number; unitName: string; unitsPerUsd: number | null;
    currencyBasis: string; populationBasis: string; assumptions: string[]; limitations: string[];
    modelUrl: string; sourceUrl: string; sourceTitle: string;
  }>;
};

type RenPhilMarket = {
  source: { retrievedAt: string; url: string; coverageNote: string };
  summary: { award_count: number; declared_award_count: number; unlisted_award_count: number; missing_amount_count: number; missing_description_count: number };
};

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const compactMoney = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 2 });
const integer = new Intl.NumberFormat('en-US');
const month = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
const day = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const shortDay = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const awardYears = Array.from({ length: 15 }, (_, index) => 2026 - index);
const grantPath = (source: string, sourceRecordId: string) => `/grants/${source}/${encodeURIComponent(sourceRecordId)}`;
const organizationPath = (slug: string) => `/organizations/${encodeURIComponent(slug)}`;

export default function Home() {
  const [cause, setCause] = useState('All causes');
  const [query, setQuery] = useState('');
  const [coefficientMarket, setCoefficientMarket] = useState<CoefficientMarket | null>(null);
  const [coefficientError, setCoefficientError] = useState(false);
  const [giveWellMarket, setGiveWellMarket] = useState<GiveWellMarket | null>(null);
  const [giveWellError, setGiveWellError] = useState(false);
  const [giveDirectlyBenchmark, setGiveDirectlyBenchmark] = useState<GiveDirectlyBenchmark | null>(null);
  const [giveDirectlyError, setGiveDirectlyError] = useState(false);
  const [renPhilMarket, setRenPhilMarket] = useState<RenPhilMarket | null>(null);
  const [renPhilError, setRenPhilError] = useState(false);
  const [showAllRenPhil, setShowAllRenPhil] = useState(false);
  const [explorer, setExplorer] = useState<CoefficientExplorer | null>(null);
  const [explorerError, setExplorerError] = useState(false);
  const [explorerLoading, setExplorerLoading] = useState(true);
  const [explorerFund, setExplorerFund] = useState('');
  const [explorerYear, setExplorerYear] = useState('');
  const [explorerSort, setExplorerSort] = useState<'recent' | 'largest'>('recent');
  const [explorerDraft, setExplorerDraft] = useState('');
  const [explorerQuery, setExplorerQuery] = useState('');
  const [explorerPage, setExplorerPage] = useState(1);
  const [explorerRefresh, setExplorerRefresh] = useState(0);
  useEffect(() => {
    fetch('/api/coefficient-grants').then((response) => {
      if (!response.ok) throw new Error('Grant market unavailable');
      return response.json() as Promise<CoefficientMarket>;
    }).then(setCoefficientMarket).catch(() => setCoefficientError(true));
  }, []);
  useEffect(() => {
    fetch('/api/renphil').then((response) => {
      if (!response.ok) throw new Error('RenPhil market unavailable');
      return response.json() as Promise<RenPhilMarket>;
    }).then(setRenPhilMarket).catch(() => setRenPhilError(true));
  }, []);
  useEffect(() => {
    fetch('/api/givewell').then((response) => {
      if (!response.ok) throw new Error('GiveWell market unavailable');
      return response.json() as Promise<GiveWellMarket>;
    }).then(setGiveWellMarket).catch(() => setGiveWellError(true));
  }, []);
  useEffect(() => {
    fetch('/api/givedirectly').then((response) => {
      if (!response.ok) throw new Error('GiveDirectly benchmark unavailable');
      return response.json() as Promise<GiveDirectlyBenchmark>;
    }).then(setGiveDirectlyBenchmark).catch(() => setGiveDirectlyError(true));
  }, []);
  useEffect(() => {
    const params = new URLSearchParams({ page: String(explorerPage), pageSize: '12', sort: explorerSort });
    if (explorerFund) params.set('fund', explorerFund);
    if (explorerYear) params.set('year', explorerYear);
    if (explorerQuery) params.set('q', explorerQuery);
    const controller = new AbortController();
    fetch(`/api/coefficient-grants/all?${params}`, { signal: controller.signal }).then((response) => {
      if (!response.ok) throw new Error('Complete grant ledger unavailable');
      return response.json() as Promise<CoefficientExplorer>;
    }).then((result) => {
      setExplorer(result);
      setExplorerLoading(false);
    }).catch((error) => {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setExplorerError(true);
      setExplorerLoading(false);
    });
    return () => controller.abort();
  }, [explorerFund, explorerPage, explorerQuery, explorerRefresh, explorerSort, explorerYear]);
  const beginExplorerUpdate = () => {
    setExplorerLoading(true);
    setExplorerError(false);
    setExplorerRefresh((value) => value + 1);
  };
  const acceptedOpportunities = useMemo(() => (giveWellMarket?.opportunities ?? []).map((opportunity, index) => ({
    rank: index + 1,
    name: opportunity.organization,
    slug: opportunity.slug,
    intervention: opportunity.program,
    cause: 'Global health',
    evidence: opportunity.evidenceLevel,
    impact: opportunity.costPerLifeSavedUsd == null ? 'Not published' : `${compactMoney.format(opportunity.costPerLifeSavedUsd)} / life`,
    room: opportunity.fundingRoomUsd == null ? opportunity.fundingRoomStatus.replaceAll('-', ' ') : money.format(opportunity.fundingRoomUsd),
    source: 'GiveWell',
    href: opportunity.researchUrl,
  })), [giveWellMarket]);
  const filtered = useMemo(() => acceptedOpportunities.filter((item) =>
    (cause === 'All causes' || item.cause === cause) &&
    `${item.name} ${item.intervention} ${item.source}`.toLowerCase().includes(query.toLowerCase())
  ), [acceptedOpportunities, cause, query]);
  const flowMetrics = useMemo(() => {
    const values = [
      { name: 'Coefficient public index', amount: explorer?.summary.totalPublishedAmountUsd ?? null, records: explorer?.summary.grantCount ?? null, note: 'published row amounts; complete public index', color: '#8e6cf0' },
      { name: 'GiveWell grant export', amount: giveWellMarket?.summary.total_amount_usd ?? null, records: giveWellMarket?.summary.grant_count ?? null, note: 'published grant rows; separate publisher export', color: '#38a679' },
      { name: 'Coefficient EGC subset', amount: coefficientMarket?.summary.total_amount_usd ?? null, records: coefficientMarket?.summary.grant_count ?? null, note: 'fully overlaps the public index; never summed', color: '#ff7657' },
      { name: 'RenPhil AI for Math', amount: null, records: renPhilMarket?.summary.award_count ?? null, note: 'row-level amounts not published', color: '#e2a72e' },
    ];
    const maximum = Math.max(...values.map((item) => item.amount ?? 0), 1);
    return values.map((item) => ({ ...item, width: item.amount == null ? 0 : Math.max(3, (item.amount / maximum) * 100) }));
  }, [coefficientMarket, explorer, giveWellMarket, renPhilMarket]);
  const reviewedAt = explorer?.source.retrievedAt ? month.format(new Date(explorer.source.retrievedAt)) : null;

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
          <div><strong>{explorer ? integer.format(explorer.summary.grantCount) : '—'}</strong><span>accepted Coefficient rows</span></div>
          <div><strong>{explorer ? compactMoney.format(explorer.summary.totalPublishedAmountUsd) : '—'}</strong><span>published row amounts</span></div>
          <div><strong>{explorer ? integer.format(explorer.summary.listedFundCount) : '—'}</strong><span>fund lenses in the ledger</span></div>
          <div><strong>{reviewedAt ?? '—'}</strong><span>database snapshot retrieved</span></div>
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
              {filtered.length === 0 && <tr><td colSpan={8} className="empty">{giveWellError ? 'The accepted assessment ledger is temporarily unavailable.' : giveWellMarket ? 'No accepted opportunities match those filters.' : 'Loading accepted opportunity assessments…'}</td></tr>}
            </tbody>
          </table>
        </div>
        <p className="data-note">This table contains only current assessments materialized in the accepted ledger. ACE, Giving Green, and Founders Pledge remain out of the comparison until their source pipelines are reviewed. Metrics preserve each evaluator’s native unit; funding room is not yet normalized.</p>
      </section>

      <section className="givewell-section" id="givewell-market">
        <div className="givewell-heading">
          <div><p className="kicker">THE GIVEWELL MARKET</p><h2>{giveWellMarket ? integer.format(giveWellMarket.opportunities.length) : 'Current'} programs.<br />No fake precision.</h2></div>
          <p>GiveWell’s current Top Charities share a funding bar, but not a single donor-ready rank. We preserve each program’s evidence, native delivery unit, model version, geography, and live funding-room process.</p>
        </div>
        <div className="givewell-benchmark">
          {(giveDirectlyBenchmark?.benchmarks ?? []).map((benchmark) => (
            <div key={benchmark.benchmarkKey}>
              <span>{benchmark.benchmarkType.replace('-', ' ')}</span>
              <strong>{benchmark.estimateLow === benchmark.estimateHigh ? `${benchmark.estimateLow}×` : `${benchmark.estimateLow}–${benchmark.estimateHigh}×`} {benchmark.name}</strong>
              <p>{benchmark.benchmarkType === 'welfare-anchor' ? 'A normalized unit of welfare—not a charity.' : benchmark.benchmarkType === 'program-estimate' ? 'GiveWell’s model of the standard cash program—not all cash transfers.' : 'A changing grantmaking threshold—not a program estimate.'}</p>
            </div>
          ))}
          {!giveDirectlyBenchmark && <div className="benchmark-loading"><span>Cash comparison</span><strong>—</strong><p>{giveDirectlyError ? 'Benchmark ledger temporarily unavailable.' : 'Loading versioned benchmark definitions…'}</p></div>}
        </div>
        {giveDirectlyBenchmark && <div className="cash-benchmark-guide">
          <div className="cash-guide-copy">
            <p className="kicker">READ THE MULTIPLES CORRECTLY</p>
            <h3>GiveDirectly is a comparator.<br />It is not “1× cash.”</h3>
            <p>GiveWell replaced its named cash benchmark in November 2025 with a consumption-based welfare anchor. Its current 3–4× figure is a model of GiveDirectly’s standard Cash for Poverty Relief program; 6× is GiveWell’s current livelihoods funding bar. They answer different questions.</p>
            <a href={giveDirectlyBenchmark.benchmarks[0].sourceUrl} target="_blank" rel="noreferrer">Read GiveWell’s benchmark change ↗</a>
          </div>
          <div className="cash-guide-details">
            <article><span>MODEL POPULATION</span><p>{giveDirectlyBenchmark.benchmarks[1].populationBasis}</p><small>{giveDirectlyBenchmark.benchmarks[1].modelVersion}</small></article>
            <article><span>WELFARE BASIS</span><p>{giveDirectlyBenchmark.benchmarks[0].populationBasis}</p><small>Approximately {giveDirectlyBenchmark.benchmarks[0].unitsPerUsd} units per dollar.</small></article>
            <article className="cash-warning"><span>DO NOT CROSS THE UNITS</span><p>A donation pass-through percentage and GiveDirectly’s claimed $2.50 local-economy multiplier are not cost-effectiveness multiples. Pilot estimates also use different interventions and moral weights.</p><small>Comparing them as if they shared a denominator would be false precision.</small></article>
          </div>
        </div>}
        <div className="givewell-cards">
          {(giveWellMarket?.opportunities ?? []).map((opportunity) => (
            <article className="givewell-card" key={opportunity.slug}>
              <div className="givewell-card-top"><span>{opportunity.evidenceLevel}</span><b>{opportunity.costPerLifeSavedUsd == null ? 'Metric not published' : `${money.format(opportunity.costPerLifeSavedUsd)} / life`}</b></div>
              <h3><a href={organizationPath(opportunity.slug)}>{opportunity.organization}</a></h3>
              <p className="givewell-program">{opportunity.program}</p>
              <dl>
                <div><dt>Delivery unit</dt><dd>{money.format(opportunity.costPerDeliveryUsd)} / {opportunity.deliveryUnit}</dd></div>
                <div><dt>Model</dt><dd><a href={opportunity.modelUrl} target="_blank" rel="noreferrer">{opportunity.modelVersion} ↗</a></dd></div>
                <div><dt>Funding room</dt><dd>{opportunity.fundingRoomStatus.replaceAll('-', ' ')}</dd></div>
              </dl>
              <p className="givewell-room">{opportunity.fundingRoomNote}</p>
              <div className="givewell-card-links"><a href={organizationPath(opportunity.slug)}>Market profile →</a><a href={opportunity.researchUrl} target="_blank" rel="noreferrer">Research ↗</a><span>{opportunity.geographies.join(' · ')}</span></div>
            </article>
          ))}
          {!giveWellMarket && <p className="market-loading">{giveWellError ? 'The accepted GiveWell ledger is temporarily unavailable.' : 'Loading accepted GiveWell assessments…'}</p>}
        </div>
        <div className="givewell-notes">
          <p><strong>Historical metric.</strong> Cost-per-life figures are GiveWell’s reported averages for 2022–2024 directed funding—not literal outputs of the newer location-specific models.</p>
          <p><strong>Source discrepancy.</strong> {giveWellMarket ? `Accepted grant rows sum to ${money.format(giveWellMarket.summary.total_amount_usd)}, exactly $3 above Airtable’s displayed aggregate.` : 'The accepted row sum is exactly $3 above Airtable’s displayed aggregate.'} Both are preserved; neither is silently “fixed.”</p>
        </div>
        <p className="data-note">Top Charities updated September 2025 · Cost-effectiveness framework updated May 2026 · {giveWellMarket ? `Accepted grant rows retrieved ${day.format(new Date(giveWellMarket.source.retrievedAt))}` : giveWellError ? 'Accepted ledger temporarily unavailable' : 'Loading database freshness…'} · <a href={giveWellSnapshot.source.url} target="_blank" rel="noreferrer">Top Charities ↗</a>{giveDirectlyBenchmark && <> · <a href={giveDirectlyBenchmark.benchmarks[1].modelUrl} target="_blank" rel="noreferrer">GiveDirectly model ↗</a></>}</p>
      </section>

      <section className="renphil-section" id="renphil-market">
        <div className="renphil-heading">
          <div><p className="kicker">THE RENPHIL FRONTIER</p><h2>Funding the tools<br />behind discovery.</h2></div>
          <p>Renaissance Philanthropy’s AI for Math Fund backs open research infrastructure that individual academic and industry labs may lack incentives to build. These are disclosed awards—not a cost-effectiveness ranking.</p>
        </div>
        <div className="renphil-overview" aria-label="Renaissance Philanthropy AI for Math fund summary">
          <div><span>Fund-level commitment</span><strong>Not row-level</strong><p>The announced commitment is excluded from grant totals because RenPhil does not allocate it across awards.</p></div>
          <div><span>Published portfolio</span><strong>{renPhilMarket ? `${integer.format(renPhilMarket.summary.award_count)} linked projects` : '—'}</strong><p>{renPhilMarket ? `RenPhil declares ${integer.format(renPhilMarket.summary.declared_award_count)} awards; ${integer.format(renPhilMarket.summary.unlisted_award_count)} is not named on the current page.` : 'Loading accepted award rows…'}</p></div>
          <div><span>Rows with amounts</span><strong>{renPhilMarket ? integer.format(renPhilMarket.summary.award_count - renPhilMarket.summary.missing_amount_count) : '—'}</strong><p>Application caps and fund totals are never substituted.</p></div>
          <div><span>Named funder</span><strong>XTX Markets</strong><p>RenPhil administers the fund and supports grantees.</p></div>
        </div>
        <div className="renphil-grants">
          {renPhilSnapshot.records.slice(0, showAllRenPhil ? undefined : 8).map((award, index) => (
            <article className="renphil-grant" key={award.sourceRecordId}>
              <div className="renphil-grant-meta"><span>AWARD {String(index + 1).padStart(2, '0')}</span><b>AMOUNT NOT PUBLISHED</b></div>
              <h3>{award.project}</h3>
              <p>{award.purpose ?? 'The current project page does not publish a project description.'}</p>
              <div className="renphil-grant-footer"><span>{award.recipientNames.length ? award.recipientNames.join(' · ') : 'Team biography available at source'}</span><a href={grantPath('renphil', award.sourceRecordId)}>Trace this award →</a><a href={award.sourceUrl} target="_blank" rel="noreferrer">Source ↗</a></div>
            </article>
          ))}
        </div>
        {!showAllRenPhil && <button className="renphil-reveal" type="button" onClick={() => setShowAllRenPhil(true)}>Show all accepted award records <span>↓</span></button>}
        <div className="renphil-caveats">
          <p><strong>Coverage conflict.</strong> {renPhilMarket ? `RenPhil states that the first round funded ${integer.format(renPhilMarket.summary.declared_award_count)} projects, while its current winners page exposes ${integer.format(renPhilMarket.summary.award_count)} accepted records. The ledger records ${integer.format(renPhilMarket.summary.unlisted_award_count)} unresolved gap rather than inventing the missing award.` : 'The publisher’s declared portfolio and linked project records do not reconcile; the accepted ledger preserves that unresolved gap.'}</p>
          <p><strong>Capital signals stay separate.</strong> RenPhil also reports organization-level catalyzed, directly raised, and unlocked capital. None is treated as a grant-ledger total because it cannot be reconciled to the published award rows.</p>
        </div>
        <p className="data-note">{renPhilMarket ? `Accepted award rows retrieved ${day.format(new Date(renPhilMarket.source.retrievedAt))}` : renPhilError ? 'Accepted ledger temporarily unavailable' : 'Loading database freshness…'} · <a href={renPhilSnapshot.source.url} target="_blank" rel="noreferrer">Official winners page ↗</a></p>
      </section>

      <section className="flows-section" id="flows">
        <div className="flow-copy">
          <p className="kicker">THE FLOW OF CAPITAL</p>
          <h2>See where impact funding is actually going.</h2>
          <p>Recommendations reveal what researchers believe. Grants reveal what funders do. Market for Impact connects both.</p>
          <a className="text-link light" href="#methodology">Explore all funding flows <span>→</span></a>
        </div>
        <div className="flow-card">
          <div className="flow-card-head"><div><span>ACCEPTED LEDGER TOTALS</span><strong>A first map of the disclosed ecosystem</strong></div><span className="tag">D1 LIVE</span></div>
          <div className="metric-bars" aria-label="Published funding signals">
            {flowMetrics.map((item) => <div className="metric-row" key={item.name}><div><strong>{item.name}</strong><span>{item.records == null ? 'Loading accepted rows…' : `${integer.format(item.records)} rows · ${item.note}`}</span></div><div className="bar-track"><span style={{ width: `${item.width}%`, background: item.color }} /></div><b>{item.amount == null ? 'Not published' : compactMoney.format(item.amount)}</b></div>)}
          </div>
          <div className="flow-insight"><span>!</span><p><strong>These database totals are intentionally not summed.</strong><br />The Coefficient EGC ledger overlaps its complete index, while cross-publisher exports may describe the same underlying funding. Missing RenPhil amounts remain missing.</p></div>
        </div>
      </section>

      <section className="coefficient-market-section" id="coefficient-market">
        <div className="coefficient-market-heading">
          <div><p className="kicker">THE COEFFICIENT MARKET</p><h2>One index. {explorer ? integer.format(explorer.summary.listedFundCount) : 'Current'} fund lenses.</h2></div>
          <p>{explorer ? integer.format(explorer.summary.grantCount) : '—'} accepted public grant records, classified against every fund on Coefficient’s current funds page. Overall totals count a source record once; fund rows are intentionally non-additive.</p>
        </div>
        <div className="coefficient-overview" aria-label="Coefficient public index summary">
          <div><span>Published records</span><strong>{explorer ? integer.format(explorer.summary.grantCount) : '—'}</strong></div>
          <div><span>Published amounts</span><strong>{explorer ? compactMoney.format(explorer.summary.totalPublishedAmountUsd) : '—'}</strong></div>
          <div><span>Recipient names</span><strong>{explorer ? integer.format(explorer.summary.uniqueRecipientCount) : '—'}</strong></div>
          <div><span>Index coverage</span><strong>{explorer?.summary.earliestAwardDate && explorer.summary.latestAwardDate ? `${new Date(explorer.summary.earliestAwardDate).getUTCFullYear()}–${new Date(explorer.summary.latestAwardDate).getUTCFullYear()}` : '—'}</strong></div>
        </div>
        <div className="fund-market-grid">
          {(explorer?.funds ?? []).map((fund) => (
            <a href={fund.url} target="_blank" rel="noreferrer" className="fund-market-row" key={fund.fund}>
              <span><strong>{fund.fund}</strong>{fund.status === 'closed' && <em>Closed</em>}</span>
              <span>{integer.format(fund.grantCount)} grants</span>
              <b>{compactMoney.format(fund.publishedAmountUsd)}</b>
              <i>↗</i>
            </a>
          ))}
        </div>
        <div className="index-caveats">
          <p><strong>Coverage, not certainty.</strong> {explorer ? `${integer.format(explorer.summary.grantsWithoutListedFund)} records have no currently listed fund tag; ${integer.format(explorer.summary.grantsWithMultipleListedFunds)} have multiple listed fund tags; ${integer.format(explorer.summary.grantsWithoutFocusArea)} have no focus-area tag.` : 'Loading database coverage checks…'}</p>
          <p><strong>Amounts are partial.</strong> {explorer ? `The row total excludes ${integer.format(explorer.summary.grantsWithoutPublishedAmount)} record without a published amount. “Published” does not mean paid; ${integer.format(explorer.summary.futureDatedGrants)} source row is dated after retrieval.` : 'Loading database missingness checks…'}</p>
        </div>
        <div className="grant-explorer">
          <div className="grant-explorer-heading">
            <div><span>QUERY THE LEDGER</span><h3>Trace individual grants.</h3></div>
            <p>Filter the complete D1-backed source ledger without losing Coefficient’s own fund tags or published-record semantics.</p>
          </div>
          <form className="grant-explorer-controls" onSubmit={(event) => { event.preventDefault(); beginExplorerUpdate(); setExplorerPage(1); setExplorerQuery(explorerDraft.trim()); }}>
            <label className="explorer-search"><span>Search</span><input value={explorerDraft} onChange={(event) => setExplorerDraft(event.target.value)} placeholder="Recipient or purpose" /></label>
            <label><span>Fund</span><select value={explorerFund} onChange={(event) => { beginExplorerUpdate(); setExplorerFund(event.target.value); setExplorerPage(1); }}><option value="">All listed funds</option>{(explorer?.funds ?? []).map((fund) => <option value={fund.fund} key={fund.fund}>{fund.fund}</option>)}</select></label>
            <label><span>Award year</span><select value={explorerYear} onChange={(event) => { beginExplorerUpdate(); setExplorerYear(event.target.value); setExplorerPage(1); }}><option value="">All years</option>{awardYears.map((year) => <option value={year} key={year}>{year}</option>)}</select></label>
            <label><span>Sort</span><select value={explorerSort} onChange={(event) => { beginExplorerUpdate(); setExplorerSort(event.target.value as 'recent' | 'largest'); setExplorerPage(1); }}><option value="recent">Most recent</option><option value="largest">Largest amount</option></select></label>
            <button type="submit">Search →</button>
          </form>
          <div className="grant-explorer-status" aria-live="polite">
            <span>{explorerLoading ? 'Querying the ledger…' : explorerError ? 'The complete ledger is temporarily unavailable.' : `${integer.format(explorer?.pagination.total ?? 0)} matching source records`}</span>
            {(explorerFund || explorerYear || explorerQuery) && <button type="button" onClick={() => { beginExplorerUpdate(); setExplorerFund(''); setExplorerYear(''); setExplorerDraft(''); setExplorerQuery(''); setExplorerPage(1); }}>Clear filters</button>}
          </div>
          <div className="grant-results">
            {explorer?.grants.map((grant) => (
              <article className="grant-result" key={grant.sourceRecordId}>
                <div className="grant-result-meta"><span>{grant.awardDate ? `${explorer && new Date(grant.awardDate) > new Date(explorer.source.retrievedAt) ? 'Future-dated · ' : ''}${shortDay.format(new Date(grant.awardDate))}` : 'Award date not published'}</span><span>{grant.listedFunds[0] ?? grant.focusAreas[0] ?? 'No focus-area tag'}</span></div>
                <h4>{grant.recipients.join(' + ') || 'Recipient not published'}</h4>
                <p>{grant.purpose || 'Purpose not published'}</p>
                <div className="grant-result-bottom"><strong>{grant.amountUsd == null ? 'Amount not published' : money.format(grant.amountUsd)}</strong><a href={grantPath('coefficient', grant.sourceRecordId)}>Grant detail →</a></div>
              </article>
            ))}
            {!explorerLoading && !explorerError && explorer?.grants.length === 0 && <p className="grant-no-results">No source records match those filters.</p>}
          </div>
          {explorer && explorer.pagination.pageCount > 1 && <div className="grant-pagination">
            <button type="button" disabled={explorerPage <= 1 || explorerLoading} onClick={() => { beginExplorerUpdate(); setExplorerPage((page) => Math.max(1, page - 1)); }}>← Previous</button>
            <span>Page {integer.format(explorer.pagination.page)} of {integer.format(explorer.pagination.pageCount)}</span>
            <button type="button" disabled={explorerPage >= explorer.pagination.pageCount || explorerLoading} onClick={() => { beginExplorerUpdate(); setExplorerPage((page) => page + 1); }}>Next →</button>
          </div>}
        </div>
        <p className="data-note">{explorer ? `Database source retrieved ${day.format(new Date(explorer.source.retrievedAt))} · ${explorer.source.contentHash?.slice(0, 12) ?? 'no'} content hash` : explorerError ? 'Database source metadata unavailable.' : 'Loading database source metadata…'} · <a href="https://coefficientgiving.org/funds/" target="_blank" rel="noreferrer">Fund taxonomy ↗</a></p>
      </section>

      <section className="ledger-section" id="grant-ledger">
        <div className="ledger-heading">
          <div><p className="kicker">FIRST LIVE GRANT LEDGER</p><h2>Inside one Coefficient fund.</h2></div>
          <p>Every currently accepted record from the Effective Giving & Careers fund page, normalized without claiming that “published” means paid.</p>
        </div>
        <div className="ledger-stats">
          <div><span>Published records</span><strong>{coefficientMarket ? integer.format(coefficientMarket.summary.grant_count) : '—'}</strong></div>
          <div><span>Published amounts</span><strong>{coefficientMarket ? money.format(coefficientMarket.summary.total_amount_usd) : '—'}</strong></div>
          <div><span>Distinct recipients</span><strong>{coefficientMarket ? integer.format(coefficientMarket.summary.recipient_count) : '—'}</strong></div>
          <div><span>Latest decision month</span><strong>{coefficientMarket ? month.format(new Date(coefficientMarket.summary.latest_decision_date * 1000)) : '—'}</strong></div>
        </div>
        <div className="ledger-grid">
          <div className="ledger-table">
            <div className="ledger-row ledger-labels"><span>Recipient</span><span>Purpose</span><span>Amount</span></div>
            {coefficientMarket?.recent.map((grant) => (
              <div className="ledger-row" key={grant.external_id}>
                <span><a href={organizationPath(grant.recipient_slug)}>{grant.recipient} →</a></span>
                <span><a href={grantPath('coefficient-egc', grant.external_id)}>{grant.purpose} →</a></span><strong>{money.format(grant.amount_usd)}</strong>
              </div>
            )) ?? <div className="ledger-loading">{coefficientError ? 'The live ledger is temporarily unavailable; the verified snapshot remains shown above.' : 'Loading the D1-backed ledger…'}</div>}
          </div>
          <aside className="coverage-card">
            <span className="tag">COVERAGE NOTE</span>
            <h3>Published is not complete.</h3>
            <p>Coefficient says entries can lag grantmaking by months, sensitive grants may be withheld, some rows group grants, and its database omits most funding advised for donors other than Good Ventures.</p>
            <p>We therefore store “published” as its own status, leave the originating funder unknown, and never add this overlapping subset to the complete-index total.</p>
            <a className="text-link" href="https://coefficientgiving.org/grant-publishing-process/" target="_blank" rel="noreferrer">Read their publishing process ↗</a>
          </aside>
        </div>
        <p className="data-note">{coefficientMarket ? `Accepted rows retrieved ${day.format(new Date(coefficientMarket.source.retrievedAt))}` : coefficientError ? 'Accepted ledger temporarily unavailable' : 'Loading database freshness…'} · Content-addressed · Removed records remain detectable through last-seen timestamps.</p>
      </section>

      <section className="sources-section">
        <div><p className="kicker">SOURCE LEDGER</p><h2>Every claim should lead back to evidence.</h2></div>
        <div className="source-list">
          <a href="https://coefficientgiving.org/grant-publishing-process/" target="_blank" rel="noreferrer"><span>Coefficient Giving</span><strong>Grant publishing process and coverage</strong><b>↗</b></a>
          <a href="https://www.givewell.org/charities/top-charities" target="_blank" rel="noreferrer"><span>GiveWell</span><strong>Top charities, updated Sep 2025</strong><b>↗</b></a>
          <a href="https://www.givewell.org/how-we-work/our-criteria/cost-effectiveness/cost-effectiveness-models" target="_blank" rel="noreferrer"><span>GiveWell</span><strong>Benchmark semantics, updated May 2026</strong><b>↗</b></a>
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
