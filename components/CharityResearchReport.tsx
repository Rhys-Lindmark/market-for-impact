/* eslint-disable @next/next/no-html-link-for-pages -- Native anchors avoid a confirmed Vinext production prefetch runtime error under the canonical /donate base path. */

export type CharityEvidence = {
  key: string;
  design: string;
  population: string;
  result: string;
  transfer: string;
};

export type CharitySource = {
  publisher: string;
  title: string;
  url: string;
  published: string;
  retrieved: string;
  sourceType: string;
};

export type CharityReportContent = {
  organization: string;
  eyebrow: string;
  program: string;
  donationUrl: string;
  published: string;
  modelVersion: string;
  nutshell: {
    headline: string;
    body: React.ReactNode;
    whyItMayWork: string;
    whyWeAreCautious: string;
    recommendationBlocker: string;
  };
  summary: Array<{ label: string; value: string; detail: string }>;
  programSection: {
    body: string;
    steps: Array<{ title: string; detail: string }>;
    boundary: string;
  };
  model: {
    headline: string;
    body: string;
    equation: { label: string; expression: string; result: string };
    inputColumnLabel?: string;
    inputs: Array<{ key: string; label: string; confidence: string; best: string; range: string; basis: string }>;
    giftHeading: string;
    sensitivity: Array<{ case: string; headline: string; detail: string }>;
    uncertaintyBoundary?: string;
    fundingBoundary: string;
  };
  comparisonBridge?: {
    headline: string;
    body: string;
    equation: { label: string; expression: string; result: string };
    inputs: Array<{ key: string; label: string; confidence: string; best: string; range: string; basis: string }>;
    sensitivity: Array<{ case: string; headline: string; detail: string }>;
    boundary: string;
  };
  comparisonAudit?: {
    headline: string;
    body: string;
    candidate: { label: string; value: string; detail: string };
    failedGates: Array<{ key: string; label: string; why: string }>;
    illustrative: { expression: string; result: string; boundary: string };
    requiredEvidence: string[];
  };
  evidence: CharityEvidence[];
  reservations: string[];
  excludedBenefits: string[];
  sources: CharitySource[];
};

