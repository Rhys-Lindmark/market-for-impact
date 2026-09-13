import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import progress from '@/docs/geography-progress.json';
import {canonicalBase,editionPath} from '@/lib/geography-editions.mjs';
import {editionReportSections,editionResearchEffort,formatEditionMoney,formatAnnualExpense,reportPrice,editionReportPath} from '@/lib/geography-reports.mjs';
import {getEditionReport,reportRegistry} from '@/lib/published-geography-reports';
import {EditionMasthead} from './GeographyEdition';
import {Markdown} from './LongFormResearchReport';
import '@/app/report-reading.css';

export function editionReportMetadata(edition:string,slug:string):Metadata{
 const r=getEditionReport(edition,slug);if(!r)return {title:'Report not found'};
 const label=progress.editions.find(e=>e.id===edition)?.label;
 return {title:r.organization+' — GiveBetter x '+label,description:r.summary.what.join(' '),alternates:{canonical:canonicalBase+editionReportPath(r)},openGraph:{title:r.organization,description:r.program,images:[]},twitter:{title:r.organization,description:r.program,images:[]}};
}
export default function EditionResearchReport({edition,slug}:{edition:string;slug:string}){
 const report=getEditionReport(edition,slug),e=progress.editions.find(e=>e.id===edition);
 if(!report||!e)notFound();
 const effort=editionResearchEffort(reportRegistry,report),price=reportPrice(report);
 return <main className="givebetter charity-report"><EditionMasthead label={e.label}/><div className="report-reading-column">
  <header className="report-heading"><h1>{report.organization}</h1><p className="report-program">{report.program}</p>
   <details className="report-research-effort"><summary>{effort.label}</summary><ul>{effort.bullets.map((s:string)=><li key={s}>{s}</li>)}</ul></details>
   <p className="report-date">Updated: {report.updated}</p>
   {report.donationUrl&&<a className="report-donate" href={report.donationUrl} target="_blank" rel="noreferrer">Donate</a>}
  </header>
  <nav className="report-contents" aria-label="Table of Contents"><h2>Table of Contents</h2><a href="#summary">Summary</a>{editionReportSections.map(([id,title]:string[])=><a key={id} href={'#'+id}>{title}</a>)}<a href="#sources">6. Sources</a></nav>
  <article>
   <section id="summary"><h2>Summary</h2><Markdown text={'**What do they do?** '+report.summary.what.join(' ')}/>
    <p><strong>Why we’re interested in this organization:</strong></p><ul>{report.summary.strengths.map(s=><li key={s}><Markdown text={s}/></li>)}</ul>
    <p><strong>Our main reservations:</strong></p><ul>{report.summary.reservations.map(s=><li key={s}><Markdown text={s}/></li>)}</ul>
    <p><strong>What do you get for your dollar? </strong>{price===null?'A reliable cost per better life has not been established.':formatEditionMoney(price)+' per better life: ten additional quality-adjusted life years in '+e.label+'.'}{price!==null&&report.priceScope&&<> {report.priceScope}.</>}</p><Markdown text={report.model.nativeOutcomes}/>
   </section>
   {editionReportSections.map(([id,title]:string[])=><section id={id} key={id}><h2>{title}</h2><Markdown text={report.sections[id]}/>
    {id==='cost'&&<details className="report-method"><summary>Model, assumptions and sensitivity</summary><p>{report.model.costScope}</p><p>{report.model.geographicAttribution}</p><p className="report-equation">{report.model.formula}</p><dl className="report-assumptions">{report.model.inputs.map(i=><div key={i.name}><dt>{i.name}</dt><dd>{JSON.stringify(i.value)} {i.unit} ({i.basis}). {i.rationale} {i.sourceIds.map(id=><a key={id} href={'#source-'+id}>[{id}] </a>)}</dd></div>)}</dl>
     {report.model.scenarios.map(s=><p key={s.id}><strong>{s.label}: </strong>Cost: {s.costUSD===null?'unknown':formatEditionMoney(s.costUSD)}; {e.label} QALYs: {s.editionQalys??'unknown'}; all-population QALYs: {s.allPopulationQalys??'unknown'}. {s.assumptions}</p>)}
     <p><strong>Counterfactual: </strong>{report.model.counterfactual}</p><p><strong>Attribution: </strong>{report.model.attribution}</p><p>{report.model.uncertainty}</p>
     {!!report.model.sensitivity.length&&<><h3>Sensitivity</h3><ul>{report.model.sensitivity.map(s=><li key={s}>{s}</li>)}</ul></>}
     {!!report.model.missingInputs.length&&<><h3>Unresolved inputs</h3><ul>{report.model.missingInputs.map(s=><li key={s}>{s}</li>)}</ul></>}
    </details>}
    {id==='funding'&&!!report.annualExpenses.length&&<><h3>Annual spending</h3><ul>{report.annualExpenses.map(y=><li key={y.year}>{y.year}: {formatAnnualExpense(y)}; {y.entity}, {y.periodMonths===null?'period length unverified':y.periodMonths+'-month period'}, {y.accountingBasis}. <a href={'#source-'+y.sourceId}>Source</a></li>)}</ul></>}
   </section>)}
   <section id="sources"><h2>6. Sources</h2><ol className="report-sources">{report.sources.map(s=><li id={'source-'+s.id} key={s.id}><a href={s.url}>{s.title}</a>. {s.publisher}. Published: {s.published??'not stated'}; retrieved: {s.retrieved}.</li>)}</ol></section>
  </article>
  <footer className="report-footer"><a href={canonicalBase+editionPath(edition)+'/research'}>All {e.label} research</a><p>Cost-effectiveness model: <a href={canonicalBase+'/api/geography-reports/'+edition+'/'+slug}>{report.model.version}</a></p><p>Independent public-source research. Not affiliated with GiveWell or the organization reviewed.</p></footer>
 </div></main>;
}
