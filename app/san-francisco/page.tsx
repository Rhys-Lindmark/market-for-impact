import type { Metadata } from 'next';
/* eslint-disable @next/next/no-html-link-for-pages -- Native anchors avoid a confirmed Vinext production prefetch runtime error on this server-rendered brief. */
import candidateUniverse from '@/data/san-francisco/candidate-universe-v1.json';
import irsUniverse from '@/data/san-francisco/irs-exempt-universe-v1.json';
import sfDiligence from '@/data/san-francisco/nonprofit-diligence-v1.json';
import sfOutcomes from '@/data/san-francisco/outcome-ontology-v1.json';
import sfFunding from '@/data/san-francisco/public-funding-v1.json';

export const metadata: Metadata = {
  title: 'San Francisco giving — Market for Impact',
  description: 'A source-grounded donor brief for consequential giving in San Francisco: the field, the evidence funnel, initial diligence, and what remains unknown.',
  openGraph: {
    title: 'Where can a major gift do the most good in San Francisco?',
    description: 'The nonprofit field, initial evidence, public-funding context, and the path to a defensible recommendation.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'San Francisco giving — Market for Impact',
    description: 'A source-grounded donor brief for consequential local giving.',
  },
};

const integer = new Intl.NumberFormat('en-US');
const compactMoney = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 2 });

const outcomeLabels = new Map(sfOutcomes.outcomes.map((outcome) => [outcome.key, outcome.label]));
const candidates = [...sfDiligence.candidates].sort((a, b) => a.name.localeCompare(b.name));
const dossierCandidates = candidates.flatMap((candidate) => 'evidenceDossier' in candidate ? [{ candidate, dossier: candidate.evidenceDossier }] : []);

const researchGates = [
  { number: '01', title: 'Verify the entity', copy: 'Confirm the legal entity, donation vehicle, EIN, service geography, and which program a gift would support.' },
  { number: '02', title: 'Name the outcome', copy: 'Choose a durable outcome and follow-up window. Delivered services and administrative counts remain separate.' },
  { number: '03', title: 'Test the causal claim', copy: 'Find a credible comparison, external evaluation, or transparent model linking the program to that outcome.' },
  { number: '04', title: 'Price the next dollar', copy: 'Obtain a time-bounded marginal plan at $100K, $1M, and $10M, including capacity, displacement, and downside cases.' },
  { number: '05', title: 'Set follow-up milestones', copy: 'Agree on what will be reported, when, and what evidence would cause a donor to continue, revise, or stop.' },
];

