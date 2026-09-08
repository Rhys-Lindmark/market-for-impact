import type { Metadata } from 'next';
import glide from '@/data/san-francisco/glide-rental-assistance-qaly-bridge-audit-v1.json';
import compass from '@/data/san-francisco/compass-c-rent-qaly-bridge-audit-v1.json';
import { researchCostRanking, researchRankBySlug } from '@/lib/research-cost-ranking.mjs';

import './sf-home.css';

export const metadata: Metadata = {
  title: 'Our top San Francisco charities — Market for Impact',
  description: 'Our current San Francisco shortlist, compared by estimated dollars per better life: 10 additional quality-adjusted life years.',
  alternates: { canonical: 'https://ai.rhyslindmark.com/donate' },
  openGraph: { title: 'Our top San Francisco charities', description: 'Four current picks, transparent estimates, and the research behind them.' },
};

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumSignificantDigits: 3 });
const root = 'https://ai.rhyslindmark.com/donate';
const picksBySlug = [
  { slug: 'north-east-medical-services', name: 'North East Medical Services', program: 'Reconnect people to ongoing hepatitis B care', overview: 'Additional follow-up could help adults receive monitoring and indicated treatment before serious liver disease develops.', opinion: 'A promising prevention mechanism, but this ranking relies on a very uncertain adaptation of an external lifetime model.', evidence: 'Published economic modeling and verified local services; no causal estimate of an additional NEMS donation.', reservation: 'The estimate pays for20 years of recurring support. Local effect, health timing and additionality are judgments; existing ReLink funding may displace a gift.', model: null },
  { slug: 'san-francisco-aids-foundation', name: 'San Francisco AIDS Foundation', program: 'Reach otherwise uncovered overdoses', overview: 'Targeted naloxone outreach and training could help witnesses respond to overdoses that would otherwise be fatal.', opinion: 'Our lowest central estimate and a high-priority funding question—not a verified offer of these health gains.', evidence: 'Local distribution reports and external survival evidence, connected by explicit analyst assumptions.', reservation: 'Existing free supply, alternative rescue and repeat recipients can erase much of the marginal benefit. Reported reversals are not lives saved.', model: null },
  { slug: 'project-homeless-connect', name: 'Project Homeless Connect', program: 'Restore useful vision with prescription glasses', overview: 'Core Senses helps people experiencing homelessness obtain prescription glasses and navigate access barriers.', opinion: 'A promising inexpensive access intervention. Investigate an additional dispensing tranche before committing a large gift.', evidence: 'Current giving benchmarks and an external uncontrolled health-utility study; local utility gains remain unmeasured.', reservation: 'The model assumes $100 per completed dispense and discounts utility and additionality. Public coverage, in-kind resources and sustained use need verification.', model: null },
  { slug: 'glide', name: 'GLIDE', program: 'Keep a housing crisis from becoming homelessness', overview: 'Rental, deposit, and move-in assistance helps San Francisco residents resolve a cash shortfall and stay housed.', opinion: 'Our strongest current housing lead. A relatively small, well-timed payment may prevent a much larger crisis.', evidence: 'Encouraging local reporting and outside prevention studies. The health gain and current delivery cost are estimates.', reservation: 'The $3,077 case cost is modeled from a historical cohort. Confirm what a new gift would actually fund.', model: glide.modeledBridge },
  { slug: 'compass-family-services', name: 'Compass Family Services', program: 'Help families catch up on rent', overview: 'C-Rent combines back-rent and move-in assistance with case management for families at risk of losing their homes.', opinion: 'A promising family-homelessness prevention option, with a clearer audited cost starting point.', evidence: 'Audited program spending and external prevention research. The family count and health effect need local verification.', reservation: 'The $9,704 cost per family is an accounting ratio, not a confirmed price for an additional family.', model: compass.modeledBridge },
];

const picks = researchCostRanking.slice(0, 4).map(row => {
  const pick = picksBySlug.find(p => p.slug === row.slug);
  if (!pick) throw new Error('Missing homepage summary for ' + row.slug);
  const rank = researchRankBySlug.get(row.slug)!;
  return { ...pick, model: { bestCostPerTenQalysUsd: rank.centralUsdPerTenQalys, costPerQalyUsd: rank.centralUsdPerTenQalys / 10, positiveEffectRangeUsd: pick.model?.positiveEffectRangeUsd ?? rank.positiveEffectRangeUsd } };
});

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
        <small>Shortlist updated 7 September 2026 · Models reviewed through 7 September 2026</small>
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
      <footer className="sf-home-footer"><p>Ordered by central modeled dollars per 10 QALYs, not evidence strength. Cost scopes and health assumptions differ substantially; the NEMS estimate includes recurring navigation but excludes publicly financed clinical care. These are research leads, not proof that other charities are ineffective.</p><a href={`${root}/research`}>Rest of the research →</a></footer>
    </main>
  </div>;
}
