import type { Metadata } from 'next';
import Link from 'next/link';
import india from '@/data/geographies/india-v1.json';

export const metadata: Metadata = {
  title: 'India giving — Market for Impact',
  description: 'A source-grounded India giving lens separating current recommendations, historical grants, geography, funding room, and donation-vehicle gaps.',
};

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const compactMoney = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 2 });
const integer = new Intl.NumberFormat('en-US');
const month = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });
const day = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const opportunity = india.currentOpportunities[0];
const recipientGroups = india.givewellFlow.recentRecipientGroups.slice(0, 10);
const recentGrants = india.givewellFlow.recentGrants.slice(0, 12);

export default function IndiaPage() {
  return (
    <main className="india-page">
      <header className="india-topbar">
        <Link className="brand" href="/"><span className="brand-mark">M</span><span>Market for Impact</span></Link>
        <nav aria-label="India page navigation"><a href="#opportunity">Current evidence</a><a href="#flows">Published flows</a><a href="#coverage">Coverage</a></nav>
        <a href="/san-francisco">San Francisco lens →</a>
      </header>

      <section className="india-hero" id="top">
        <div className="india-hero-label"><span>GEOGRAPHY LENS · 01</span><b>INDIA · IN</b></div>
        <h1>Giving in India,<br />without guessing.</h1>
        <div className="india-hero-deck">
          <p>A donor should be able to ask “what works in India?” without confusing where an organization is based, where a grant is tagged, who benefits, which donation vehicle receives the gift, or whether a published amount is actually available now.</p>
          <p>This first lens starts with the evidence the accepted ledgers can support: one current evaluator-backed opportunity that explicitly includes India, plus 50 GiveWell grant records with India in their country field. Everything else remains visibly unassessed.</p>
        </div>
        <div className="india-hero-stats" aria-label="India geography coverage summary">
          <div><span>GiveWell grants naming India</span><strong>{integer.format(india.summary.givewellGrantCount)}</strong><small>{compactMoney.format(india.summary.givewellPublishedAmountUsd)} in full published row amounts since 2015</small></div>
          <div><span>Current evaluator opportunities</span><strong>{india.summary.currentEvaluatorOpportunityCount}</strong><small>Explicit India service geography, not a synthetic rank</small></div>
          <div><span>India-specific funding room</span><strong>0</strong><small>Organization-wide room is not silently allocated to India</small></div>
          <div><span>Donation vehicles assessed</span><strong>0</strong><small>Registration, deductibility, and local rails remain open diligence</small></div>
        </div>
      </section>

      <section className="india-contract">
        <header><span>THE GEOGRAPHY CONTRACT</span><h2>Five fields.<br />Never one label.</h2></header>
        <div>
          <article><span>01</span><h3>Grant geography</h3><p>Only a source-authored country field can place a grant in this lens. Purpose keywords and recipient names do not.</p><b>GiveWell: structured · other grant ledgers: incomplete</b></article>
          <article><span>02</span><h3>Service geography</h3><p>The accepted evaluation must explicitly name India. A headquarters address or global claim is not enough.</p><b>1 current accepted opportunity</b></article>
          <article><span>03</span><h3>Target population</h3><p>People, animals, institutions, and places remain separate. This release preserves ACE’s native farmed-shrimp population.</p><b>No cross-population conversion</b></article>
          <article><span>04</span><h3>Funding room</h3><p>Organization-wide room cannot be relabeled as India-specific without a program budget, allocation, and counterfactual.</p><b>India-specific amount unknown</b></article>
          <article><span>05</span><h3>Donation vehicle</h3><p>Indian registration, foreign-contribution rules, donor-country deductibility, and the receiving entity require legal review.</p><b>Not yet assessed</b></article>
        </div>
      </section>

      <section className="india-opportunity" id="opportunity">
        <header>
          <div><p className="kicker">CURRENT EVALUATOR EVIDENCE</p><h2>One explicit India signal.<br />No automatic recommendation.</h2></div>
          <p>Animal Charity Evaluators currently recommends Shrimp Welfare Project and names India in its service geography. The India program has native modeled metrics; the published funding room remains organization-wide.</p>
        </header>
        <article className="india-opportunity-card">
          <div className="india-opportunity-index"><span>01</span><b>{opportunity.evaluator}</b><small>{opportunity.recommendationCohort} cohort</small></div>
          <div className="india-opportunity-main">
            <header><div><span>{opportunity.evidenceLevel}</span><h3><a href={`/organizations/${opportunity.slug}`}>{opportunity.organization}</a></h3><p>{opportunity.indiaProgram}</p></div><a href={opportunity.reviewUrl} target="_blank" rel="noreferrer">Read the ACE review ↗</a></header>
            <div className="india-opportunity-facts">
              <div><span>Service geography</span><strong>{opportunity.serviceGeography}</strong></div>
              <div><span>Target population</span><strong>{opportunity.targetPopulation}</strong></div>
              <div><span>Organization-wide room</span><strong>{compactMoney.format(opportunity.organizationFundingRoomUsd)}</strong><small>{opportunity.fundingPeriod} · not allocated to India</small></div>
              <div><span>India-specific room</span><strong>Not published</strong><small>Unknown is not zero</small></div>
            </div>
            <div className="india-native-metrics">
              {opportunity.indiaMetrics.map((metric) => <article key={metric.key}><span>{metric.modelVersion}</span><strong>{integer.format(metric.value)}</strong><h4>{metric.unit}</h4><p>Range {integer.format(metric.low)}–{integer.format(metric.high)}. {metric.limitations}</p></article>)}
              <article className="india-vehicle-gap"><span>DONATION PATH</span><strong>Unassessed</strong><h4>India vehicle and tax treatment</h4><p>The accepted data does not establish headquarters, an India-registered receiving entity, local payment rails, or donor-country deductibility.</p></article>
            </div>
            <footer><strong>Decision boundary.</strong> {opportunity.limitations} Organization-wide funding capacity of {compactMoney.format(opportunity.organizationFundingCapacityUsd)} and room of {compactMoney.format(opportunity.organizationFundingRoomUsd)} do not establish India-program capacity or marginal impact.</footer>
          </div>
        </article>
      </section>

      <section className="india-flows" id="flows">
        <header>
          <div><p className="kicker">GIVEWELL · PUBLISHED GRANTS</p><h2>Follow the money.<br />Keep the denominator.</h2></div>
          <p>The flow lens covers source rows, not recommended opportunities. Multi-country grants keep their full published amount because GiveWell’s accepted export does not provide a country allocation.</p>
        </header>
        <div className="india-flow-summary">
          <div><span>2024–2026 rows</span><strong>{india.summary.recentGrantCount}</strong><small>{compactMoney.format(india.summary.recentPublishedAmountUsd)} in full published amounts</small></div>
          <div><span>India-only rows</span><strong>{india.summary.recentIndiaOnlyGrantCount}</strong><small>{compactMoney.format(india.summary.recentIndiaOnlyPublishedAmountUsd)} can be summed inside the India-only slice</small></div>
          <div><span>Multi-country rows</span><strong>{india.summary.recentMultiCountryGrantCount}</strong><small>{compactMoney.format(india.summary.recentMultiCountryPublishedAmountUsd)} retained but not allocated to India</small></div>
          <div><span>Current Top Charities naming India</span><strong>{india.summary.currentGiveWellTopCharityCount}</strong><small>Historical grants do not create a current Top Charity recommendation</small></div>
        </div>
        <div className="india-flow-boundary"><span>AMOUNT RULE</span><p>{india.interpretation.amount}</p></div>
        <div className="india-flow-grid">
          <section>
            <header><span>RECENT RECIPIENT GROUPS</span><b>Sorted by full published amounts · not effectiveness</b></header>
            <div className="india-recipient-list">{recipientGroups.map((group, index) => <article key={group.recipient}><span>{String(index + 1).padStart(2, '0')}</span><div><h3>{group.recipient}</h3><p>{group.topics.join(' · ')}</p><small>{group.grantCount} grant{group.grantCount === 1 ? '' : 's'} · latest {month.format(new Date(group.latestDecisionDate!))}</small></div><strong>{compactMoney.format(group.publishedAmountUsd)}</strong><footer><span>India-only {compactMoney.format(group.indiaOnlyPublishedAmountUsd)}</span><span>Multi-country {compactMoney.format(group.multiCountryPublishedAmountUsd)}</span></footer></article>)}</div>
          </section>
          <section>
            <header><span>LATEST PUBLISHED ROWS</span><b>{recentGrants.length} shown · decision-date order</b></header>
            <div className="india-grant-list">{recentGrants.map((grant) => <a href={`/grants/givewell/${grant.sourceRecordId}`} key={grant.sourceRecordId}><div><span>{grant.countries.length === 1 ? 'INDIA ONLY' : 'MULTI-COUNTRY'}</span><b>{day.format(new Date(grant.decisionDate))}</b></div><h3>{grant.recipient}</h3><p>{grant.topics.join(' · ') || 'Topic not published'}</p><footer><strong>{money.format(grant.amountUsd)}</strong><span>{grant.countries.join(' · ')}</span></footer></a>)}</div>
          </section>
        </div>
      </section>

      <section className="india-coverage" id="coverage">
        <header><div><p className="kicker">COVERAGE MATRIX</p><h2>What each source<br />can actually tell us.</h2></div><p>A missing structured country field is not a negative finding. It is a boundary on this release: Market for Impact does not search organization names or prose and silently convert those matches into India funding totals.</p></header>
        <div className="india-coverage-grid">{india.evaluatorCoverage.map((row) => <article key={row.evaluator}><div><span>{row.state.replaceAll('-', ' ')}</span><b>{row.evaluator}</b></div><p>{row.evidence}</p><small>{row.boundary}</small><a href={row.sourceUrl} target="_blank" rel="noreferrer">Inspect source ↗</a></article>)}</div>
        <div className="india-open-work"><span>NEXT DILIGENCE</span><p><strong>Opportunity.</strong> Obtain an India-program budget, incremental activity plan, and outcome forecast for the $100K / $1M / $10M cases.</p><p><strong>Entity.</strong> Verify headquarters, Indian registration, FCRA or other relevant receiving constraints, tax treatment, and donation rails.</p><p><strong>Discovery.</strong> Add India-native evaluators, locally registered nonprofits, and source-grounded service geographies without importing a platform’s default order as an impact rank.</p></div>
        <div className="india-sources">{india.sources.map((source) => <a href={source.url} target="_blank" rel="noreferrer" key={source.url}><span>{source.publisher}</span><strong>{source.title}</strong><small>Retrieved {day.format(new Date(source.retrievedAt))}</small><b>↗</b></a>)}</div>
        <p className="data-note">{india.version} · generated {day.format(new Date(india.generatedAt))} · source-grounded country lens · no cross-publisher total</p>
      </section>

      <footer className="india-footer"><div className="brand"><span className="brand-mark">M</span><span>Market for Impact</span></div><p>Geography is evidence, not a keyword.</p><Link href="/">Return to the full market →</Link></footer>
    </main>
  );
}
