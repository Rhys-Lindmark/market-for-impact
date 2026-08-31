'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';

type Partner = {
  id: string;
  sourceOrder: number;
  sourcePage: number;
  granteeName: string;
  totalFundingUsd: number;
  identityStatus: string;
  exactIrsMatches: { ein: string; sourceName: string; scorecardKey: string | null }[];
  exactContractSourceName: string | null;
  sourceReportedFiscalSponsors: {
    sponsorName: string;
    assertionSemantics: string;
    latestSourcePostTitle: string;
    latestSourceUrl: string;
    latestSourcePublishedAt: string;
    historicalAssertionCount: number;
  }[];
  currentReceivingEntityReview: null | {
    relationshipStatus: string;
    currentFiscalSponsorName: string | null;
    donationRouteStatus: string;
    donationUrl: string | null;
    donationPayeeInstructions: string | null;
    sources: { publisher: string; url: string; claim: string; retrievedAt: string }[];
    limitation: string;
  };
  diligenceKey: string | null;
  diligenceName: string | null;
  impactEvidenceStatus: string;
  roomForMoreFundingStatus: string;
};

export type SffPageData = {
  pagination: { page: number; pageSize: number; total: number; pageCount: number };
  partners: Partner[];
};

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const subscribeToHydration = () => () => {};

export default function SffGrantExplorer({ initialData, pdfUrl }: { initialData: SffPageData; pdfUrl: string }) {
  const hydrated = useSyncExternalStore(subscribeToHydration, () => true, () => false);
  const [query, setQuery] = useState('');
  const [identity, setIdentity] = useState('all');
  const [sort, setSort] = useState('alphabetical');
  const [page, setPage] = useState(1);
  const [data, setData] = useState(initialData);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ q: query, identity, sort, page: String(page), pageSize: '12' });
    let cancelled = false;
    const load = async () => {
      for (let attempt = 0; attempt < 3; attempt += 1) {
        try {
          const response = await fetch(`/api/sf-sff-grants?${params}`, { signal: controller.signal });
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const next = await response.json() as SffPageData;
          if (!cancelled) { setData(next); setError(false); }
          return;
        } catch {
          if (controller.signal.aborted) return;
          if (attempt === 2 && !cancelled) setError(true);
          else await new Promise((resolve) => setTimeout(resolve, 180 * (attempt + 1)));
        }
      }
    };
    void load();
    return () => { cancelled = true; controller.abort(); };
  }, [identity, initialData, page, query, sort]);

  const updateQuery = (value: string) => { setQuery(value); setPage(1); };
  const updateIdentity = (value: string) => { setIdentity(value); setPage(1); };
  const updateSort = (value: string) => { setSort(value); setPage(1); };

  return (
    <div className="sf-sff-explorer">
      <div className="sf-sff-controls">
        <label><span>Search published partner</span><input aria-label="Search SFF FY2025 partners" disabled={!hydrated} value={query} onChange={(event) => updateQuery(event.target.value)} placeholder="Hamilton Families…" /></label>
        <label><span>Identity / receiving review</span><select aria-label="Filter SFF identity links" disabled={!hydrated} value={identity} onChange={(event) => updateIdentity(event.target.value)}><option value="all">All source rows</option><option value="current-reviewed">Current receiving review</option><option value="current-confirmed">Current sponsor confirmed</option><option value="current-changed">Historical sponsor changed</option><option value="current-unresolved">Current entity unresolved</option><option value="diligence">Deep dossier</option><option value="irs">IRS exact name</option><option value="contract">City-contract exact name</option><option value="sponsor">Historical SFF sponsor record</option><option value="unlinked">No exact local link</option></select></label>
        <label><span>Order</span><select aria-label="Sort SFF partners" disabled={!hydrated} value={sort} onChange={(event) => updateSort(event.target.value)}><option value="alphabetical">Source order · alphabetical</option><option value="funding">Published funding · high to low</option></select></label>
        <div><span>Rows matching</span><strong>{data.pagination.total}</strong></div>
      </div>
      {error && <p className="sf-sff-error">The community-foundation explorer could not refresh. The accepted first page remains visible; adjust a filter to retry.</p>}
      <div className="sf-sff-grid">
        {data.partners.map((partner) => (
          <article key={partner.id}>
            <header><span>PDF {String(partner.sourceOrder).padStart(3, '0')} · PAGE {partner.sourcePage}</span><b>{partner.identityStatus.replaceAll('-', ' ')}</b></header>
            <h3>{partner.granteeName}</h3>
            <div><span>FY2025 aggregate total</span><strong>{money.format(partner.totalFundingUsd)}</strong><small>One partner total—not an individual grant or current funding gap</small></div>
            <dl>
              <div><dt>IRS exact-name links</dt><dd>{partner.exactIrsMatches.length ? partner.exactIrsMatches.map((match) => match.ein).join(' · ') : 'None found'}</dd></div>
              <div><dt>City-contract exact name</dt><dd>{partner.exactContractSourceName ?? 'None found'}</dd></div>
              <div><dt>SFF fiscal-sponsor source</dt><dd>{partner.sourceReportedFiscalSponsors.length ? partner.sourceReportedFiscalSponsors.map((sponsor) => <span className="sf-sff-sponsor-source" key={sponsor.sponsorName}><a href={sponsor.latestSourceUrl} target="_blank" rel="noreferrer">{sponsor.sponsorName} ↗</a><small>Reported {sponsor.latestSourcePublishedAt.slice(0, 10)} · historical source assertion, not current verification{sponsor.historicalAssertionCount > 1 ? ` · ${sponsor.historicalAssertionCount} SFF posts` : ''}</small></span>) : 'None found in reviewed SFF guides'}</dd></div>
              <div><dt>Current receiving review</dt><dd>{partner.currentReceivingEntityReview ? <span className="sf-sff-current-review"><b>{partner.currentReceivingEntityReview.relationshipStatus.replaceAll('-', ' ')}</b><strong>{partner.currentReceivingEntityReview.currentFiscalSponsorName ?? 'Receiving entity unresolved'}</strong>{partner.currentReceivingEntityReview.donationUrl ? <a href={partner.currentReceivingEntityReview.donationUrl} target="_blank" rel="noreferrer">Current donation route ↗</a> : <small>No current donation route found</small>}{partner.currentReceivingEntityReview.donationPayeeInstructions && <small>{partner.currentReceivingEntityReview.donationPayeeInstructions}</small>}<a href={partner.currentReceivingEntityReview.sources[0].url} target="_blank" rel="noreferrer">Official source · reviewed {partner.currentReceivingEntityReview.sources[0].retrievedAt} ↗</a><small>{partner.currentReceivingEntityReview.limitation}</small></span> : 'Not in the 11-row current review scope'}</dd></div>
              <div><dt>Impact / funding room</dt><dd>Not yet assessed · not yet assessed</dd></div>
            </dl>
            <footer>{partner.diligenceKey ? <a href={`#${partner.diligenceKey}-dossier-title`}>Open deep evidence dossier ↓</a> : <span>No MFI dossier</span>}<a href={`${pdfUrl}#page=${partner.sourcePage}`} target="_blank" rel="noreferrer">Source row ↗</a></footer>
          </article>
        ))}
      </div>
      <div className="sf-sff-pagination"><button type="button" disabled={!hydrated || data.pagination.page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>← Previous</button><span>Page {data.pagination.page} of {data.pagination.pageCount}</span><button type="button" disabled={!hydrated || data.pagination.page >= data.pagination.pageCount} onClick={() => setPage((value) => Math.min(data.pagination.pageCount, value + 1))}>Next →</button></div>
    </div>
  );
}
