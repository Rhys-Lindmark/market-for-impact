import type { Metadata } from 'next';
import glide from '@/data/san-francisco/glide-rental-assistance-qaly-bridge-audit-v1.json';
import compass from '@/data/san-francisco/compass-c-rent-qaly-bridge-audit-v1.json';
import { researchRankBySlug } from '@/lib/research-cost-ranking.mjs';
import {unifiedResearch} from '@/lib/unified-research-index';

import './sf-home.css';
import './givebetter.css';
/* eslint-disable @next/next/no-img-element -- Static editorial photos with reserved dimensions. */

export const metadata: Metadata = {
  title: 'Our Top Charities — GiveBetter x SF',
  description: 'Our current San Francisco shortlist, compared by estimated dollars per better life: 10 additional quality-adjusted life years.',
  alternates: { canonical: 'https://ai.rhyslindmark.com/givebetter' },
  openGraph: { title: 'Our top San Francisco charities', description: 'Four current picks, transparent estimates, and the research behind them.' },
};

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumSignificantDigits: 3 });
const root = 'https://ai.rhyslindmark.com/givebetter';
function GivingIllustration({ index, label }: { index:number; label:string }) {
  return <div className="sf-home-illustration"><img src={`${root}/images/givebetter-principles.png`} alt={label} width="600" height="200" style={{transform:`translateX(-${index * 100 / 3}%)`}} /></div>;
}
const photos: Record<string, { src: string; caption: string; source: string }> = {
  'san-francisco-aids-foundation': { src: '/images/sfaf.jpg', caption: 'Harm reduction at San Francisco AIDS Foundation. Photo: SFAF.', source: 'https://www.sfaf.org/health-services/overdose-prevention-response/' },
  'project-homeless-connect': { src: '/images/phc.jpg', caption: 'Reading and prescription glasses services. Photo: Project Homeless Connect, 2015.', source: 'https://www.projecthomelessconnect.org/v44a0929/' },
  glide: { src: '/images/glide.jpg', caption: 'GLIDE Women’s Center staff. Photo: GLIDE. The housing model reviews rental assistance separately.', source: 'https://www.glide.org/compassionate-case-management-at-glides-womens-center/' },
  'breathe-california': { src: '/images/breathe.png', caption: 'Breathe California community outreach, 2019. Photo: Breathe California; not a pictured cessation session.', source: 'https://lungsrus.org/' },
};
const picksBySlug = [
  { slug: 'recares', name: 'The ReCARES Network', program: 'Make useful medical equipment accessible', overview: 'ReCARES redistributes donated mobility aids and home-health supplies through San Francisco, Oakland and Marin. The model charges the whole organization’s cash costs.', opinion: 'A very uncertain exploratory estimate, not a verified giving recommendation or marginal funding offer.', evidence: 'Lean reported delivery costs make this worth investigating. Controlled walking-aid studies do not establish the assumed quality-of-life gain.', reservation: 'A favorable scenario supplies 69% of expected benefit. Unique recipients, safe use and additional cash-enabled capacity are unmeasured; donated equipment and volunteer resources are not fully valued.', model: null },
  { slug: 'project-homeless-connect', name: 'Project Homeless Connect', program: 'Connect people to practical health care', overview: 'The whole-gift model includes glasses, hearing aids and dental care for people facing homelessness, with other portfolio health still unquantified.', opinion: 'A conditional whole-gift estimate with substantial uncertainty, not a verified marginal funding offer.', evidence: 'External clinical utility evidence and local services inform explicit assumptions about earlier, additional care.', reservation: 'Shared hearing outcomes with the Hearing and Speech Center must not be counted twice. Actual marginal capacity, alternative care and full portfolio benefits need further verification.', model: null },
  { slug: 'operation-access', name: 'Operation Access', program: 'Help patients complete needed diagnostic care', overview: 'Operation Access coordinates donated specialist care for uninsured patients. This review models follow-up after an abnormal stool test for an SF adult.', opinion: 'A conditional diagnostic-access estimate, not the value of an ordinary unrestricted gift to the whole organization.', evidence: 'Local records establish the pathway; additional health and financing effects are analyst judgments.', reservation: 'Donated care consumes resources. Including assumed outside resources raises the central price to about $1.01M per10 QALYs. Marginal capacity is unverified.', model: null },
  { slug: 'pacific-vision-foundation', name: 'Pacific Vision Foundation', program: 'Help eligible patients receive cataract care sooner', overview: 'The foundation supports a shared charity-care pathway with the Lions clinic and clinical partners. This review models earlier first-eye surgery for an uninsured SF resident.', opinion: 'A conditional program estimate, not the value of every unrestricted foundation gift.', evidence: 'An external randomized study anchors one year of earlier-care benefit; local costs and additionality remain judgments.', reservation: 'The $1,000 case budget is unquoted. Later surgery without the gift can shorten benefit; partner health must not be counted twice. Funding room is unverified.', model: null },
  { slug: 'breathe-california', name: 'Breathe California', program: 'Help more adults quit smoking', overview: 'A proposed additional six-session course could produce sustained quits and prevent later illness.', opinion: 'An attractive mechanism to investigate, but current SF delivery and marginal pricing are not verified.', evidence: 'External lifetime health calibration; local quit effect, cost and funding additionality are judgments.', reservation: 'This is a conditional course model, not an available local offer. It excludes medication costs; free existing support changes the counterfactual.', model: null },
  { slug: 'north-east-medical-services', name: 'North East Medical Services', program: 'Reconnect people to ongoing hepatitis B care', overview: 'Additional follow-up could help adults receive monitoring and indicated treatment before serious liver disease develops.', opinion: 'A promising prevention mechanism, but this ranking relies on a very uncertain adaptation of an external lifetime model.', evidence: 'Published economic modeling and verified local services; no causal estimate of an additional NEMS donation.', reservation: 'The estimate pays for20 years of recurring support. Local effect, health timing and additionality are judgments; existing ReLink funding may displace a gift.', model: null },
  { slug: 'glide', name: 'GLIDE', program: 'Keep a housing crisis from becoming homelessness', overview: 'Rental, deposit, and move-in assistance helps San Francisco residents resolve a cash shortfall and stay housed.', opinion: 'Our strongest current housing lead. A relatively small, well-timed payment may prevent a much larger crisis.', evidence: 'Encouraging local reporting and outside prevention studies. The health gain and current delivery cost are estimates.', reservation: 'The $3,077 case cost is modeled from a historical cohort. Confirm what a new gift would actually fund.', model: glide.modeledBridge },
  { slug: 'compass-family-services', name: 'Compass Family Services', program: 'Help families catch up on rent', overview: 'C-Rent combines back-rent and move-in assistance with case management for families at risk of losing their homes.', opinion: 'A promising family-homelessness prevention option, with a clearer audited cost starting point.', evidence: 'Audited program spending and external prevention research. The family count and health effect need local verification.', reservation: 'The $9,704 cost per family is an accounting ratio, not a confirmed price for an additional family.', model: compass.modeledBridge },
];

