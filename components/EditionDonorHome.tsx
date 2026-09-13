/* eslint-disable @next/next/no-img-element -- Reuse the existing editorial illustrations. */
import type {EditionReport} from '@/lib/published-geography-reports';
import {canonicalBase,editionPath} from '@/lib/geography-editions.mjs';
import EditionResearchTable from './EditionResearchTable';
import '@/app/sf-home.css';

export default function EditionDonorHome({id,label,reports,discovery,alpha,beta}:{id:string;label:string;reports:EditionReport[];discovery:number;alpha:number;beta:number}){
 const path=editionPath(id);
 const principles=[
  ['Look for meaningful impact',`Compare how a donation could improve health in ${label}.`,'Map illustration'],
  ['Follow the evidence','Understand the outcomes, costs and assumptions behind each estimate.','Illustration of research books'],
  ['Choose with care','Read the report and confirm what additional donations could achieve.','Illustration of choosing a charity'],
 ];
 return <div className="sf-home givebetter">
  <header className="givebetter-masthead"><a href={canonicalBase+'/editions'}>Give<span>Better</span> <small>x {label}</small></a></header>
  <main>
   <section className="sf-home-intro">
    <h1>Giving in {label}</h1>
    <p className="sf-home-lead">Find promising ways to improve lives, guided by evidence and estimated impact.</p>
    <small>Our four-charity shortlist is being researched. Explore the reports below.</small>
   </section>
   <section className="sf-home-principles" aria-label="How to give better">
    {principles.map(([title,copy,alt],i)=><div key={title}><div className="sf-home-illustration"><img src={canonicalBase+'/images/givebetter-principles.png'} alt={alt} width="600" height="200" style={{transform:`translateX(-${i*100/3}%)`}}/></div><h2>{title}</h2><p>{copy}</p></div>)}
   </section>
   <section className="gb-edition-current" aria-labelledby="current-research">
    <h2 id="current-research">Current research</h2>
    <p>Estimated dollars per better life: ten additional quality-adjusted life years in {label}. Estimates are uncertain; these are research reports, not verified donation offers.</p>
    <EditionResearchTable reports={reports}/>
   </section>
   <details className="sf-home-selection">
    <summary>Research progress</summary>
    <p>{discovery}/100 candidates screened · {alpha}/25 initial reports · {beta}/10 in-depth reviews.</p>
    <p>We are developing best estimates from costs, outcomes and explicit assumptions. The final shortlist will also consider current operations, financial evidence and room for more funding.</p>
    <a href={canonicalBase+path+'/research'}>Detailed research and geographic scope</a>
   </details>
   <footer className="sf-home-footer"><a href={canonicalBase+path+'/research'}>All {label} research</a> · <a href={canonicalBase+'/editions'}>All cities and regions</a><p>Independent research. Not affiliated with GiveWell or the organizations reviewed.</p></footer>
  </main>
 </div>;
}
