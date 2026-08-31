import type { Metadata } from 'next';
import Link from 'next/link';
import review from '@/data/san-francisco/institute-on-aging-review-v1.json';
import model from '@/data/san-francisco/institute-on-aging-cea-v1.json';

export const metadata: Metadata = {
  title: 'Institute on Aging — charity research | Market for Impact',
  description: 'Our evidence review and exploratory cost-effectiveness model for Institute on Aging’s Friendship Line.',
};

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const number = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });
const percent = new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 0 });
const formatInput = (value: number, unit: string) => unit.includes('proportion') || unit.includes('remissions') ? percent.format(value) : number.format(value) + ' ' + unit;

export default function InstituteOnAgingResearchPage() {
  const marginalCost = model.inputs.find((input) => input.key === 'marginal_cost_per_participant_usd')!;
  const causalEffect = model.inputs.find((input) => input.key === 'causal_six_month_remission_probability')!;
  return (
    <main className="charity-report">
      <header className="charity-report-topbar">
        <Link className="brand" href="/"><span className="brand-mark">M</span><span>Market for Impact</span></Link>
        <nav aria-label="Charity report navigation"><a href="#nutshell">In a nutshell</a><a href="#program">The program</a><a href="#cost-effectiveness">Cost-effectiveness</a><a href="#reservations">Reservations</a></nav>
        <a className="charity-report-donate" href={review.organization.donationUrl} target="_blank" rel="noreferrer">Donation route ↗</a>
      </header>

      <div className="charity-report-layout">
        <aside className="charity-report-toc" aria-label="On this page">
          <span>ON THIS PAGE</span>
          <a href="#nutshell">In a nutshell</a><a href="#summary">Summary</a><a href="#program">How the program works</a><a href="#cost-effectiveness">Cost-effectiveness model</a><a href="#evidence">Evidence</a><a href="#reservations">How we could be wrong</a><a href="#sources">Sources</a>
          <small>Published 31 August 2026<br />Model {model.version}</small>
        </aside>

        <article className="charity-report-article">
          <header className="charity-report-title">
            <p className="kicker">CHARITY RESEARCH · SAN FRANCISCO / CALIFORNIA</p>
            <h1>Institute on Aging</h1>
            <p>Friendship Line proactive outbound calls for older adults experiencing loneliness</p>
          </header>

          <section className="charity-nutshell" id="nutshell">
            <span>IN A NUTSHELL</span>
            <h2>Promising human connection. A weak causal record. Not yet a funding recommendation.</h2>
            <p>Institute on Aging runs a free, multilingual 24/7 support line for older adults, adults with disabilities, and caregivers. A six-month pilot reported a substantial decline in loneliness among 121 enrolled health-plan members, but it had no control group. Our exploratory model estimates <strong>about {money.format(model.bottomLine.costPerAdditionalSixMonthRemissionUsd)} per additional six-month loneliness remission</strong>, with a deliberately wide <strong>{money.format(model.bottomLine.plausibleRangeUsd.low)}–{money.format(model.bottomLine.plausibleRangeUsd.high)}</strong> range.</p>
            <ul>
              <li><strong>Why it may work:</strong> proactive, repeated human contact directly targets loneliness and removes access barriers.</li>
              <li><strong>Why we are cautious:</strong> the observed 18-point decline may partly reflect selection, regression to the mean, pandemic-era change, or follow-up bias.</li>
              <li><strong>What blocks a recommendation:</strong> IOA has not published program accounts, a marginal capacity plan, or evidence that a private gift adds calls rather than replacing public funding.</li>
            </ul>
          </section>

          <section className="charity-summary" id="summary">
            <div><span>OUR BEST GUESS</span><strong>{money.format(model.bottomLine.costPerAdditionalSixMonthRemissionUsd)}</strong><p>per additional participant below the study’s loneliness threshold at six months</p></div>
            <div><span>PLAUSIBLE RANGE</span><strong>{money.format(model.bottomLine.plausibleRangeUsd.low)}–{money.format(model.bottomLine.plausibleRangeUsd.high)}</strong><p>driven by unknown program cost and an uncontrolled effect estimate</p></div>
            <div><span>EVIDENCE</span><strong>Suggestive</strong><p>one relevant single-group pilot; no randomized or concurrent comparison</p></div>
            <div><span>FUNDING ROOM</span><strong>Not published</strong><p>the modeled {money.format(model.bottomLine.giftUsd)} is illustrative, not verified room</p></div>
          </section>

          <section className="charity-section" id="program">
            <p className="charity-section-number">1 · THE BASICS</p>
            <h2>How does the program work?</h2>
            <p>The Friendship Line combines inbound emotional support and crisis intervention with outbound check-ins. For the specific pathway we model, staff or trained volunteers proactively call an enrolled older adult over six months. The intended mechanism is simple: reliable conversation and active listening may reduce acute isolation, create an ongoing relationship, and connect a caller to additional support.</p>
            <div className="charity-program-flow" aria-label="Friendship Line program model">
              <div><span>01</span><strong>Identify</strong><p>An older adult is referred or opts into proactive calls.</p></div>
              <div><span>02</span><strong>Connect</strong><p>Trained staff or volunteers make repeated outbound calls.</p></div>
              <div><span>03</span><strong>Support</strong><p>Conversation, listening, crisis response, and referral address immediate needs.</p></div>
              <div><span>04</span><strong>Measure</strong><p>Loneliness and mental-health outcomes are followed over time.</p></div>
            </div>
            <aside className="charity-boundary"><strong>Scope boundary</strong>IOA reports more than 11,000 inbound and outbound calls per month. Calls are not unique participants, a standardized dose, resolved crises, or additional outcomes. This model covers only a hypothetical six-month proactive-call cohort.</aside>
          </section>

          <section className="charity-section charity-model" id="cost-effectiveness">
            <p className="charity-section-number">2 · COST-EFFECTIVENESS</p>
            <h2>Our current model: roughly $15,000 per six-month loneliness remission.</h2>
            <p>We start with the observed fall in loneliness from 46% to 28%, then heavily discount it because the study had no control group. We separately build a bottom-up participant cost because IOA does not publish Friendship Line program accounts. Every number below should be replaced when IOA provides better data.</p>
            <div className="charity-model-equation"><span>MODELED COST PER ADDITIONAL REMISSION</span><strong>{money.format(marginalCost.best)} ÷ {percent.format(causalEffect.best)}</strong><b>= {money.format(model.bottomLine.costPerAdditionalSixMonthRemissionUsd)}</b></div>
            <div className="charity-model-table" role="table" aria-label="Institute on Aging cost-effectiveness assumptions">
              <div role="row"><span role="columnheader">Input</span><span role="columnheader">Best guess</span><span role="columnheader">Range</span><span role="columnheader">Basis</span></div>
              {model.inputs.slice(1).map((input) => (
                <div role="row" key={input.key}>
                  <strong role="cell">{input.label}<small>{input.confidence} confidence</small></strong>
                  <span role="cell">{formatInput(input.best, input.unit)}</span>
                  <span role="cell">{formatInput(input.low, input.unit)}–{formatInput(input.high, input.unit)}</span>
                  <p role="cell">{input.basis}</p>
                </div>
              ))}
            </div>
            <h3>What would {money.format(model.bottomLine.giftUsd)} buy?</h3>
            <div className="charity-sensitivity">{model.sensitivity.map((row) => <article key={row.case}><span>{row.case}</span><strong>{number.format(row.additionalRemissionsPer100k)} additional remissions</strong><p>{number.format(row.participantsPer100k)} participants · {money.format(row.costPerAdditionalRemissionUsd)} each</p></article>)}</div>
            <aside className="charity-boundary"><strong>This is not verified room for more funding.</strong>{model.fundingRoom.boundary}</aside>
          </section>

          <section className="charity-section" id="evidence">
            <p className="charity-section-number">3 · EVIDENCE</p>
            <h2>What does the evidence actually show?</h2>
            <div className="charity-evidence-list">{review.evidence.map((item, index) => <article key={item.key}><span>{String(index + 1).padStart(2, '0')} · {item.design}</span><h3>{item.population}</h3><p>{item.result}</p><aside><strong>Our read</strong>{item.transfer}</aside></article>)}</div>
          </section>

          <section className="charity-section" id="reservations">
            <p className="charity-section-number">4 · HOW WE COULD BE WRONG</p>
            <h2>The most important uncertainties are causal—not cosmetic.</h2>
            <ol className="charity-reservations">{review.reservations.map((reservation) => <li key={reservation}>{reservation}</li>)}</ol>
            <h3>Benefits we deliberately excluded</h3>
            <ul>{model.excludedBenefits.map((benefit) => <li key={benefit}>{benefit}</li>)}</ul>
          </section>

          <section className="charity-section charity-sources" id="sources">
            <p className="charity-section-number">5 · SOURCES</p>
            <h2>Research trail</h2>
            {review.sources.map((source) => <a href={source.url} target="_blank" rel="noreferrer" key={source.url}><span>{source.sourceType} · {source.published}</span><strong>{source.title}</strong><small>{source.publisher} · retrieved {source.retrieved}</small></a>)}
          </section>
        </article>
      </div>
    </main>
  );
}