const picks = unifiedResearch.filter(row => row.localUsdPerTenQalys !== null).slice(0, 4).map(item => {
  const row = {slug: item.href.split('/').at(-1)!};
  const pick = picksBySlug.find(p => p.slug === row.slug);
  if (!pick) throw new Error('Missing homepage summary for ' + row.slug);
  const rank = researchRankBySlug.get(row.slug);
  return { ...pick, model: { bestCostPerTenQalysUsd: item.localUsdPerTenQalys, costPerQalyUsd: item.localUsdPerTenQalys / 10, positiveEffectRangeUsd: pick.model?.positiveEffectRangeUsd ?? rank?.positiveEffectRangeUsd } };
});

export default function SanFranciscoHome() {
  return <div className="sf-home givebetter">
    <header className="givebetter-masthead"><a href={root}>Give<span>Better</span> <small>x SF</small></a></header>
    <main>
      <section className="sf-home-intro">
        <h1>Our Top Charities</h1>
        <p className="sf-home-lead">Find promising ways to make life better in San Francisco.</p>
        <small>Last updated: September 2026</small>
      </section>
      <section className="sf-home-principles" aria-label="How to give better">
        <div><GivingIllustration index={0} label="Illustration of San Francisco Bay" /><h2>Give to cost-effective programs</h2><p>We compare how much an additional donation could improve health and lives in San Francisco.</p></div>
        <div><GivingIllustration index={1} label="Illustration of research books" /><h2>Donate based on evidence</h2><p>Read the research behind each estimate, including the assumptions and what could change our view.</p></div>
        <div><GivingIllustration index={2} label="Illustration of choosing a charity" /><h2>Pick a charity</h2><p>Explore our current shortlist, then check each report’s giving options and funding limitations.</p></div>
      </section>
      <section aria-label="Four current charity picks">{picks.map((pick, i) => <article className="sf-home-charity" id={pick.slug} key={pick.slug}>
        <figure>{photos[pick.slug] ? <><img src={`${root}${photos[pick.slug].src}`} alt={photos[pick.slug].caption} width="480" height="480" loading="lazy" /><figcaption><a href={photos[pick.slug].source}>{photos[pick.slug].caption}</a></figcaption></> : <div className="sf-home-research-note"><h3>{pick.name}</h3>{pick.slug==='recares'?<><p>Whole-organization research</p><p>Exploratory equipment-reuse model. Recipient health gains and marginal funding capacity are unverified.</p></>:<><p>Program-specific research</p><p>This estimate concerns the clinical pathway described here, not an unrestricted organization-wide gift.</p></>}</div>}</figure>
        <div><p className="sf-home-eyebrow">CHARITY {i + 1} OF 4</p><h2>{pick.program}</h2>
          <div className="sf-home-charity-body">
            <section><h3>Overview</h3><p>{pick.overview}</p></section>
            <section><h3>Cost-effectiveness</h3><p>Our modeled estimate is <strong>{money.format(pick.model.bestCostPerTenQalysUsd)} per better life (10 QALYs)</strong>. {pick.opinion}</p></section>
            <section><h3>Evidence of impact</h3><p>{pick.evidence}</p><p>{pick.reservation}</p></section>
            <section><h3>Organization and research</h3><div className="sf-home-org-card"><h4>{pick.name}</h4><a className="sf-home-report" href={`${root}/charities/${pick.slug}`}>Full research report</a></div></section>
          </div>
        </div>
      </article>)}</section>
      <footer className="sf-home-footer"><a href={`${root}/research`}>All research</a><p>Independent research. Not affiliated with GiveWell or the organizations reviewed.</p></footer>
    </main>
  </div>;
}