export default function SanFranciscoDonorPage() {
  return (
    <main className="sf-brief-shell">
      <header className="detail-topbar sf-brief-topbar">
        <a className="brand" href="/"><span className="brand-mark">M</span><span>Market for Impact</span></a>
        <nav aria-label="San Francisco page navigation">
          <a href="#funnel">Evidence funnel</a>
          <a href="#diligence">Initial diligence</a>
          <a href="#research-gates">Research gates</a>
        </nav>
        <a className="detail-back" href="/">← Full market</a>
      </header>

      <section className="sf-brief-hero">
        <div>
          <p className="kicker">SAN FRANCISCO · MAJOR-DONOR BRIEF</p>
          <h1>Where can a major gift do the most good?</h1>
        </div>
        <div className="sf-brief-intro">
          <p>This page is built for a donor considering roughly <strong>$10 million this year</strong>. It starts with the whole observable field, narrows only when evidence supports it, and keeps “we do not know yet” visible.</p>
          <div><span>Current decision state</span><strong>Research shortlist—not a recommendation slate</strong></div>
        </div>
      </section>

      <section className="sf-brief-funnel" id="funnel" aria-labelledby="sf-funnel-title">
        <header>
          <div><p className="kicker">THE EVIDENCE FUNNEL</p><h2 id="sf-funnel-title">The denominator before the shortlist.</h2></div>
          <p>These layers answer different questions. They are not additive, and movement through the funnel is earned through identity, outcome, causal, and marginal-funding evidence.</p>
        </header>
        <div className="sf-funnel-grid">
          <article><span>01 · Registered field</span><strong>{integer.format(irsUniverse.summary.organizationCount)}</strong><h3>SF filing-address EINs</h3><p>Identity and IRS classification only. A San Francisco address does not establish local service or impact.</p><a href="/#sf-irs-universe">Explore IRS records →</a></article>
          <article><span>02 · Public footprint</span><strong>{integer.format(candidateUniverse.summary.sourceOrganizationNameCount)}</strong><h3>City-contractor names</h3><p>{integer.format(candidateUniverse.summary.activeContractCount)} active prime contracts provide public-funding context, not effectiveness or philanthropic room.</p><a href="/#sf-candidate-universe">Explore city contractors →</a></article>
          <article><span>03 · Initial diligence</span><strong>{integer.format(sfDiligence.summary.candidateCount)}</strong><h3>Organization scorecards</h3><p>Accepted sources cover identity, theory of change, native signals, causal limits, public overlap, and downside cases.</p><a href="#diligence">Review the six →</a></article>
          <article className="blocked"><span>04 · Recommendation-ready</span><strong>{integer.format(sfDiligence.summary.candidatesWithPublishedMarginalGap)}</strong><h3>Publishable opportunities</h3><p>No candidate yet has both independently credible marginal-impact evidence and a reviewed, time-bounded funding plan.</p><a href="#research-gates">See what is missing →</a></article>
        </div>
        <div className="sf-funnel-rule"><strong>Decision rule.</strong><span>Scale, Charity Navigator ratings, contracts, reach, and organization-reported outcomes can all inform diligence. None alone becomes an MFI effectiveness ranking.</span></div>
      </section>

      <section className="sf-brief-context" aria-labelledby="sf-context-title">
        <div><p className="kicker">WHAT THE MARKET CAN ANSWER TODAY</p><h2 id="sf-context-title">Useful context. Explicit limits.</h2></div>
        <div className="sf-context-grid">
          <article><span>Outcome contract</span><strong>{sfOutcomes.outcomes.length} local outcomes</strong><p>Housing, homelessness, overdose, mental health, food security, education, violence, and mobility have explicit units and attribution requirements.</p><a href="/#san-francisco">Read the outcome definitions ↗</a></article>
          <article><span>Public baseline</span><strong>{compactMoney.format(sfFunding.summary.cityBudgetUsd)}</strong><p>Approved city spending is context. Contract authority, payments, and remaining authority stay separate and never become donation room.</p><a href="/#sf-public-funding">Inspect public funding ↗</a></article>
          <article><span>Conversion boundary</span><strong>QALY / WELLBY blocked</strong><p>All six candidates lack the local counterfactual and versioned conversion model required for a defensible health or wellbeing estimate.</p><a href="/#sf-diligence">Inspect the boundary ↗</a></article>
        </div>
      </section>

      <section className="sf-brief-diligence" id="diligence" aria-labelledby="sf-diligence-title">
        <header>
          <div><p className="kicker">INITIAL DILIGENCE · ALPHABETICAL, NOT RANKED</p><h2 id="sf-diligence-title">Six initial diligence records.</h2></div>
          <p>Each record preserves the strongest accepted signal and the most important decision barrier. Open a row for the full current case and its sources.</p>
        </header>
        <div className="sf-brief-candidates">
          {candidates.map((candidate, index) => (
            <details key={candidate.key}>
              <summary>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div><small>{candidate.entityType}</small><strong>{candidate.name}</strong><p>{candidate.outcomeKeys.map((key) => outcomeLabels.get(key) ?? key).join(' · ')}</p></div>
                <div><small>Evidence state</small><b>{candidate.evidenceLevel}</b></div>
                <em>Open case ↓</em>
              </summary>
              <div className="sf-candidate-brief">
                <section><span>What it does</span><p>{candidate.interventionType}</p><small>{candidate.serviceGeography}</small></section>
                <section><span>Strongest accepted signal</span><strong>{candidate.nativeSignals[0]?.value ?? 'Not published'}</strong><h3>{candidate.nativeSignals[0]?.label ?? 'No native signal'}</h3><small>{candidate.nativeSignals[0]?.period ?? 'Period not published'} · {candidate.nativeSignals[0]?.signalType ?? 'Unclassified'}</small></section>
                <section><span>Causal boundary</span><p>{candidate.causalBoundary}</p></section>
                <section><span>Next-dollar state</span><p>{candidate.marginalFunding}</p><b>Recommendation blocked pending marginal plan</b></section>
                <section><span>Public-funding context</span><strong>{candidate.publicFunding.contractCount === 0 ? 'No exact city-contract match' : `${candidate.publicFunding.contractCount} exact matches`}</strong><p>{candidate.publicFunding.contractCount === 0 ? 'No accounting inference made.' : `${compactMoney.format(candidate.publicFunding.awardUsd)} contract authority · ${compactMoney.format(candidate.publicFunding.paymentsMadeUsd)} paid.`}</p><small>Not philanthropic room for more funding.</small></section>
                <section><span>Downside case</span><p>{candidate.downsideCase}</p></section>
                <footer>
                  <div>{candidate.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.publisher}: {source.title} ↗</a>)}</div>
                  <a className="primary-button" href={candidate.donationUrl} target="_blank" rel="noreferrer">Organization giving page ↗</a>
                </footer>
              </div>
            </details>
          ))}
        </div>
        {dossierCandidates.map(({ candidate, dossier }, dossierIndex) => {
          const headingId = candidate.key === 'hamilton-families' ? 'hamilton-dossier-title' : `${candidate.key}-dossier-title`;
          const reportedId = `${candidate.key}-reported-title`;
          const ladderId = `${candidate.key}-ladder-title`;
          const gapsId = `${candidate.key}-gaps-title`;
          return (
          <article className="sf-evidence-dossier" aria-labelledby={headingId} key={candidate.key}>
            <header>
              <div><p className="kicker">DEEP EVIDENCE DOSSIER {String(dossierIndex + 1).padStart(2, '0')} · NOT RANKED</p><h3 id={headingId}>{candidate.name}</h3></div>
              <div className="sf-dossier-decision"><span>Decision state</span><strong>{dossier.decisionState}</strong><small>Reviewed {dossier.reviewedAt}</small></div>
            </header>
            <p className="sf-dossier-summary">{dossier.decisionSummary}</p>

            <section className="sf-dossier-reported" aria-labelledby={reportedId}>
              <div className="sf-dossier-section-heading"><span>01 · Organization-reported</span><h4 id={reportedId}>What {dossier.reportingName} says happened in {dossier.organizationReported.period}</h4><p>These are decision inputs, not causal estimates. Open each metric’s limitation before comparing it with external evidence.</p></div>
              <div className="sf-dossier-metrics">
                {dossier.organizationReported.outcomes.map((outcome) => (
                  <div key={outcome.label}><strong>{outcome.value}</strong><h5>{outcome.label}</h5><small>{outcome.claimType}</small><p>{outcome.limitation}</p></div>
                ))}
              </div>
              <div className="sf-dossier-financials">
                <div><span>Revenue</span><strong>{compactMoney.format(dossier.organizationReported.financials.revenueUsd)}</strong><small>{dossier.organizationReported.financials.revenueNote}</small></div>
                <div><span>Expenses</span><strong>{compactMoney.format(dossier.organizationReported.financials.expensesUsd)}</strong><small>{dossier.organizationReported.financials.expenseNote}</small></div>
                <p>{dossier.organizationReported.financials.boundary}</p>
                <a href={dossier.organizationReported.source.url} target="_blank" rel="noreferrer">{dossier.organizationReported.source.publisher}: {dossier.organizationReported.source.title} ↗</a>
              </div>
            </section>

            <section className="sf-dossier-ladder" aria-labelledby={ladderId}>
              <div className="sf-dossier-section-heading"><span>02 · Evidence ladder</span><h4 id={ladderId}>Relevant evidence is not interchangeable.</h4><p>Organization-specific, partner, and external studies answer different questions. Transfer limits stay attached to every finding.</p></div>
              <div className="sf-evidence-layers">
                {dossier.evidenceLayers.map((layer, index) => (
                  <article key={layer.title}>
                    <header><span>{String(index + 1).padStart(2, '0')} · {layer.scope}</span><b>{layer.status}</b></header>
                    <h5>{layer.title}</h5>
                    <small>{layer.publisher} · {layer.design}</small>
                    <p>{layer.finding}</p>
                    <dl><dt>Decision use</dt><dd>{layer.decisionUse}</dd><dt>Transfer limit</dt><dd>{layer.transferLimit}</dd></dl>
                    <a href={layer.url} target="_blank" rel="noreferrer">Open source ↗</a>
                  </article>
                ))}
              </div>
            </section>

            <section className="sf-dossier-gaps" aria-labelledby={gapsId}>
              <div><span>03 · What still blocks a recommendation</span><h4 id={gapsId}>The next conversation needs to price the next dollar.</h4></div>
              <ol>{dossier.missingForRecommendation.map((gap) => <li key={gap}>{gap}</li>)}</ol>
            </section>
          </article>
          );
        })}
        <p className="sf-brief-disclaimer"><strong>Important:</strong> inclusion means “selected for initial diligence,” not “recommended.” The cohort is intentionally small and does not yet represent the full Bay Area nonprofit field.</p>
      </section>

      <section className="sf-research-gates" id="research-gates" aria-labelledby="sf-gates-title">
        <header><div><p className="kicker">FROM SHORTLIST TO RECOMMENDATION</p><h2 id="sf-gates-title">Five gates before a large gift.</h2></div><p>The next research cycle should turn a broad organization into a specific, fundable program with a testable marginal case.</p></header>
        <div>{researchGates.map((gate) => <article key={gate.number}><span>{gate.number}</span><h3>{gate.title}</h3><p>{gate.copy}</p></article>)}</div>
        <aside><strong>The current answer is honest but incomplete.</strong><p>Market for Impact can identify the field, surface research leads, and show why common proxies are insufficient. It cannot yet tell a donor to allocate $10 million among these organizations. That requires interviews, program-specific plans, independent outcome evidence, and explicit counterfactuals.</p><a href="/#methodology">Read the full methodology →</a></aside>
      </section>

      <section className="sf-brief-sources">
        <p className="kicker">SOURCE BOUNDARIES</p>
        <div>
          <a href={irsUniverse.source.url} target="_blank" rel="noreferrer"><span>IRS</span><strong>California Exempt Organizations Business Master File</strong><small>Posted {irsUniverse.source.postingDate} · identity and classification</small><b>↗</b></a>
          <a href={sfFunding.sources.find((source) => source.key === 'datasf-supplier-contracts')?.publicUrl} target="_blank" rel="noreferrer"><span>DataSF</span><strong>Active nonprofit prime-contract snapshot</strong><small>{integer.format(candidateUniverse.summary.activeContractCount)} accepted contract rows · accounting context</small><b>↗</b></a>
          <a href="/#sf-diligence"><span>MFI</span><strong>Six-candidate diligence contract</strong><small>Primary organization sources, public crosswalks, and explicit evidence limits</small><b>→</b></a>
        </div>
      </section>

      <footer><strong>Market for Impact</strong><p>San Francisco research preview · sources retrieved August 30, 2026</p><a href="/">Explore the full market →</a></footer>
    </main>
  );
}
