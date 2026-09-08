/* eslint-disable @next/next/no-html-link-for-pages -- Native anchors avoid a confirmed Vinext production prefetch runtime error under the canonical /donate base path. */
import '@/app/givebetter.css';
import '@/app/report-reading.css';

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
  donationUrl?: string;
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

function Assumptions({ inputs }: { inputs: CharityReportContent['model']['inputs'] }) {
  return <dl className="report-assumptions">{inputs.map(input => <div key={input.key}>
    <dt>{input.label}</dt><dd><strong>{input.best}</strong> (range: {input.range}). {input.basis} <em>{input.confidence}.</em></dd>
  </div>)}</dl>;
}
function Scenarios({ rows }: { rows: CharityReportContent['model']['sensitivity'] }) {
  return <ul className="report-scenarios">{rows.map(row => <li key={row.case}><strong>{row.case}: {row.headline}.</strong> {row.detail}</li>)}</ul>;
}
export default function CharityResearchReport({ content }: { content: CharityReportContent }) {
  const donationUrl = content.donationUrl?.trim();
  const headings = [
    ['summary', 'Summary'],
    ['program', '1. What do they do?'],
    ['evidence', '2. Monitoring and information sharing'],
    ['reservations', '3. Qualitative assessment'],
    ['cost-effectiveness', '4. What do you get for your dollar?'],
    ['funding', '5. Funding and previous grants'],
    ['sources', '6. Sources'],
  ];
  return (
    <main className="givebetter charity-report">
      <header className="givebetter-masthead"><a href="/">Give<span>Better</span> <small>x SF</small></a></header>
      <div className="report-reading-column">
        <header className="report-heading">
          <h1>{content.organization}</h1><p className="report-program">{content.program}</p>
          <a className="report-donate" href={donationUrl || '#funding'} {...(donationUrl ? {target:'_blank',rel:'noreferrer'} : {})}>Donate</a>
        </header>
        <nav className="report-contents" aria-label="Table of Contents">
          <h2>Table of Contents</h2>
          {headings.map(([id,label]) => <a key={id} href={'#'+id}>{label}</a>)}
        </nav>
        <p className="report-date">Published: {content.published}. Model: {content.modelVersion}.</p>
        <article>
          <section id="summary"><span id="nutshell" />
            <h2>Summary</h2>
            <p><strong>{content.nutshell.headline}</strong></p>
            <p>{content.nutshell.body}</p>
            <ul>
              <li><strong>Why it may work:</strong> {content.nutshell.whyItMayWork}</li>
              <li><strong>Key reservation:</strong> {content.nutshell.whyWeAreCautious}</li>
              <li><strong>Before recommending a donation:</strong> {content.nutshell.recommendationBlocker}</li>
            </ul>
            <dl className="report-summary">{content.summary.map(item => <div key={item.label}><dt>{item.label.toLowerCase()}</dt><dd><strong>{item.value}</strong> — {item.detail}</dd></div>)}</dl>
          </section>
          <section id="program">
            <h2>1. What do they do?</h2><p>{content.programSection.body}</p>
            {content.programSection.steps.map(step => <div key={step.title}><h3>{step.title}</h3><p>{step.detail}</p></div>)}
            <p><strong>Scope of this review.</strong> {content.programSection.boundary}</p>
          </section>
          <section id="evidence">
            <h2>2. Monitoring and information sharing</h2>
            {content.evidence.map(item => <div key={item.key}><h3>{item.population}</h3><p><strong>{item.design}.</strong> {item.result}</p><p><strong>Our assessment.</strong> {item.transfer}</p></div>)}
          </section>
          <section id="reservations">
            <h2>3. Qualitative assessment</h2>
            <p>{content.nutshell.whyItMayWork}</p>
            <h3>Key reservations</h3><ul>{content.reservations.map(item => <li key={item}>{item}</li>)}</ul>
            <h3>Benefits not included in our estimate</h3><ul>{content.excludedBenefits.map(item => <li key={item}>{item}</li>)}</ul>
          </section>
          <section id="cost-effectiveness">
            <h2>4. What do you get for your dollar?</h2>
            <p><strong>{content.model.headline}</strong></p><p>{content.model.body}</p>
            <p>A better life is our comparison unit of 10 additional quality-adjusted life years (QALYs), potentially spread across people. These are uncertain estimates, not measured returns or verified donation offers.</p>
            <h3>How we calculate the estimate</h3>
            <p className="report-equation"><strong>{content.model.equation.label}:</strong> {content.model.equation.expression}<br /><strong>{content.model.equation.result}</strong></p>
            <details className="report-method"><summary>Model inputs and assumptions</summary><Assumptions inputs={content.model.inputs}/></details>
            <h3>{content.model.giftHeading}</h3><Scenarios rows={content.model.sensitivity}/>
            {content.model.uncertaintyBoundary && <p><strong>Uncertainty.</strong> {content.model.uncertaintyBoundary}</p>}
            {content.comparisonBridge && <div className="report-qaly-bridge">
              <h3>{content.comparisonBridge.headline}</h3><p>{content.comparisonBridge.body}</p>
              <p className="report-equation"><strong>{content.comparisonBridge.equation.label}:</strong> {content.comparisonBridge.equation.expression}<br /><strong>{content.comparisonBridge.equation.result}</strong></p>
              <details className="report-method"><summary>QALY conversion assumptions</summary><Assumptions inputs={content.comparisonBridge.inputs}/></details>
              <Scenarios rows={content.comparisonBridge.sensitivity}/><p>{content.comparisonBridge.boundary}</p>
            </div>}
            {content.comparisonAudit && <div>
              <h3>{content.comparisonAudit.headline}</h3><p>{content.comparisonAudit.body}</p>
              <p><strong>{content.comparisonAudit.candidate.label}: {content.comparisonAudit.candidate.value}.</strong> {content.comparisonAudit.candidate.detail}</p>
              <h4>Unresolved evidence</h4><ul>{content.comparisonAudit.failedGates.map(gate => <li key={gate.key}><strong>{gate.label}.</strong> {gate.why}</li>)}</ul>
              <p><strong>Illustrative only—not a comparison price.</strong> {content.comparisonAudit.illustrative.expression}: {content.comparisonAudit.illustrative.result}</p>
              <p>{content.comparisonAudit.illustrative.boundary}</p>
              <ul>{content.comparisonAudit.requiredEvidence.map(item => <li key={item}>{item}</li>)}</ul>
            </div>}
          </section>
          <section id="funding">
            <h2>5. Funding and previous grants</h2>
            <p>{content.model.fundingBoundary}</p>
            <p>This review does not establish a verified marginal funding offer or a complete history of grants.</p>
            {donationUrl ? <><p><a className="report-donate" href={donationUrl} target="_blank" rel="noreferrer">Donate</a></p><p className="report-donation-note">Opens the organization’s giving page. A general donation may not fund the specific activity modeled here; confirm allocation with the recipient.</p></> : <p>We have not verified a suitable donation route for this reviewed activity. Confirm the legal recipient and intended allocation before donating.</p>}
          </section>
          <section id="sources"><h2>6. Sources</h2>
            <ol className="report-sources">{content.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.title}</a>. {source.publisher}. {source.sourceType}. Published: {source.published}; retrieved: {source.retrieved}.</li>)}</ol>
          </section>
        </article>
        <footer className="report-footer"><a href="/research">All research</a> · <a href="/">Our top charities</a><p>GiveBetter x SF is not affiliated with GiveWell or the organizations reviewed.</p></footer>
      </div>
    </main>
  );
}
