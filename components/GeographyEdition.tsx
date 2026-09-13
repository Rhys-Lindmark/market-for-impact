import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import progress from '@/docs/geography-progress.json';
import boundaries from '@/docs/geography-boundaries.json';
import {canonicalBase,editionPath} from '@/lib/geography-editions.mjs';
import {reportsForEdition} from '@/lib/geography-reports.mjs';
import {reportRegistry} from '@/lib/published-geography-reports';
import EditionResearchTable from './EditionResearchTable';
import EditionDonorHome from './EditionDonorHome';
import '@/app/givebetter.css';
import '@/app/edition.css';
export function editionMetadata(id:string,research=false):Metadata {
 const e=progress.editions.find(row=>row.id===id);
 if(!e)return {title:'Edition not found'};
 const title='GiveBetter x '+e.label+(research?' Research':'');
 const description='Researching cost-effective giving for '+e.label+'. Published reports and recommendations will appear as reviews are completed.';
 return {title,description,alternates:{canonical:canonicalBase+editionPath(id)+(research?'/research':'')},openGraph:{title,description,images:[]},twitter:{title,description,images:[]}};
}
export function EditionMasthead({label}:{label?:string}) {
 return <header className="givebetter-masthead"><a href={canonicalBase+'/editions'}>Give<span>Better</span>{label&&<> <small>x {label}</small></>}</a></header>;
}
export default function GeographyEdition({id,research=false}:{id:string;research?:boolean}) {
 const edition=progress.editions.find(row=>row.id===id), path=editionPath(id);
 if(!edition||!path)notFound();
 const metro=boundaries.metros.find(row=>row.id===id);
 const reports=reportsForEdition(reportRegistry,id);
 if(id==='california'&&!research)return <EditionDonorHome id={id} label={edition.label} reports={reports} discovery={edition.discoveryAccepted} alpha={edition.alphaPublished} beta={edition.betaAcceptedPublished}/>;
 return <div className="givebetter"><EditionMasthead label={edition.label}/><main className="gb-edition">
  <nav aria-label="Edition navigation"><a href={canonicalBase+'/editions'}>All editions</a> · <a href={canonicalBase+path+(research?'':'/research')}>{research?'Edition overview':'Research progress'}</a></nav>
  <h1>{edition.label}{research?' Research':' Giving'}</h1>
  <p className="gb-edition-lead">Research in progress</p>
  <p>{reports.length?`We have published ${reports.length} initial organization reports for ${edition.label}. The top-four shortlist will follow deeper review.`:`We’re investigating organizations that could improve lives in ${edition.label}. No reports or top-four recommendations have been published for this edition yet.`}</p>
  <section aria-label="Research progress" className="gb-edition-progress">
   <div><strong>{edition.discoveryAccepted}/100</strong><span>Discovery candidates verified</span></div>
   <div><strong>{edition.alphaPublished}/25</strong><span>Initial reports published</span></div>
   <div><strong>{edition.betaAcceptedPublished}/10</strong><span>In-depth reviews published</span></div>
  </section>
  {edition.discoveryProvisional>0&&<p>{edition.discoveryProvisional} additional candidate leads are being checked. Leads are not research reports or recommendations.</p>}
  {!!reports.length&&<><h2>Organization research</h2><p>Estimated dollars per better life: ten additional quality-adjusted life years in {edition.label}. These are uncertain research estimates, not verified donation offers.</p><EditionResearchTable reports={reports}/></>}
  <h2>How we’ll compare organizations</h2><p>Estimated dollars per better life: ten additional quality-adjusted life years within this edition’s geography. We’ll consider the evidence, organization-wide costs, and what additional donations could achieve—not just the lowest modeled price.</p>
  <details className="gb-edition-boundary"><summary>Which places count?</summary>{metro?<><p>{metro.officialName}. We use the Census/OMB July 2023 metropolitan statistical area, including these counties:</p><ul>{metro.counties.map(c=><li key={c.fips}>{c.name}, {c.state}</li>)}</ul><p><a href={boundaries.source.index}>Official geographic definitions</a></p></>:<p>{id==='california'?'Benefits to people throughout the state of California.':'Benefits to residents of the 50 United States and District of Columbia. Overseas and territorial effects are outside this edition’s main estimate.'}</p>}</details>
  <footer><a href={canonicalBase}>Explore the existing SF/Bay Area shortlist</a><p>Independent research. Not affiliated with GiveWell or the organizations reviewed.</p></footer>
 </main></div>;
}
