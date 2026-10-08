import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import progress from '@/docs/geography-progress.json';
import boundaries from '@/docs/geography-boundaries.json';
import {canonicalBase,editionPath} from '@/lib/geography-editions.mjs';
import {reportsForEdition} from '@/lib/geography-reports.mjs';
import {reportRegistry} from '@/lib/published-geography-reports';
import {featuredReports} from '@/lib/edition-featured.mjs';
import {editionReportPath} from '@/lib/geography-reports.mjs';
import EditionResearchTable from './EditionResearchTable';
import EditionDonorHome from './EditionDonorHome';
import '@/app/givebetter.css';
import '@/app/edition.css';
import styles from '@/app/research/research-index.module.css';
export function editionMetadata(id:string,research=false):Metadata {
 const e=progress.editions.find(row=>row.id===id);
 if(!e)return {title:'Edition not found'};
 const title='GiveBetter x '+e.label+(research?' Research':'');
 const description='Researching cost-effective giving for '+e.label+'. Published reports and recommendations will appear as reviews are completed.';
 return {title,description,alternates:{canonical:canonicalBase+editionPath(id)+(research?'/all':'')},openGraph:{title,description,images:[]},twitter:{title,description,images:[]}};
}
export function EditionMasthead({label}:{label?:string}) {
 return <header className="givebetter-masthead"><a href={canonicalBase+'/all'}>Give<span>Better</span>{label&&<> <small>x {label}</small></>}</a></header>;
}
export default function GeographyEdition({id,research=false}:{id:string;research?:boolean}) {
 const edition=progress.editions.find(row=>row.id===id), path=editionPath(id);
 if(!edition||!path)notFound();
 const metro=boundaries.metros.find(row=>row.id===id);
 const reports=reportsForEdition(reportRegistry,id);
 const featured=featuredReports(reports,id);
 if(!research)return <EditionDonorHome id={id} label={edition.label} reports={reports} discovery={edition.discoveryAccepted} alpha={edition.alphaPublished} beta={edition.betaAcceptedPublished}/>;
 return <div className="givebetter"><EditionMasthead label={edition.label}/><main className={styles.shell}>
  <section className={styles.intro}><h1>GiveBetter x {edition.label} Research</h1>
  <p>Estimated dollars per better life in {edition.label} (10 healthy-year equivalents).</p>
  <p className={styles.caveat}>Sorted by modeled cost, not recommendation strength. These are uncertain research estimates, not verified donation offers. Cost boundaries differ; see each report before comparing.</p>
  <p className={styles.caveat}>Prices include modeled health and <a href={canonicalBase+'/methodology/income'}>income benefits</a> where quantified. Older reports without income models await recalibration; income equivalents are not observed QALYs.</p>
  <p><a href={canonicalBase+path}>Our giving shortlist</a> · <a href={canonicalBase+'/all'}>All cities and regions</a></p></section>
  {featured.length===4&&<section aria-label="Four featured opportunities"><h2>Four featured opportunities</h2><p>{featured.map((r,i)=><span key={r.slug}>{i>0&&' · '}<a href={canonicalBase+editionReportPath(r)}>{r.organization}</a></span>)}</p></section>}
  {reports.length?<EditionResearchTable reports={reports}/>:<p>Research reports are being prepared for this edition.</p>}
  <details className="gb-edition-boundary"><summary>Research progress</summary><p>{edition.discoveryAccepted}/100 candidates screened · {edition.alphaPublished}/25 initial reports · {edition.betaAcceptedPublished}/10 in-depth reviews.</p></details>
  <details className="gb-edition-boundary"><summary>Which places count?</summary>{metro?<><p>{metro.officialName}. We use the Census/OMB July 2023 metropolitan statistical area, including these counties:</p><ul>{metro.counties.map(c=><li key={c.fips}>{c.name}, {c.state}</li>)}</ul><p><a href={boundaries.source.index}>Official geographic definitions</a></p></>:<p>{id==='california'?'Benefits to people throughout the state of California.':'Benefits to residents of the 50 United States and District of Columbia. Overseas and territorial effects are outside this edition’s main estimate.'}</p>}</details>
  <footer className="sf-home-footer"><a href={canonicalBase+path+'/all'}>All {edition.label} research</a><span className="sf-footer-separator" aria-hidden="true">·</span><a href={canonicalBase+'/all'}>All cities and regions</a></footer>
 </main></div>;
}
