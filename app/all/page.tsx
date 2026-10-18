import type {Metadata} from 'next';
import progress from '@/docs/geography-progress.json';
import {unifiedResearch} from '@/lib/unified-research-index';
import readiness from '@/data/donor-readiness.json';
import {EditionMasthead} from '@/components/GeographyEdition';
import {canonicalBase,editionPath} from '@/lib/geography-editions.mjs';
import {activeEditions,remainingResearchMinutes,recordedEditionResearch,incomeAssessmentBacklog,documentedUnknownIncomeAssessments} from '@/lib/geography-execution.mjs';
import reports from '@/data/geography-reports.json';
import researchEffort from '@/data/research-effort.json';
import {homepageResearchTime,homepageRegions} from '@/lib/homepage-research.mjs';
import '../givebetter.css';
import '../edition.css';
import './home.css';
export const metadata:Metadata={title:'GiveBetter — Cities and regions',description:'Explore GiveBetter research by city and region.',alternates:{canonical:canonicalBase+'/all'},openGraph:{title:'GiveBetter — Cities and regions',images:[]},twitter:{title:'GiveBetter — Cities and regions',images:[]}};
export default function EditionsPage(){
 const editions=activeEditions(progress);
 const remaining=editions.reduce((sum,e)=>sum+remainingResearchMinutes(e).total,0);
 const incomePending=editions.reduce((sum,e)=>sum+incomeAssessmentBacklog(reports,e.id).length,0);
 const incomeUnknown=editions.reduce((sum,e)=>sum+documentedUnknownIncomeAssessments(reports,e.id).length,0);
 const researchTime=homepageResearchTime(researchEffort,reports);
 return <div className="givebetter gb-home"><EditionMasthead/><main>
 <section className="gb-home-hero" aria-labelledby="giving-mission">
  <img src={canonicalBase+'/images/regions/hero.webp'} alt="" width="1800" height="693" fetchPriority="high"/>
  <h1 id="giving-mission">We research programs that improve lives <em>the most per dollar</em>, for a given region.</h1>
 </section>
 <section className="gb-home-research" aria-labelledby="research-hours">
  <div className="gb-home-research-art"><img src={canonicalBase+'/images/givebetter-principles.png'} alt="" width="420" height="140"/></div>
  <div><h2 id="research-hours">{researchTime.hours===null?'Research grounded in evidence':`Backed by ${Math.floor(researchTime.hours).toLocaleString('en-US')}+ hours of AI research`}</h2>
  <p>Logged research and source-review time, with shared sessions counted once. A partial total—not human-equivalent hours.</p>
  <a href="#research-time">How we count research time</a></div>
 </section>
 <section className="gb-home-regions" aria-labelledby="choose-region">
  <h2 id="choose-region">Choose a city or region</h2>
  <ul className="gb-home-region-grid">{homepageRegions.map(region=><li key={region.id}><a href={canonicalBase+'/'+region.id}>
   <img src={canonicalBase+(region.image?'/images/regions/'+region.image+'.webp':'/images/givebetter-city.webp')} alt="" width="400" height="400" loading="lazy"/>
   <span>{region.label}</span>
  </a></li>)}</ul>
  <p className="gb-home-early">Early research: {['Seattle','Boston','Atlanta','Detroit'].map((label,i)=><span key={label}>{i>0?' · ':''}<a href={canonicalBase+'/'+label.toLowerCase()}>{label}</a></span>)}</p>
 </section>
 <div className="gb-home-progress gb-edition">
 <nav aria-label="Explore the research"><a href={canonicalBase+'/compare/cities'}>Compare cities</a><a href={canonicalBase+'/research/city-theory'}>What we learned across all reports</a></nav>
 <details id="research-time"><summary>Research time and progress</summary>
 <p>{researchTime.hours===null?'Recorded research time is unavailable.':`${researchTime.hours.toFixed(1)} recorded hours across ${researchTime.sessionCount.toLocaleString('en-US')} research, modeling and source-audit sessions.`} Sessions repeated across ledgers and overlapping intervals by the same researcher are counted only once. Parallel researchers contribute their separate logged time. This excludes historical time estimates, missing intervals, planned budgets, tests and publishing. No AI-to-human productivity multiplier is applied.</p>
 <div className="gb-edition-table-wrap"><table className="gb-edition-table" aria-label="Research by city and region"><thead><tr><th scope="col">Edition</th><th scope="col">Research reports</th><th scope="col">In-depth reviews</th></tr></thead><tbody><tr><th scope="row"><a href={canonicalBase+'/san-francisco'}>San Francisco</a></th><td>{unifiedResearch.length}</td><td>{readiness.reviews.length}</td></tr>{editions.map(e=><tr key={e.id}><th scope="row"><a href={canonicalBase+editionPath(e.id)}>{e.label}</a></th><td>{e.alphaPublished}/25</td><td>{e.betaAcceptedPublished}/10</td></tr>)}</tbody></table></div>
 <p>Budget per edition: 60 minutes for discovery, 5 × 25 minutes for initial reports, and 15 × 10 minutes for deep reviews: 335 minutes, including substantive independent review. Existing discovery pools are reused. New-report research remaining: {Math.floor(remaining/60)}h {remaining%60}m, before tests/publishing overhead.</p>
 <p>Completion audit: {incomePending} older initial reports are flagged for health-and-income assessment audit or revision. Missing structured fields are a triage signal, not proof economic effects are absent; acceptance requires independent source and model review. Planned revision research: about {incomePending*5} minutes at five minutes per initial report, including substantive independent review. Tests and publishing are separate overhead. Only in-depth reviews use the fifteen-minute research budget. This is a work budget, not recorded time or an elapsed deadline; published counts do not certify this assessment.</p>
 <div className="gb-edition-table-wrap"><table className="gb-edition-table" aria-label="Health and income assessment flags"><thead><tr><th scope="col">Edition</th><th scope="col">Initial reports flagged</th></tr></thead><tbody>{editions.map(e=><tr key={e.id}><th scope="row">{e.label}</th><td>{incomeAssessmentBacklog(reports,e.id).length}</td></tr>)}</tbody></table></div>
 <p>{incomeUnknown} reviewed reports have explicitly unknown household financial effects. Their retained prices are clinical-only references, not zero income or complete combined valuations.</p>
 <div className="gb-edition-table-wrap"><table className="gb-edition-table" aria-label="Stage time and progress"><thead><tr><th>Edition</th><th>Discovery</th><th>Recorded initial / deep minutes</th><th>Report research remaining</th><th>Featured</th></tr></thead><tbody>{editions.map(e=>{const time=recordedEditionResearch(reports,e.id);const todo=remainingResearchMinutes(e);return <tr key={e.id}><th>{e.label}</th><td>{e.discoveryAccepted}/100</td><td>{Math.round(time.initialMinutes)} / {Math.round(time.deepMinutes)}</td><td>{todo.total} min</td><td>{e.topPicksPublished}/4</td></tr>;})}</tbody></table></div>
 <p>Recorded minutes are partial historical totals, not time budgets. Shared source intervals may serve multiple editions and are not new work twice. Missing discovery timing is not reconstructed. Future batches record discovery, initial and deep research separately from integration and publishing overhead.</p></details>
 <footer><a href={canonicalBase+'/san-francisco'}>GiveBetter x SF</a></footer></div></main></div>;
}
