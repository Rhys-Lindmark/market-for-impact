/* eslint-disable @next/next/no-img-element -- Reuse the existing editorial illustrations. */
import type {EditionReport} from '@/lib/published-geography-reports';
import {canonicalBase,editionPath} from '@/lib/geography-editions.mjs';
import {editionReportPath,formatEditionMoney,reportPrice} from '@/lib/geography-reports.mjs';
import highlights from '@/data/edition-highlights.json';
import '@/app/sf-home.css';

export default function EditionDonorHome({id,label,reports,discovery,alpha,beta}:{id:string;label:string;reports:EditionReport[];discovery:number;alpha:number;beta:number}){
 const path=editionPath(id);
 const photos=highlights as Record<string,{image:string;source:string;caption:string}>;
 const leading=reports.filter(r=>reportPrice(r)!==null).sort((a,b)=>reportPrice(a)!-reportPrice(b)!).slice(0,4);
 const picks=alpha>=25&&beta>=10&&leading.every(r=>photos[r.edition+'/'+r.slug])?leading:[];
 const principles=[
  ['Look for meaningful impact',`Compare how a donation could improve health in ${label}.`,'Map illustration'],
  ['Follow the evidence','Understand the outcomes, costs and assumptions behind each estimate.','Illustration of research books'],
  ['Choose with care','Read the report and confirm what additional donations could achieve.','Illustration of choosing a charity'],
 ];
 return <div className="sf-home givebetter">
  <header className="givebetter-masthead"><a href={canonicalBase+'/all'}>Give<span>Better</span> <small>x {label}</small></a></header>
  <main>
   <section className="sf-home-intro">
    <h1>Giving in {label}</h1>
    <p className="sf-home-lead">Find promising ways to improve lives, guided by evidence and estimated impact.</p>
    {picks.length===0&&<small>Our four-charity shortlist is being researched. Explore the full research list.</small>}
   </section>
   <section className="sf-home-principles" aria-label="How to give better">
    {principles.map(([title,copy,alt],i)=><div key={title}><div className="sf-home-illustration"><img src={canonicalBase+'/images/givebetter-principles.png'} alt={alt} width="600" height="200" style={{transform:`translateX(-${i*100/3}%)`}}/></div><h2>{title}</h2><p>{copy}</p></div>)}
   </section>
   {picks.length===4&&<section aria-label="Four research leads">{picks.map((report,i)=>{
    const photo=photos[report.edition+'/'+report.slug];
    return <article className="sf-home-charity" key={report.slug} id={report.slug}>
     <figure><img src={photo.image.startsWith('https://')?photo.image:canonicalBase+photo.image} alt={photo.caption} width="480" height="480" loading="lazy"/><figcaption><a href={photo.source}>{photo.caption}</a></figcaption></figure>
     <div><p className="sf-home-eyebrow">RESEARCH LEAD {i+1} OF 4</p><h2>{report.organization}</h2>
      <div className="sf-home-charity-body">
       <section><h3>Overview</h3><p>{report.summary.what.join(' ')}</p></section>
       <section><h3>Cost-effectiveness</h3><p><strong>{formatEditionMoney(reportPrice(report))} per better life (10 healthy-year equivalents)</strong>, modeled in {label}.</p></section>
       <section><h3>Why investigate</h3><p>{report.summary.strengths[0]}</p></section>
       <section><h3>Main reservation</h3><p>{report.summary.reservations[0]}</p></section>
       <section><h3>Organization and research</h3><div className="sf-home-org-card"><h4>{report.organization}</h4><a className="sf-home-report" href={canonicalBase+editionReportPath(report)}>Full research report</a></div></section>
      </div>
     </div>
    </article>;
   })}</section>}
   <section className="gb-edition-current" aria-labelledby="current-research">
    <h2 id="current-research">Current research</h2>
    <p>Estimated dollars per better life: ten healthy-year equivalents from modeled health and income benefits in {label}. Estimates are uncertain; these are research reports, not verified donation offers.</p>
    {id==='usa'&&<p>For example, better housing policy in major U.S. cities could <a href="https://diegopuga.org/papers/Duranton_Puga_ECMA_2023.pdf">help millions of people find higher-paying jobs</a>. We include income alongside health using an <a href={canonicalBase+'/methodology/income'}>explicit welfare comparison</a>.</p>}
    <p><a href={canonicalBase+path+'/all'}>Read all {reports.length} {label} reports</a></p>
   </section>
   <details className="sf-home-selection">
    <summary>Research progress</summary>
    <p>{discovery}/100 candidates screened · {alpha}/25 initial reports · {beta}/10 in-depth reviews.</p>
    <p>We are developing best estimates from costs, outcomes and explicit assumptions. The final shortlist will also consider current operations, financial evidence and room for more funding.</p>
    <a href={canonicalBase+path+'/all'}>Detailed research and geographic scope</a>
   </details>
   <footer className="sf-home-footer"><a href={canonicalBase+path+'/all'}>All {label} research</a><span className="sf-footer-separator" aria-hidden="true">·</span><a href={canonicalBase+'/all'}>All cities and regions</a></footer>
  </main>
 </div>;
}
