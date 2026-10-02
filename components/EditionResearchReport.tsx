import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import progress from '@/docs/geography-progress.json';
import {canonicalBase,editionPath} from '@/lib/geography-editions.mjs';
import {editionReportSections,editionResearchEffort,formatEditionMoney,formatEditionReportPrice,formatAnnualExpense,formatEditionSensitivity,reportPrice,incomeAdjustedReportPrice,scenarioIncomeEquivalent,editionReportPath} from '@/lib/geography-reports.mjs';
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
 const effort=editionResearchEffort(reportRegistry,report),price=reportPrice(report),displayPrice=formatEditionReportPrice(report),incomeComparison=incomeAdjustedReportPrice(report);
 const central=report.model.scenarios.find(s=>s.id==='central');
 const centralIncome=central?scenarioIncomeEquivalent(central):null;
 const netBenefits=central&&Number.isFinite(central.editionQalys)&&centralIncome!==null?central.editionQalys+centralIncome:null;
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
    <p><strong>What do you get for your dollar? </strong>{netBenefits!==null&&netBenefits<=0?(netBenefits<0?'The current model estimates net harm':'The current model estimates no net benefit')+' after health and household-resource effects; no positive cost per better life applies.':price!==null?formatEditionMoney(price)+' per better life: ten '+(incomeComparison?'health-and-income-equivalent healthy years':'modeled health QALYs')+' in '+e.label+'.':displayPrice.startsWith('Illustrative ')?displayPrice+' per better life under a historical annual-average scenario; the return from a new donation is not established.':'A reliable cost per better life has not been established.'}{price!==null&&report.priceScope&&<> {report.priceScope}.</>}</p><Markdown text={report.model.nativeOutcomes}/>
   </section>
   {editionReportSections.map(([id,title]:string[])=><section id={id} key={id}><h2>{title}</h2><Markdown text={report.sections[id]}/>
   {id==='cost'&&<details className="report-method"><summary>Model, assumptions and sensitivity</summary><p>{report.model.costScope}</p><p>{report.model.geographicAttribution}</p><p className="report-equation">{report.model.formula}</p><dl className="report-assumptions">{report.model.inputs.map(i=><div key={i.name}><dt>{i.name}</dt><dd>{JSON.stringify(i.value)} {i.unit} ({i.basis}). {i.rationale} {i.sourceIds.map(id=><a key={id} href={'#source-'+id}>[{id}] </a>)}</dd></div>)}</dl>
     {report.model.scenarios.map(s=><p key={s.id}><strong>{s.label}: </strong>Cost: {s.costUSD===null?'unknown':formatEditionMoney(s.costUSD)}; {e.label} health QALYs: {s.editionQalys??'unknown'}; all-population health QALYs: {s.allPopulationQalys??'unknown'}.{scenarioIncomeEquivalent(s)!==null&&<> Income-equivalent healthy years: {scenarioIncomeEquivalent(s).toFixed(3)}.</>} {s.assumptions}</p>)}
     <p><strong>Counterfactual: </strong>{report.model.counterfactual}</p><p><strong>Attribution: </strong>{report.model.attribution}</p><p>{report.model.uncertainty}</p>
     {!!report.model.sensitivity.length&&<><h3>Sensitivity</h3><ul>{report.model.sensitivity.map((s,index)=><li key={index}>{formatEditionSensitivity(s)}</li>)}</ul></>}
     {!!report.model.missingInputs.length&&<><h3>Unresolved inputs</h3><ul>{report.model.missingInputs.map(s=><li key={s}>{s}</li>)}</ul></>}
    </details>}
    {id==='cost'&&incomeComparison&&<div className="report-income-comparison"><h3>Health and income breakdown</h3><p>The headline includes {incomeComparison.healthQalys.toFixed(3)} modeled health QALYs and {incomeComparison.incomeEquivalentYears.toFixed(3)} income-equivalent healthy years in {e.label}: {formatEditionMoney(incomeComparison.price)} per ten equivalent healthy years. Income equivalents are welfare comparisons, not observed QALYs or DALYs.</p><p>{report.model.incomeBridge?.rationale} {report.model.incomeBridge?.counterfactual} <a href={canonicalBase+'/methodology/income'}>Method and caveats</a>.</p></div>}
    {id==='cost'&&netBenefits!==null&&netBenefits<=0&&central&&centralIncome!==null&&<div className="report-income-comparison"><h3>Health and income breakdown</h3><p>For the modeled {formatEditionMoney(central.costUSD)}: {central.editionQalys.toFixed(5)} health QALYs + {centralIncome.toFixed(5)} household-resource-equivalent years = {netBenefits.toFixed(5)} combined years. A nonpositive total has no positive-benefit price. Income equivalents are welfare comparisons, not observed clinical QALYs or DALYs.</p><a href={canonicalBase+'/methodology/income'}>Method and caveats</a>.</div>}
   </section>)}
   <section id="annual-expenses"><h2>Annual expenses</h2><p>Organization-level spending, including programs, administration and fundraising. The research list averages three comparable, consecutive full fiscal years when available.</p>{report.annualExpenses.length?<ul>{report.annualExpenses.map(y=><li key={y.year}>FY {y.year}: {formatAnnualExpense(y)}; {y.entity}, {y.periodMonths===null?'period length unverified':y.periodMonths+'-month period'}, {y.accountingBasis}. <a href={'#source-'+y.sourceId}>Source</a></li>)}</ul>:<p>Comparable annual spending has not yet been verified.</p>}</section>
   <section id="sources"><h2>6. Sources</h2><ol className="report-sources">{report.sources.map(s=><li id={'source-'+s.id} key={s.id}><a href={s.url}>{s.title}</a>. {s.publisher}. Published: {s.published??'not stated'}; retrieved: {s.retrieved}.</li>)}</ol></section>
  </article>
  <footer className="report-footer"><a href={canonicalBase+editionPath(edition)+'/all'}>All {e.label} research</a><p>Cost-effectiveness model: <a href={canonicalBase+'/api/geography-reports/'+edition+'/'+slug}>{report.model.version}</a></p><p>Independent public-source research. Not affiliated with GiveWell or the organization reviewed.</p></footer>
 </div></main>;
}
