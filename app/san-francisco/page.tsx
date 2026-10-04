import type {Metadata} from 'next';
import {topFourResearch} from '@/lib/unified-research-index';
import '../sf-home.css';
import '../givebetter.css';
/* eslint-disable @next/next/no-img-element -- Sourced editorial photographs with reserved dimensions. */
export const metadata:Metadata={
  title:'Our Bay Area Shortlist — GiveBetter x SF',
  description:'The four lowest modeled costs in our Bay Area research, with supporting evidence and reservations.',
  alternates:{canonical:'https://ai.rhyslindmark.com/givebetter/san-francisco'},
  openGraph:{title:'Our Bay Area giving shortlist',description:'The first four organizations in our ranked research list.'},
};
const root='https://ai.rhyslindmark.com/givebetter';
const money=(value:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',notation:'compact',minimumFractionDigits:value>=1e6?1:0,maximumFractionDigits:value>=1e6?1:0}).format(value);
function GivingIllustration({index,label}:{index:number;label:string}){
  return <div className="sf-home-illustration"><img src={root+'/images/givebetter-principles.png'} alt={label} width="600" height="200" style={{transform:`translateX(-${index*100/3}%)`}}/></div>;
}
const editorial:Record<string,{name:string;program:string;overview:string;scope:string;evidence:string;next:string;photo:string;caption:string;source:string}>={
  'self-help-for-the-elderly':{
    name:'Self-Help for the Elderly',program:'Investigate trial-matched fall prevention',
    overview:'Self-Help serves older adults through health, activity and practical support. We investigate a prospective therapeutic tai chi course, not its current six-week Sun-style class.',
    scope:'Conditional 24-week course for SF residents; ordinary-donation expected value unknown.',
    evidence:'An external randomized economic evaluation provides a finite health benchmark. Our estimate includes participant travel and time costs, with local clinical transfer and delivery cost still assumed.',
    next:'Establish a trial-matched delivery proposal, fully supported price and additional places before treating the modeled course as an available funding opportunity.',
    photo:'https://www.selfhelpelderly.org/wp-content/uploads/2014/08/elderly-couple-doing-tai-chi-and-other-senior-activities.jpg',caption:'Tai chi illustration on Self-Help’s service page; not evidence of the modeled curriculum.',source:'https://www.selfhelpelderly.org/our-services/activity-centers/tai-chi',
  },
  recares:{
    name:'The ReCARES Network',program:'Make useful medical equipment accessible',
    overview:'ReCARES redistributes donated mobility aids and home-health supplies through San Francisco, Oakland and Marin.',
    scope:'Reported organization expenses; modeled equipment-related health.',
    evidence:'Current distribution sites and original annual filings support a real, low-cost service. The health estimate remains highly uncertain: receiving equipment is not the same as using it safely and benefiting from it.',
    next:'Establish whether money is the limiting factor. Reconcile available reserves and restrictions with a specific plan for additional safe, useful equipment transfers.',
    photo:'/images/recares.png',caption:'ReCARES volunteers in San Francisco. Photo: ReCARES.',source:'https://www.recares.org/',
  },
  'project-homeless-connect':{
    name:'Project Homeless Connect',program:'Connect people to practical health care',
    overview:'Project Homeless Connect helps people experiencing homelessness access glasses, hearing care, dental care and other practical support.',
    scope:'An ordinary gift to the sponsored project; modeled optical, hearing and dental benefits.',
    evidence:'Current services and fiscal sponsorship by Community Initiatives provide a clearer operating foundation. Clinical studies inform the model, but additional local treatment and lasting benefit are not directly measured.',
    next:'Confirm current project funding and sponsor restrictions, then identify additional appointments a grant would enable. Account for shared patients and partner contributions.',
    photo:'/images/phc.jpg',caption:'Glasses services. Photo: Project Homeless Connect, 2015.',source:'https://www.projecthomelessconnect.org/v44a0929/',
  },
  'hope-pacifica':{
    name:'HOPE Pacifica',program:'Expand community access to naloxone',
    overview:'HOPE provides community naloxone access and overdose-prevention support in Pacifica.',
    scope:'Modeled naloxone-related benefit; operating costs are assumptions.',
    evidence:'Community access points provide a practical route to overdose-response supplies. The modeled benefit depends on additional access beyond public alternatives.',
    next:'Obtain annual operating financials and establish what extra funding adds to existing naloxone access. Missing financial evidence is not evidence of misconduct or inactivity.',
    photo:'https://static.wixstatic.com/media/d891a5_570d50550ecb4b6faadbfdefc7b41b0a~mv2.jpg',caption:'Official logo: HOPE Pacifica.',source:'https://www.hope4change650.org/',
  },
  'hearing-and-speech-center':{
    name:'Hearing and Speech Center of Northern California',program:'Help adults access supported hearing care',
    overview:'The Center’s described pathway combines hearing assessment, fitted aids and follow-up, including a partnership with Project Homeless Connect.',
    scope:'Conditional adult hearing-access model—not a verified donation offer.',
    evidence:'Supported hearing care can improve hearing-related health and day-to-day communication. Local treatment costs and additional lasting benefit remain modeled assumptions.',
    next:'Resolve the receiving entity’s charitable status before a direct gift. The prior IRS-data review did not verify reinstatement or a successor; this does not establish clinic closure.',
    photo:'https://hearingspeech.org/wp-content/themes/hearingspeech/images/logo.png',caption:'Official logo: Hearing and Speech Center of Northern California.',source:'https://hearingspeech.org/',
  },
  'compass-family-services':{
    name:'Compass Family Services',program:'Help families stay housed',
    overview:'Compass’s C-Rent program combines rental assistance with case management for families at risk of losing their homes.',
    scope:'C-Rent program only—not an unrestricted gift to Compass.',
    evidence:'Audited program expenses offer a stronger cost anchor than an assumed budget. Outside research supports homelessness prevention, but the local causal effect and health gains remain estimates.',
    next:'Confirm that a gift can fund additional C-Rent support and establish its current cost and capacity. The model does not value the organization’s other services.',
    photo:'/images/compass.jpg',caption:'Photo: Compass Family Services. Its broader work is pictured, not a verified C-Rent outcome.',source:'https://www.compass-sf.org/our-programs',
  },
  'san-francisco-aids-foundation':{
    name:'San Francisco AIDS Foundation',program:'Improve access to prevention and care',
    overview:'San Francisco AIDS Foundation provides sexual-health services, HIV prevention, harm reduction and support for people affected by HIV.',
    scope:'An ordinary gift; modeled overdose-prevention and PrEP benefits.',
    evidence:'Current audited financial statements and established clinical services support further diligence. The estimated allocation of new donations across services is a judgment, not an offered funding package.',
    next:'Obtain a current marginal budget: which additional people could be served, what other funding already covers, and which constraints a donation would resolve.',
    photo:'/images/sfaf.jpg',caption:'Harm reduction at San Francisco AIDS Foundation. Photo: SFAF.',source:'https://www.sfaf.org/health-services/overdose-prevention-response/',
  },
};
const picks=topFourResearch.map(entry=>{
  const slug=entry.href.split('/').at(-1)!;
  if(entry.localUsdPerTenQalys===null||!editorial[slug])throw new Error('Incomplete ranked shortlist: '+slug);
  return {slug,...editorial[slug],price:entry.localUsdPerTenQalys};
});
export default function SanFranciscoHome(){
  return <div className="sf-home givebetter">
    <header className="givebetter-masthead"><a href={root+'/san-francisco'}>Give<span>Better</span> <small>x SF</small></a></header>
    <main>
      <section className="sf-home-intro">
        <h1>Our Bay Area Shortlist</h1>
        <p className="sf-home-lead">The four lowest modeled costs in our Bay Area research.</p>
        <small>Last updated: October 4, 2026</small>
        <details className="sf-home-selection"><summary>What this shortlist means</summary><p>The same four organizations appear first in <a href={root+'/san-francisco/all'}>the full research list</a>, in the same order. These are research leads, not fully vetted grant recommendations. Low modeled cost does not establish financial transparency, a verified recipient or room for more funding.</p><p>HOPE Pacifica’s annual financials remain unverified. The Hearing and Speech Center’s charitable-recipient status needs resolution before a direct gift. Those concerns are retained in the reports and do not change the ranking.</p></details>
      </section>
      <section className="sf-home-principles" aria-label="How to give better">
        <div><GivingIllustration index={0} label="Illustration of San Francisco Bay"/><h2>Look for meaningful impact</h2><p>Compare how a donation could improve health in the Bay Area.</p></div>
        <div><GivingIllustration index={1} label="Illustration of research books"/><h2>Follow the evidence</h2><p>Separate promising estimates from verified results and additional funding needs.</p></div>
        <div><GivingIllustration index={2} label="Illustration of choosing a charity"/><h2>Choose with care</h2><p>Read the report and confirm what your gift would fund before donating.</p></div>
      </section>
      <section aria-label="Four research leads">{picks.map((pick,i)=><article className="sf-home-charity" id={pick.slug} key={pick.slug}>
        <figure><img src={pick.photo.startsWith('https://')?pick.photo:root+pick.photo} alt={pick.caption} width="480" height="480" loading="lazy" style={pick.photo.startsWith('https://')?{objectFit:'contain',background:'#fff'}:undefined}/><figcaption><a href={pick.source}>{pick.caption}</a></figcaption></figure>
        <div><p className="sf-home-eyebrow">RESEARCH LEAD {i+1} OF 4</p><h2>{pick.program}</h2>
          <div className="sf-home-charity-body">
            <section><h3>Overview</h3><p>{pick.overview}</p></section>
            <section><h3>Cost-effectiveness</h3><p><strong>{money(pick.price)} per better life (10 health and income-equivalent years)</strong>, modeled.</p><p className="sf-home-scope">{pick.scope}</p></section>
            <section><h3>Why investigate</h3><p>{pick.evidence}</p></section>
            <section><h3>Before recommending a grant</h3><p>{pick.next}</p></section>
            <section><h3>Organization and research</h3><div className="sf-home-org-card"><h4>{pick.name}</h4><a className="sf-home-report" href={`${root}/charities/${pick.slug}`}>Full research report</a></div></section>
          </div>
        </div>
      </article>)}</section>
      <footer className="sf-home-footer"><a href={`${root}/san-francisco/all`}>All San Francisco research</a><span className="sf-footer-separator" aria-hidden="true">·</span><a href={`${root}/all`}>All cities and regions</a></footer>
    </main>
  </div>;
}
