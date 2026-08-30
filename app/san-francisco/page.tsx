import type { Metadata } from 'next';
/* eslint-disable @next/next/no-html-link-for-pages -- Native anchors avoid a confirmed Vinext production prefetch runtime error on this server-rendered brief. */
import candidateUniverse from '@/data/san-francisco/candidate-universe-v1.json';
import sfComparison from '@/data/san-francisco/donor-comparison-v1.json';
import sfGrantEvaluation from '@/data/san-francisco/grant-evaluation-v1.json';
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
          <a href="#comparison">Compare six</a>
          <a href="#protocol">Research protocol</a>
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

      <section className="sf-donor-comparison" id="comparison" aria-labelledby="sf-comparison-title">
        <header>
          <div><p className="kicker">DONOR COMPARISON · ALPHABETICAL, NOT RANKED</p><h2 id="sf-comparison-title">Six organizations. One honest denominator.</h2></div>
          <p>This is the GiveWell-style front door: the same decision fields for every organization, with missing evidence left visible. It is a research shortlist—not a recommendation or allocation.</p>
        </header>
        <div className="sf-comparison-summary" aria-label="Comparison status">
          <div><strong>{sfComparison.summary.candidateCount}</strong><span>Under review</span></div>
          <div><strong>{sfComparison.summary.recommendationReadyCount}</strong><span>Recommendation-ready</span></div>
          <div><strong>{sfComparison.summary.costEffectivenessNotEstimableCount}</strong><span>Impact prices not estimable</span></div>
          <div><strong>{sfComparison.summary.publishedFundingRoomCount}</strong><span>Published funding-room amounts</span></div>
        </div>
        <aside className="sf-comparison-boundary">
          <div><span>Proposed common outcome</span><strong>Life substantially bettered</strong><b>Definition not approved</b></div>
          <p>{sfComparison.interpretation.translationBoundary}</p>
        </aside>
        <div className="sf-comparison-cards">
          {sfComparison.candidates.map((candidate, index) => (
            <article className="sf-comparison-card" key={candidate.key}>
              <header>
                <span>{String(index + 1).padStart(2, '0')} · {candidate.organizationType}</span>
                <b>{candidate.decisionLabel}</b>
              </header>
              <h3>{candidate.name}</h3>
              <p className="sf-comparison-outcomes">{candidate.outcomeLabels.join(' · ')}</p>
              <p className="sf-comparison-intervention">{candidate.interventionType}</p>
              <dl className="sf-comparison-metrics">
                <div><dt>Cost per life substantially bettered</dt><dd className="sf-comparison-cost">{candidate.costEffectiveness.display}</dd></div>
                <div><dt>Evidence</dt><dd>{candidate.researchStateLabel}</dd></div>
                <div><dt>Current funding room</dt><dd>{candidate.fundingRoom.display}</dd></div>
              </dl>
              <section className="sf-comparison-gifts" aria-label={`${candidate.name} marginal gift plans`}>
                <span>What would the next gift buy?</span>
                <div>{candidate.fundingRoom.giftScenarios.map((scenario) => <div key={scenario.amountUsd}><strong>{compactMoney.format(scenario.amountUsd)}</strong><small>{scenario.display}</small></div>)}</div>
              </section>
              <section className="sf-comparison-signal">
                <span>Strongest accepted native signal—not a cost-effectiveness estimate</span>
                <strong>{candidate.strongestNativeSignal.value}</strong>
                <p>{candidate.strongestNativeSignal.label} · {candidate.strongestNativeSignal.period}</p>
              </section>
              <p className="sf-comparison-decision">{candidate.decisionSummary}</p>
              <footer>
                <div><span>Donation vehicle</span><strong>{candidate.donationVehicle.taxStatus}</strong><small>{candidate.donationVehicle.deductibility}</small></div>
                <div className="sf-comparison-actions"><a href={candidate.researchHref}>Full research ↓</a><a href={candidate.donationVehicle.url} target="_blank" rel="noreferrer">Giving page ↗</a></div>
              </footer>
            </article>
          ))}
        </div>
        <p className="sf-comparison-disclaimer"><strong>Comparison rule.</strong> {sfComparison.interpretation.recommendation} {sfComparison.interpretation.fundingBoundary}</p>
      </section>

      <section className="sf-grant-protocol" id="protocol" aria-labelledby="sf-protocol-title">
        <header>
          <div><p className="kicker">THE RESEARCH BACKLOG · FORECAST BEFORE LOOK-BACK</p><h2 id="sf-protocol-title">How an impact number earns its place.</h2></div>
          <p>{sfGrantEvaluation.purpose} Nothing below means an organization has supplied the requested evidence.</p>
        </header>
        <div className="sf-protocol-summary" aria-label="Grant evaluation readiness">
          <div><strong>{sfGrantEvaluation.summary.scenarioCount}</strong><span>Candidate × gift-size plans</span></div>
          <div><strong>{sfGrantEvaluation.summary.submittedScenarioCount}</strong><span>Plans submitted</span></div>
          <div><strong>{sfGrantEvaluation.summary.forecastLockedCount}</strong><span>Forecasts locked</span></div>
          <div><strong>{sfGrantEvaluation.summary.lookbackEligibleCount}</strong><span>Look-backs eligible</span></div>
        </div>
        <div className="sf-protocol-contract">
          <section>
            <header><span>Before a recommendation</span><h3>Lock the marginal plan.</h3><b>{sfGrantEvaluation.marginalPlan.requiredFields.length} required fields</b></header>
            <ol>{sfGrantEvaluation.marginalPlan.requiredFields.map((field, index) => <li key={field.key}><span>{String(index + 1).padStart(2, '0')}</span><div><strong>{field.label}</strong><p>{field.question}</p></div></li>)}</ol>
          </section>
          <section>
            <header><span>After funding</span><h3>Compare forecast with reality.</h3><b>{sfGrantEvaluation.lookback.requiredFields.length} required fields</b></header>
            <ol>{sfGrantEvaluation.lookback.requiredFields.map((field, index) => <li key={field.key}><span>{String(index + 1).padStart(2, '0')}</span><div><strong>{field.label}</strong><p>{field.copy}</p></div></li>)}</ol>
          </section>
        </div>
        <aside className="sf-protocol-timeline">
          <div><span>Monitoring checkpoints</span><strong>{sfGrantEvaluation.lookback.defaultCheckpointsMonths.map((month) => `${month} mo`).join(' · ')}</strong></div>
          <p>{sfGrantEvaluation.lookback.forecastRule}</p>
          <div><span>Systematic look-back target</span><strong>{sfGrantEvaluation.lookback.systematicReviewTargetMonths.join('–')} months</strong></div>
        </aside>
        <div className="sf-lookback-seed">
          <header><div><p className="kicker">FIRST HISTORICAL GRANT SEED · NOT AN MFI RECOMMENDATION</p><h3>A real grant. An incomplete record.</h3></div><p>This is the first accepted San Francisco grant queued for retrospective research. Its public grant record does not contain enough information for a look-back.</p></header>
          {sfGrantEvaluation.historicalGrants.map((grant) => (
            <article key={grant.grantKey}>
              <div><span>Published grant</span><strong>{compactMoney.format(grant.amountUsd)}</strong><small>{grant.amountSemantics} · {grant.awardPeriod}</small></div>
              <div><span>Recipient and purpose</span><strong>{grant.candidateName}</strong><small>{grant.purpose} · {grant.fund}</small></div>
              <dl><div><dt>Original forecast</dt><dd>{grant.originalForecastState}</dd></div><div><dt>Milestones</dt><dd>{grant.milestonesState}</dd></div><div><dt>Realized outcomes</dt><dd>{grant.realizedOutcomesState}</dd></div><div><dt>Look-back</dt><dd>{grant.lookbackState}</dd></div></dl>
              <p>{grant.currentAssessment}</p>
              <footer><span>Protocol target: {grant.systematicLookbackWindow}</span><small>{grant.scheduleSemantics}</small><a href={grant.sourceUrl} target="_blank" rel="noreferrer">Open grant record ↗</a></footer>
            </article>
          ))}
        </div>
        <div className="sf-protocol-queue">
          <header><div><p className="kicker">CURRENT RESEARCH QUEUE</p><h3>Six candidates. Eighteen missing plans.</h3></div><p>A blank plan is not a zero-dollar need. It means MFI has not reviewed a program-specific answer.</p></header>
          <div>
            {sfGrantEvaluation.candidates.map((candidate, index) => (
              <article key={candidate.candidateKey}>
                <header><span>{String(index + 1).padStart(2, '0')}</span><b>{candidate.marginalPlanLabel}</b></header>
                <h4>{candidate.candidateName}</h4>
                <div>{candidate.scenarios.map((scenario) => <div key={scenario.amountUsd}><strong>{compactMoney.format(scenario.amountUsd)}</strong><small>{scenario.display}</small></div>)}</div>
                <footer><span>Forecast: not eligible</span><span>Look-back: not eligible</span><a href={candidate.researchHref}>Open current evidence ↓</a></footer>
              </article>
            ))}
          </div>
        </div>
        <div className="sf-protocol-sources">
          <p><strong>Method boundary.</strong> {sfGrantEvaluation.methodBoundary}</p>
          <div>{sfGrantEvaluation.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer"><span>{source.publisher}</span><strong>{source.title}</strong><small>{source.use}</small><b>↗</b></a>)}</div>
        </div>
      </section>

      <section className="sf-brief-diligence" id="diligence" aria-labelledby="sf-diligence-title">
        <header>
          <div><p className="kicker">INITIAL DILIGENCE · ALPHABETICAL, NOT RANKED</p><h2 id="sf-diligence-title">Six initial diligence records.</h2></div>
          <p>Each record preserves the strongest accepted signal and the most important decision barrier. Open a row for the full current case and its sources.</p>
        </header>
        <div className="sf-brief-candidates">
          {candidates.map((candidate, index) => (
            <details id={`${candidate.key}-scorecard`} key={candidate.key}>
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
