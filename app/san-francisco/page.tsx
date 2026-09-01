import type { Metadata } from 'next';
/* eslint-disable @next/next/no-html-link-for-pages -- Native anchors avoid a confirmed Vinext production prefetch runtime error on this server-rendered brief. */
import candidateUniverse from '@/data/san-francisco/candidate-universe-v1.json';
import sfComparison from '@/data/san-francisco/donor-comparison-v1.json';
import sfGrantEvaluation from '@/data/san-francisco/grant-evaluation-v1.json';
import irsUniverse from '@/data/san-francisco/irs-exempt-universe-v1.json';
import sfMarginalPlanRequests from '@/data/san-francisco/marginal-plan-requests-v1.json';
import sfDiligence from '@/data/san-francisco/nonprofit-diligence-v1.json';
import sfOutcomes from '@/data/san-francisco/outcome-ontology-v1.json';
import sfFunding from '@/data/san-francisco/public-funding-v1.json';
import sfResearchFunnel from '@/data/san-francisco/research-funnel-v1.json';
import pohReview from '@/data/san-francisco/project-open-hand-review-v1.json';
import harmReductionTherapyCenterReview from '@/data/san-francisco/harm-reduction-therapy-center-review-v1.json';
import homelessYouthAllianceReview from '@/data/san-francisco/homeless-youth-alliance-review-v1.json';
import huckleberryYouthProgramsReview from '@/data/san-francisco/huckleberry-youth-programs-review-v1.json';
import sffGrants from '@/data/san-francisco/sff-community-grants-v1.json';
import SffGrantExplorer from './SffGrantExplorer';
import SfDeepReview from './SfDeepReview';

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
const dossierCandidates = candidates.flatMap((candidate) => 'evidenceDossier' in candidate && candidate.key !== 'sf-lgbt-center' ? [{ candidate, dossier: candidate.evidenceDossier }] : []);
const marginalPlanRequests = sfMarginalPlanRequests.packets;
const sffInitialPage = { pagination: { page: 1, pageSize: 12, total: sffGrants.partners.length, pageCount: Math.ceil(sffGrants.partners.length / 12) }, partners: sffGrants.partners.slice(0, 12) };
const deepReviewAnchors = new Map([['943023551', '/charities/project-open-hand'], ['943342323', '/charities/eviction-defense-collaborative'], ['941156622', '/charities/compass-family-services'], ['237362588', '/charities/curry-senior-center'], ['832393341', '/charities/farming-hope'], ['810622701', '/charities/five-keys'], ['941156481', '/charities/glide'], ['943055602', '/charities/hamilton-families'], ['943363781', '#harm-reduction-therapy-center-review'], ['813036333', '#homeless-youth-alliance-review'], ['941687559', '#huckleberry-youth-programs-review'], ['942978977', '/charities/institute-on-aging'], ['943041517', '/charities/sf-marin-food-bank'], ['943236718', '/charities/sf-lgbt-center']]);
const canonicalResearchRoutes = new Map([['sf-lgbt-center', '/charities/sf-lgbt-center'], ['sf-marin-food-bank', '/charities/sf-marin-food-bank'], ['hamilton-families', '/charities/hamilton-families'], ['glide', '/charities/glide'], ['compass-family-services', '/charities/compass-family-services'], ['eviction-defense-collaborative', '/charities/eviction-defense-collaborative'], ['farming-hope', '/charities/farming-hope'], ['five-keys-schools-and-programs', '/charities/five-keys']]);
const canonicalResearchHref = (key: string, fallback: string) => canonicalResearchRoutes.get(key) ?? fallback;

