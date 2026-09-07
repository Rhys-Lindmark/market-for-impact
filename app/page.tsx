import type { Metadata } from 'next';
import glide from '@/data/san-francisco/glide-rental-assistance-qaly-bridge-audit-v1.json';
import compass from '@/data/san-francisco/compass-c-rent-qaly-bridge-audit-v1.json';
import hamilton from '@/data/san-francisco/hamilton-prevention-qaly-bridge-audit-v1.json';
import fiveKeys from '@/data/san-francisco/five-keys-credential-qaly-bridge-v1.json';
import './sf-home.css';

export const metadata: Metadata = {
  title: 'Our top San Francisco charities — Market for Impact',
  description: 'Our current San Francisco shortlist, compared by estimated dollars per better life: 10 additional quality-adjusted life years.',
  alternates: { canonical: 'https://ai.rhyslindmark.com/donate' },
  openGraph: { title: 'Our top San Francisco charities', description: 'Four current picks, transparent estimates, and the research behind them.' },
};

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumSignificantDigits: 3 });
const root = 'https://ai.rhyslindmark.com/donate';
const picks = [
  { slug: 'glide', name: 'GLIDE', program: 'Keep a housing crisis from becoming homelessness', overview: 'Rental, deposit, and move-in assistance helps San Francisco residents resolve a cash shortfall and stay housed.', opinion: 'Our strongest current lead. A relatively small, well-timed payment may prevent a much larger crisis.', evidence: 'Encouraging local reporting and outside prevention studies. The health gain and current delivery cost are estimates.', reservation: 'The $3,077 case cost is modeled from a historical cohort. Confirm what a new gift would actually fund.', model: glide.modeledBridge },
  { slug: 'compass-family-services', name: 'Compass Family Services', program: 'Help families catch up on rent', overview: 'C-Rent combines back-rent and move-in assistance with case management for families at risk of losing their homes.', opinion: 'A promising family-homelessness prevention option, with a clearer audited cost starting point.', evidence: 'Audited program spending and external prevention research. The family count and health effect need local verification.', reservation: 'The $9,704 cost per family is an accounting ratio, not a confirmed price for an additional family.', model: compass.modeledBridge },
  { slug: 'hamilton-families', name: 'Hamilton Families', program: 'Prevent family homelessness', overview: 'Flexible financial assistance and case management aim to keep at-risk families out of homelessness.', opinion: 'A promising alternative to Compass. Their estimates are too close and uncertain to distinguish meaningfully.', evidence: 'An external randomized prevention study supports the mechanism. Hamilton-specific costs and health gains are modeled.', reservation: 'The $10,000 cost per family is a judgment call. A prevention-only budget would materially improve this estimate.', model: hamilton.modeledBridge },
  { slug: 'five-keys', name: 'Five Keys Schools and Programs', program: 'Help adults finish secondary education', overview: 'Flexible instruction in custody and community settings helps people earn a high-school diploma or equivalent credential.', opinion: 'Our fourth current research pick. Education could deliver lasting benefits, but the local health case is less established.', evidence: 'Audited costs, an assumed increase in credentials, and an external education-to-health model.', reservation: 'The estimate covers the broader program, not an isolated SF donation. Verify local use and whether private money adds instruction.', model: fiveKeys.modeledBridge },
];

export default function SanFranciscoHome() {
  return <div className="sf-home">
    <header className="sf-home-nav"><a href={root} className="sf-home-brand">Market for Impact</a><a href={`${root}/research`}>Our research ↗</a></header>
    <main>
      <section className="sf-home-intro">
        <p className="sf-home-eyebrow">SAN FRANCISCO GIVING</p>
        <h1>Our top charities</h1>
        <p className="sf-home-lead">Where could your next dollar make life better in San Francisco?</p>
        <p>These four programs have the lowest central cost estimates in our completed models so far. They are our current research picks, with very low confidence and funding capacity still to verify.</p>
        <p className="sf-home-unit"><strong>One better life = 10 additional QALYs.</strong> That means ten years of life in full health, or equivalent health gains spread across people. These are modeled health benefits, not a count of people served.</p>
        <small>Shortlist updated 7 September 2026 · Models dated 31 August–1 September 2026</small>
      </section>
      <nav className="sf-home-jump" aria-label="Jump to a charity">{picks.map(p => <a key={p.slug} href={`#${p.slug}`}>{p.name} ↓</a>)}</nav>
      <section aria-label="Four current charity picks">{picks.map((pick, i) => <article className="sf-home-charity" id={pick.slug} key={pick.slug}>
        <div className="sf-home-charity-title"><p className="sf-home-eyebrow">CHARITY {i + 1} OF 4</p><h2>{pick.program}</h2><a href={`${root}/charities/${pick.slug}`} className="sf-home-org">{pick.name} ↗</a></div>
        <div className="sf-home-charity-body">
          <div><h3>Overview</h3><p>{pick.overview}</p><h3>Our take</h3><p>{pick.opinion}</p><h3>Evidence of impact</h3><p>{pick.evidence}</p></div>
          <div className="sf-home-estimate"><h3>Cost-effectiveness</h3><strong className="sf-home-price">≈ {money.format(pick.model.bestCostPerTenQalysUsd)}</strong><p className="sf-home-price-unit">per better life · 10 QALYs</p><p>≈ {money.format(pick.model.costPerQalyUsd)} per QALY</p><p className="sf-home-range">Positive-effect scenarios: {money.format(pick.model.positiveEffectRangeUsd.low)}–{money.format(pick.model.positiveEffectRangeUsd.high)} per better life.</p><details><summary>What could change this estimate?</summary><p>{pick.reservation}</p><p>The scenario range is not a confidence interval. If the program produces no extra health benefit, or a gift replaces other funding, the cost per better life has no finite upper bound.</p></details><p className="sf-home-funding">Room for more funding: not yet verified.</p></div>
        </div>
        <a className="sf-home-report" href={`${root}/charities/${pick.slug}`}>Full research report &amp; cost-effectiveness model →</a>
      </article>)}</section>
      <footer className="sf-home-footer"><p>The three housing estimates share the same transferred health-effect assumption. Their apparent advantage is a research lead to test; it does not establish that other programs are ineffective.</p><a href={`${root}/research`}>Rest of the research →</a></footer>
    </main>
  </div>;
}