export default function CharityResearchReport({ content }: { content: CharityReportContent }) {
  return (
    <main className="charity-report">
      <header className="charity-report-topbar">
        <a className="brand" href="/"><span className="brand-mark">M</span><span>Market for Impact</span></a>
        <nav aria-label="Charity report navigation"><a href="#nutshell">In a nutshell</a><a href="#program">The program</a><a href="#cost-effectiveness">Cost-effectiveness</a><a href="#reservations">Reservations</a></nav>
        <a className="charity-report-donate" href={content.donationUrl} target="_blank" rel="noreferrer">Donation route ↗</a>
      </header>

      <div className="charity-report-layout">
        <aside className="charity-report-toc" aria-label="On this page">
          <span>ON THIS PAGE</span>
          <a href="#nutshell">In a nutshell</a><a href="#summary">Summary</a><a href="#program">How the program works</a><a href="#cost-effectiveness">Cost-effectiveness model</a><a href="#evidence">Evidence</a><a href="#reservations">How we could be wrong</a><a href="#sources">Sources</a>
          <small>Published {content.published}<br />Model {content.modelVersion}</small>
        </aside>

        <article className="charity-report-article">
          <header className="charity-report-title">
            <p className="kicker">{content.eyebrow}</p>
            <h1>{content.organization}</h1>
            <p>{content.program}</p>
          </header>

          <section className="charity-nutshell" id="nutshell">
            <span>IN A NUTSHELL</span>
            <h2>{content.nutshell.headline}</h2>
            <p>{content.nutshell.body}</p>
            <ul>
              <li><strong>Why it may work:</strong> {content.nutshell.whyItMayWork}</li>
              <li><strong>Why we are cautious:</strong> {content.nutshell.whyWeAreCautious}</li>
              <li><strong>What blocks a recommendation:</strong> {content.nutshell.recommendationBlocker}</li>
            </ul>
          </section>

          <section className="charity-summary" id="summary">
            {content.summary.map((item) => <div key={item.label}><span>{item.label}</span><strong>{item.value}</strong><p>{item.detail}</p></div>)}
          </section>

          <aside className="charity-comparison-denominator">
            <span>SHARED COMPARISON DENOMINATOR</span>
            <strong>$ per 10 QALYs — one better life</strong>
            <p>Every Market for Impact model ultimately reports against this denominator. Until a versioned bridge from the native outcome to duration-adjusted QALYs is defensible, the comparison price remains “not yet convertible”; the native outcome model below stays visible and auditable.</p>
          </aside>

          <section className="charity-section" id="program">
            <p className="charity-section-number">1 · THE BASICS</p>
            <h2>How does the program work?</h2>
            <p>{content.programSection.body}</p>
            <div className="charity-program-flow" aria-label={`${content.organization} program model`}>
              {content.programSection.steps.map((step, index) => <div key={step.title}><span>{String(index + 1).padStart(2, '0')}</span><strong>{step.title}</strong><p>{step.detail}</p></div>)}
            </div>
            <aside className="charity-boundary"><strong>Scope boundary</strong>{content.programSection.boundary}</aside>
          </section>

          <section className="charity-section charity-model" id="cost-effectiveness">
            <p className="charity-section-number">2 · COST-EFFECTIVENESS</p>
            <h2>{content.model.headline}</h2>
            <p>{content.model.body}</p>
            <div className="charity-model-equation"><span>{content.model.equation.label}</span><strong>{content.model.equation.expression}</strong><b>{content.model.equation.result}</b></div>
            <div className="charity-model-table" role="table" aria-label={`${content.organization} cost-effectiveness assumptions`}>
              <div role="row"><span role="columnheader">Input</span><span role="columnheader">{content.model.inputColumnLabel ?? 'Best guess'}</span><span role="columnheader">Range</span><span role="columnheader">Basis</span></div>
              {content.model.inputs.map((input) => <div role="row" key={input.key}><strong role="cell">{input.label}<small>{input.confidence} confidence</small></strong><span role="cell">{input.best}</span><span role="cell">{input.range}</span><p role="cell">{input.basis}</p></div>)}
            </div>
            <h3>{content.model.giftHeading}</h3>
            <div className="charity-sensitivity">{content.model.sensitivity.map((row) => <article key={row.case}><span>{row.case}</span><strong>{row.headline}</strong><p>{row.detail}</p></article>)}</div>
            {content.model.uncertaintyBoundary ? <aside className="charity-boundary charity-null-boundary"><strong>The range is not a guarantee of positive impact.</strong>{content.model.uncertaintyBoundary}</aside> : null}
            <aside className="charity-boundary"><strong>This is not verified room for more funding.</strong>{content.model.fundingBoundary}</aside>
            {content.comparisonBridge ? <div className="charity-qaly-bridge">
              <p className="charity-section-number">SHARED DENOMINATOR BRIDGE</p>
              <h3>{content.comparisonBridge.headline}</h3>
              <p>{content.comparisonBridge.body}</p>
              <div className="charity-model-equation"><span>{content.comparisonBridge.equation.label}</span><strong>{content.comparisonBridge.equation.expression}</strong><b>{content.comparisonBridge.equation.result}</b></div>
              <div className="charity-model-table" role="table" aria-label={`${content.organization} native outcome to QALY bridge assumptions`}>
                <div role="row"><span role="columnheader">Bridge input</span><span role="columnheader">Best guess</span><span role="columnheader">Range</span><span role="columnheader">Basis</span></div>
                {content.comparisonBridge.inputs.map((input) => <div role="row" key={input.key}><strong role="cell">{input.label}<small>{input.confidence} confidence</small></strong><span role="cell">{input.best}</span><span role="cell">{input.range}</span><p role="cell">{input.basis}</p></div>)}
              </div>
              <div className="charity-sensitivity">{content.comparisonBridge.sensitivity.map((row) => <article key={row.case}><span>{row.case}</span><strong>{row.headline}</strong><p>{row.detail}</p></article>)}</div>
              <aside className="charity-boundary charity-null-boundary"><strong>Conditional bridge—not a recommendation.</strong>{content.comparisonBridge.boundary}</aside>
            </div> : null}
            {content.comparisonAudit ? <div className="charity-qaly-bridge charity-qaly-audit">
              <p className="charity-section-number">SHARED DENOMINATOR AUDIT</p>
              <h3>{content.comparisonAudit.headline}</h3>
              <p>{content.comparisonAudit.body}</p>
              <div className="charity-audit-candidate"><span>{content.comparisonAudit.candidate.label}</span><strong>{content.comparisonAudit.candidate.value}</strong><p>{content.comparisonAudit.candidate.detail}</p></div>
              <h4>Why the bridge fails today</h4>
              <div className="charity-audit-gates">{content.comparisonAudit.failedGates.map((gate) => <article key={gate.key}><span>FAILED GATE</span><strong>{gate.label}</strong><p>{gate.why}</p></article>)}</div>
              <div className="charity-model-equation charity-audit-equation"><span>ILLUSTRATIVE ONLY · NOT A COMPARISON PRICE</span><strong>{content.comparisonAudit.illustrative.expression}</strong><b>{content.comparisonAudit.illustrative.result}</b></div>
              <aside className="charity-boundary charity-null-boundary"><strong>Why we do not publish that number.</strong>{content.comparisonAudit.illustrative.boundary}</aside>
              <h4>Evidence required to unlock $ per 10 QALYs</h4>
              <ol className="charity-reservations">{content.comparisonAudit.requiredEvidence.map((item) => <li key={item}>{item}</li>)}</ol>
            </div> : null}
          </section>

          <section className="charity-section" id="evidence">
            <p className="charity-section-number">3 · EVIDENCE</p>
            <h2>What does the evidence actually show?</h2>
            <div className="charity-evidence-list">{content.evidence.map((item, index) => <article key={item.key}><span>{String(index + 1).padStart(2, '0')} · {item.design}</span><h3>{item.population}</h3><p>{item.result}</p><aside><strong>Our read</strong>{item.transfer}</aside></article>)}</div>
          </section>

          <section className="charity-section" id="reservations">
            <p className="charity-section-number">4 · HOW WE COULD BE WRONG</p>
            <h2>The most important uncertainties are causal—not cosmetic.</h2>
            <ol className="charity-reservations">{content.reservations.map((reservation) => <li key={reservation}>{reservation}</li>)}</ol>
            <h3>Benefits we deliberately excluded</h3>
            <ul>{content.excludedBenefits.map((benefit) => <li key={benefit}>{benefit}</li>)}</ul>
          </section>

          <section className="charity-section charity-sources" id="sources">
            <p className="charity-section-number">5 · SOURCES</p>
            <h2>Research trail</h2>
            {content.sources.map((source) => <a href={source.url} target="_blank" rel="noreferrer" key={source.url}><span>{source.sourceType} · {source.published}</span><strong>{source.title}</strong><small>{source.publisher} · retrieved {source.retrieved}</small></a>)}
          </section>
        </article>
      </div>
    </main>
  );
}