const topResearchPrograms = [
  { organization: 'San Francisco–Marin Food Bank', program: 'Community Markets', overview: 'Client-choice groceries plus navigation and support for households facing food insecurity.', price: '≈ $6,000', unit: 'per additional household not experiencing very low food security at 12 months', betterLifePrice: 'Not yet convertible', bridgeState: 'Four evidence gates failed', evidence: 'Promising but indirect', detail: 'The causal anchor is a randomized trial of a different bundled pantry model. A separate audit finds that the health-state transition, person allocation, duration, and SFMFB causal-effect gates all fail.', href: '/charities/sf-marin-food-bank' },
  { organization: 'SF LGBT Center', program: 'Employment Services', overview: 'Affirming job-search support, coaching, career fairs, and employer partnerships for LGBTQ+ job seekers.', price: '≈ $172,000', unit: 'per additional living-wage placement in a 25%-attribution scenario', betterLifePrice: 'Not yet convertible', bridgeState: 'Seven evidence gates failed', evidence: 'Reported outcomes; causal effect unknown', detail: 'No retained-employment, causal placement, or preference-based utility evidence supports a QALY conversion.', href: '/charities/sf-lgbt-center' },
  { organization: 'Institute on Aging', program: 'Friendship Line proactive calls', overview: 'Structured calls intended to reduce loneliness among older adults.', price: '≈ $14,900', unit: 'per additional six-month loneliness remission', betterLifePrice: 'Not yet convertible', bridgeState: 'Five evidence gates failed', evidence: 'Very uncertain', detail: 'The organization-specific pilot had no comparison group, and the 3-item UCLA threshold has no defensible causal QALY mapping.', href: '/charities/institute-on-aging' },
  { organization: 'GLIDE', program: 'Rental assistance', overview: 'Short-term financial assistance intended to prevent shelter entry.', price: '≈ $154,000', unit: 'per additional six-month shelter entry averted', betterLifePrice: 'Not yet convertible', bridgeState: 'Eight evidence gates failed', evidence: 'Very uncertain', detail: 'Shelter entry is not a health state; GLIDE has no person-level utility, housing-trajectory, or marginal-additionality evidence for a QALY bridge.', href: '/charities/glide' },
  { organization: 'Curry Senior Center', program: 'Senior Vitality', overview: 'Technology, coaching, and group support intended to reduce loneliness.', price: '≈ $167,000', unit: 'per modeled additional 0.5 SD loneliness improvement at 12 months', betterLifePrice: 'Not yet convertible', bridgeState: 'Six evidence gates failed', evidence: 'Very uncertain', detail: 'The native responder is modeled, the local study is uncontrolled, and no defensible score-to-utility mapping exists.', href: '/charities/curry-senior-center' },
  { organization: 'Project Open Hand', program: 'Post-discharge medically tailored meals', overview: 'Condition-matched meals for recently hospitalized adults with known heart failure.', price: '≈ $213,000', unit: 'per additional 90-day heart-failure hospitalization averted', betterLifePrice: '≈ $133M', bridgeState: 'Conditional acute-morbidity bridge', evidence: 'Mixed randomized evidence', detail: 'The randomized primary all-cause outcome was null; the $/10-QALY result counts only short-term morbidity from the exploratory heart-failure result.', href: '/charities/project-open-hand' },
  { organization: 'Hamilton Families', program: 'Homelessness prevention', overview: 'Flexible assistance and case management intended to avert family homelessness.', price: '≈ $500,000', unit: 'per additional six-month homelessness episode averted', betterLifePrice: '≈ $1.4M', bridgeState: 'Very-low-confidence housing/QALY transfer', evidence: 'Randomized intervention anchor; transferred VA health model', detail: 'The central estimate retains 50% of a VA homelessness-prevention model’s 0.144 QALYs per recipient and counts one adult-equivalent beneficiary per assisted family. The positive-effect range is $347K–$17.4M per better life; a null remains plausible.', href: '/charities/hamilton-families' },
  { organization: 'Compass Family Services', program: 'C-Rent homelessness prevention', overview: 'Back-rent and move-in assistance paired with case management and problem-solving for at-risk families.', price: '≈ $485,000', unit: 'per additional six-month homelessness episode averted', betterLifePrice: '≈ $1.35M', bridgeState: 'Very-low-confidence housing/QALY transfer', evidence: 'Audited cost; randomized intervention anchor; transferred VA health model', detail: 'The central estimate retains 50% of a VA homelessness-prevention model’s 0.144 QALYs per recipient, counts one adult-equivalent beneficiary per reported family, and uses the audited $9,704 C-Rent accounting ratio. The positive-effect range is $368K–$17.4M per better life; a null remains plausible.', href: '/charities/compass-family-services' },
  { organization: 'Eviction Defense Collaborative', program: 'Full-scope eviction defense', overview: 'An attorney and support team represent a tenant through an eviction case, with intake, referral, and social-service coordination around the legal pathway.', price: '≈ $126,000', unit: 'per additional tenant household retaining possession', betterLifePrice: 'Not yet convertible', bridgeState: 'Eight evidence gates failed', evidence: 'Conflicting randomized evidence', detail: 'Retaining possession is not a health-utility unit; EDC lacks a stable causal legal effect, person-level utility, housing duration, and donor additionality.', href: '/charities/eviction-defense-collaborative' },
  { organization: 'Farming Hope', program: 'Paid culinary apprenticeship', overview: 'A 12-week, part-time paid apprenticeship combining kitchen work, professional skills, case-manager involvement, and employer connections.', price: '≈ $1.04M', unit: 'per additional person ever employed in a late follow-up year', betterLifePrice: '≈ $41.6M', bridgeState: 'Very-low-confidence QALY transfer', evidence: 'Reported outcomes; transferred randomized effect', detail: 'The better-life estimate transfers a randomized IPS trial\'s 0.01 QALY per participant to Farming Hope; the intervention and population differ materially, and a null remains plausible.', href: '/charities/farming-hope' },
  { organization: 'Five Keys Schools and Programs', program: 'Secondary-credential pathway', overview: 'Accredited, flexible high-school and equivalency instruction in custody and community settings for learners traditional schools did not retain.', price: '≈ $167,000', unit: 'per additional credential in a modeled 10-point scenario', betterLifePrice: '≈ $4.9M', bridgeState: 'Very-low-confidence education/QALY model', evidence: 'Audited cost; modeled credential and health effects', detail: 'The central bridge retains 20% of a peer-reviewed U.S. model\'s 1.7 QALYs per additional graduate, then combines 0.34 QALY with the modeled 10-point credential effect. Neither effect is measured for Five Keys, and a null remains plausible.', href: '/charities/five-keys' },
];

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
          <a href="#top-research">Top research</a>
          <a href="#decision-snapshot">Shortlist</a>
          <a href="#funnel">Evidence funnel</a>
          <a href="#community-foundation">Community grants</a>
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
          <a className="sf-hero-decision-link" href="#decision-snapshot">See the current shortlist ↓</a>
        </div>
      </section>

      <section className="sf-top-research" id="top-research" aria-labelledby="sf-top-research-title">
        <header>
          <div><p className="kicker">GIVEWELL-STYLE PROGRAM REVIEWS · NOT YET RECOMMENDATIONS</p><h2 id="sf-top-research-title">The strongest cost-effectiveness work so far.</h2></div>
          <p>These are our current opinions, not a league table. The outcomes differ, every model has a plausible null case, and no organization has published verified room for more funding. Open each full report to inspect the assumptions.</p>
        </header>
        <aside className="sf-life-bettered-contract"><strong>The common denominator is $ per better life.</strong><span><b>One better life = 10 incremental QALYs.</b> Every program is compared against that denominator. Where the bridge from a native outcome to QALYs is not yet defensible, we say “not yet convertible” and retain the native model rather than inventing precision.</span></aside>
        <div className="sf-top-research-list">
          {topResearchPrograms.map((item, index) => <article key={item.href}>
            <span>PROGRAM {index + 1} OF {topResearchPrograms.length}</span>
            <div><p>OVERVIEW</p><h3>{item.program}</h3><strong>{item.organization}</strong><p>{item.overview}</p></div>
            <div><p>COST PER BETTER LIFE</p><h4>{'betterLifePrice' in item ? item.betterLifePrice : 'Not yet convertible'}</h4><strong>$ per 10 QALYs · one better life</strong><span><b>Native model:</b> {item.price} {item.unit}</span><small>{'bridgeState' in item ? item.bridgeState : 'Exploratory estimate'} · funding room not published</small></div>
            <div><p>EVIDENCE OF IMPACT</p><h4>{item.evidence}</h4><span>{item.detail}</span></div>
            <a href={item.href}>Full research report →</a>
          </article>)}
        </div>
      </section>

      <section className="sf-decision-snapshot" id="decision-snapshot" aria-labelledby="sf-decision-snapshot-title">
        <header>
          <div><p className="kicker">CURRENT SHORTLIST · ALPHABETICAL, NOT RANKED</p><h2 id="sf-decision-snapshot-title">What can a donor act on today?</h2></div>
          <div className="sf-decision-answer"><span>Recommendation-ready</span><strong>{sfComparison.summary.recommendationReadyCount}</strong><p>No organization has yet cleared both the impact-evidence and marginal-funding gates.</p></div>
        </header>
        <div className="sf-decision-table" role="table" aria-label="San Francisco research shortlist">
          <div className="sf-decision-table-head" role="row">
            <span role="columnheader">Organization</span><span role="columnheader">Primary outcome areas</span><span role="columnheader">$ per 10 QALYs · one better life</span><span role="columnheader">Current funding room</span><span role="columnheader">Decision state</span><span aria-hidden="true" />
          </div>
          {sfComparison.candidates.map((candidate, index) => (
            <article className="sf-decision-row" role="row" key={candidate.key}>
              <div role="cell"><span>{String(index + 1).padStart(2, '0')} · {candidate.organizationType}</span><strong>{candidate.name}</strong></div>
              <p role="cell">{candidate.outcomeLabels.join(' · ')}</p>
              <div className="missing" role="cell"><span>Impact price</span><strong>{candidate.costEffectiveness.display}</strong></div>
              <div className="missing" role="cell"><span>Marginal gap</span><strong>{candidate.fundingRoom.display}</strong></div>
              <div role="cell"><span>Evidence state</span><strong>{candidate.decisionLabel}</strong></div>
              <a role="cell" href={canonicalResearchHref(candidate.key, candidate.researchHref)} aria-label={`Open ${candidate.name} research`}>Evidence ↓</a>
            </article>
          ))}
        </div>
        <footer>
          <p><strong>Why there is no “top charity” yet.</strong> Service scale, organization-reported outcomes, contracts, ratings, and transferred external evidence do not establish the counterfactual impact or additional funding room of the next gift.</p>
          <a href="#comparison">Open the complete donor comparison →</a>
        </footer>
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

      <section className="sf-research-funnel" id="research-funnel" aria-labelledby="sf-research-funnel-title">
        <header>
          <div><p className="kicker">THE RESEARCH PIPELINE · PRIORITY, NOT IMPACT</p><h2 id="sf-research-funnel-title">6,688 records. 25 deep reviews.</h2></div>
          <p>We are narrowing the local nonprofit field before making recommendations. Every number below describes research status—not proven effectiveness.</p>
        </header>
        <div className="sf-research-stages" aria-label="San Francisco research funnel">
          {sfResearchFunnel.stages.map((stage, index) => <article key={stage.key}><span>{String(index + 1).padStart(2, '0')}</span><strong>{integer.format(stage.count)}</strong><h3>{stage.label}</h3><p>{stage.state}</p></article>)}
        </div>
        <div className="sf-research-contract">
          <div><span>Screening contract</span><h3>What earns the next hour of research?</h3><p>{sfResearchFunnel.eligibilityContract.prioritySignals}</p><strong>{sfResearchFunnel.eligibilityContract.boundary}</strong></div>
          <a href={sfResearchFunnel.workbook.url} target="_blank" rel="noreferrer"><span>LIVE RESEARCH MODEL</span><strong>Open the SF cost-effectiveness workbook</strong><small>{sfResearchFunnel.workbook.status}</small><b>↗</b></a>
        </div>
        <div className="sf-deep-queue">
          <header><div><span>THE FIRST 25 · ALPHABETICAL, NOT RANKED</span><h3>GiveWell-style reports queued.</h3></div><p>Each report must cover intervention evidence, organization-specific results, costs, counterfactuals, funding room, sensitivity, reservations, and sources.</p></header>
          <div>{sfResearchFunnel.deepDiveRows.map((row) => <article key={row.ein}><span>{String(row.queuePosition).padStart(2, '0')}</span><div><h4>{row.displayName}</h4><p>{row.intervention}</p><small>EIN {row.ein} · {row.exactContractSourceName ? 'city-contract link' : 'no exact city-contract link'}</small>{row.reportStatus === 'initial-review-complete' && <a href={deepReviewAnchors.get(row.ein)}>{row.costEffectivenessStatus === 'exploratory-model' ? 'Open full report →' : 'Open initial review ↓'}</a>}</div><b>{row.costEffectivenessStatus === 'exploratory-model' ? 'Exploratory model' : row.reportStatus === 'initial-review-complete' ? 'Initial review complete' : 'CEA not started'}</b></article>)}</div>
        </div>
        <details className="sf-report-contract"><summary>Open the common 12-part report contract</summary><ol>{sfResearchFunnel.reportContract.map((item) => <li key={item}>{item}</li>)}</ol></details>
        <aside className="sf-advocacy-track"><div><span>SEPARATE EVIDENCE TRACK</span><h3>Advocacy is reviewed, not ranked.</h3></div><p>{sfResearchFunnel.interpretation.advocacy}</p><ul>{sfResearchFunnel.advocacyEvidenceTrack.map((row) => <li key={row.name}><strong>{row.name}</strong><span>{row.researchMode}</span></li>)}</ul></aside>
        <footer><p><strong>Current result: {sfResearchFunnel.summary.completedInitialReviewCount} of 25 initial reviews complete; {sfResearchFunnel.summary.exploratoryModelCount} exploratory models and {sfResearchFunnel.summary.completedCostEffectivenessCount} recommendation-grade CEAs.</strong> {sfResearchFunnel.interpretation.costEffectiveness}</p><div>{sfResearchFunnel.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.title} ↗</a>)}</div></footer>
      </section>

      <SfDeepReview review={pohReview} number={1} id="project-open-hand-review" evidenceHeadline="Direct trial involvement. Mixed results." workbookUrl={sfResearchFunnel.workbook.url} />
      <SfDeepReview review={harmReductionTherapyCenterReview} number={9} id="harm-reduction-therapy-center-review" evidenceHeadline="Relevant short-term trial. HRTC effect unknown." workbookUrl={sfResearchFunnel.workbook.url} />
      <SfDeepReview review={homelessYouthAllianceReview} number={10} id="homeless-youth-alliance-review" evidenceHeadline="Strong intervention rationale. HYA effect unknown." workbookUrl={sfResearchFunnel.workbook.url} />
      <SfDeepReview review={huckleberryYouthProgramsReview} number={11} id="huckleberry-youth-programs-review" evidenceHeadline="Several promising pathways. No single marginal case." workbookUrl={sfResearchFunnel.workbook.url} />
      <section className="sf-brief-context" aria-labelledby="sf-context-title">
        <div><p className="kicker">WHAT THE MARKET CAN ANSWER TODAY</p><h2 id="sf-context-title">Useful context. Explicit limits.</h2></div>
        <div className="sf-context-grid">
          <article><span>Outcome contract</span><strong>{sfOutcomes.outcomes.length} local outcomes</strong><p>Housing, homelessness, overdose, mental health, food security, education, violence, and mobility have explicit units and attribution requirements.</p><a href="/#san-francisco">Read the outcome definitions ↗</a></article>
          <article><span>Public baseline</span><strong>{compactMoney.format(sfFunding.summary.cityBudgetUsd)}</strong><p>Approved city spending is context. Contract authority, payments, and remaining authority stay separate and never become donation room.</p><a href="/#sf-public-funding">Inspect public funding ↗</a></article>
          <article><span>Conversion boundary</span><strong>QALY / WELLBY blocked</strong><p>All six candidates lack the local counterfactual and versioned conversion model required for a defensible health or wellbeing estimate.</p><a href="/#sf-diligence">Inspect the boundary ↗</a></article>
        </div>
      </section>

      <section className="sf-sff-section" id="community-foundation" aria-labelledby="sf-sff-title">
        <header>
          <div><p className="kicker">COMMUNITY-FOUNDATION LENS · FY2025 PROGRAMMATIC PORTFOLIO</p><h2 id="sf-sff-title">Another 424 doors into the local field.</h2></div>
          <p>The San Francisco Foundation publishes aggregate FY2025 funding by grantee partner. This adds a funder-discovery lens beyond city contracts and IRS addresses; it does not tell us which partner is effective or where the next dollar should go.</p>
        </header>
        <div className="sf-sff-summary" aria-label="San Francisco Foundation portfolio summary">
          <div><strong>{integer.format(sffGrants.summary.publishedPartnerRowCount)}</strong><span>Published partner rows</span></div>
          <div><strong>{compactMoney.format(sffGrants.summary.publishedPartnerTotalFundingUsd)}</strong><span>Aggregate partner totals</span></div>
          <div><strong>{integer.format(sffGrants.summary.currentServiceGeographyReviewRowCount)}</strong><span>Service geographies reviewed</span></div>
          <div><strong>{integer.format(sffGrants.summary.explicitSfAudiencePresenceRowCount)}</strong><span>Explicit SF audience presence</span></div>
          <div><strong>{integer.format(sffGrants.summary.currentDiligenceReviewRowCount)}</strong><span>Candidate diligence screens</span></div>
          <div><strong>{integer.format(sffGrants.summary.recommendationReadyDiligenceRowCount)}</strong><span>Recommendation-ready</span></div>
        </div>
        <aside className="sf-sff-amount-rule"><span>AMOUNT SEMANTICS</span><p>{sffGrants.interpretation.amount} Historical funding is not current room for more funding.</p></aside>
        <SffGrantExplorer initialData={sffInitialPage} pdfUrl={sffGrants.source.pdfUrl} />
        <div className="sf-sff-boundaries"><p><strong>Denominator.</strong> {sffGrants.interpretation.denominator}</p><p><strong>Geography.</strong> {sffGrants.interpretation.geography}</p><p><strong>Identity.</strong> {sffGrants.interpretation.identity}</p><p><strong>Decision.</strong> {sffGrants.interpretation.impact} {sffGrants.interpretation.fundingRoom}</p></div>
        <div className="sf-sff-sources"><a href={sffGrants.source.portfolioPageUrl} target="_blank" rel="noreferrer"><span>PORTFOLIO METHODOLOGY</span><strong>San Francisco Foundation · 2025 Grantmaking Data</strong><small>FY2025 programmatic grants · data as of {sffGrants.source.portfolioDataAsOf}</small><b>↗</b></a><a href={sffGrants.source.pdfUrl} target="_blank" rel="noreferrer"><span>PRIMARY LIST</span><strong>Funded Organizations and Individuals</strong><small>11-page reviewed PDF · SHA-256 pinned</small><b>↗</b></a></div>
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
                <div className="sf-comparison-actions"><a href={canonicalResearchHref(candidate.key, candidate.researchHref)}>Full research ↓</a><a href={candidate.donationVehicle.url} target="_blank" rel="noreferrer">Giving page ↗</a></div>
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
        <div className="sf-request-index" aria-label="Organization request packets">
          <header><span>Organization-specific packets</span><strong>{sfMarginalPlanRequests.summary.packetCount} drafted · 0 submitted</strong></header>
          <div>{marginalPlanRequests.map((request, index) => <a href={`#${request.sectionId}`} key={request.packetKey}><span>{String(index + 1).padStart(2, '0')}</span><strong>{request.candidateName}</strong><small>{request.statusLabel}</small></a>)}</div>
        </div>
        {marginalPlanRequests.map((request, requestIndex) => (
          <section className="sf-request-packet" id={request.sectionId} aria-labelledby={`${request.sectionId}-title`} key={request.packetKey}>
            <header>
              <div><p className="kicker">ORGANIZATION REQUEST {String(requestIndex + 1).padStart(2, '0')} · PUBLIC PREFILL, NOT A RESPONSE</p><h3 id={`${request.sectionId}-title`}>{request.headline}</h3></div>
              <div className="sf-request-status"><span>Packet status</span><strong>{request.statusLabel}</strong><small>{request.recommendationState}</small></div>
            </header>
            <p className="sf-request-purpose">{request.purpose}</p>
            <div className="sf-request-legend" aria-label={`${request.candidateName} research provenance`}>
              {request.provenanceLegend.map((item, index) => <div key={item.key}><span>0{index + 1}</span><strong>{item.label}</strong><p>{item.meaning}</p></div>)}
            </div>
            <div className="sf-request-facts">
              <header><span>Accepted public context</span><h4>{request.publicFacts.length} facts we can safely prefill.</h4><p>Each fact frames a question. None is copied into the organization’s answer or an MFI model.</p></header>
              <div>{request.publicFacts.map((fact) => <article key={fact.key}><span>{fact.label}</span><strong>{fact.display}</strong><p>{fact.boundary}</p></article>)}</div>
            </div>
            <div className="sf-request-scenarios">
              <header><span>The decision request</span><h4>Three separate marginal cases.</h4><p>The organization may answer with a program plan—or say the amount cannot be productively absorbed.</p></header>
              <div>{request.scenarios.map((scenario) => <article key={scenario.amountUsd}><header><strong>{compactMoney.format(scenario.amountUsd)}</strong><b>{scenario.state}</b></header><p>{scenario.requestedDecision}</p><dl><div><dt>Organization response</dt><dd>Not submitted</dd></div><div><dt>MFI model</dt><dd>Not started</dd></div></dl></article>)}</div>
            </div>
            <div className="sf-request-questions">
              <header><span>Interview and document request</span><h4>Eight questions. Two empty evidence lanes.</h4><p>Public context stays visible beside the missing organization answer and independent model.</p></header>
              <ol>{request.questions.map((question, index) => <li key={question.key}><header><span>{String(index + 1).padStart(2, '0')}</span><div><strong>{question.label}</strong><p>{question.question}</p></div></header><div><section><span>Public context</span><p>{question.publicContext}</p></section><section className="missing"><span>{request.responseLabel}</span><strong>{question.organizationResponseState}</strong></section><section className="missing"><span>MFI model</span><strong>{question.mfiModelState}</strong></section></div></li>)}</ol>
            </div>
            <footer>
              <p><strong>Decision boundary.</strong> {request.decisionBoundary}</p>
              <div>{request.sources.map((source) => <a key={source.key} href={source.url} target="_blank" rel="noreferrer"><span>{source.publisher}</span><strong>{source.title}</strong><b>↗</b></a>)}</div>
            </footer>
          </section>
        ))}
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
                <footer><span>Forecast: not eligible</span><span>Look-back: not eligible</span><a href={canonicalResearchHref(candidate.candidateKey, candidate.researchHref)}>Open current evidence ↓</a></footer>
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
