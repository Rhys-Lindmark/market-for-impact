import type {Metadata} from 'next';
import progress from '@/docs/geography-progress.json';
import {unifiedResearch} from '@/lib/unified-research-index';
import readiness from '@/data/donor-readiness.json';
import {EditionMasthead} from '@/components/GeographyEdition';
import {canonicalBase,editionPath} from '@/lib/geography-editions.mjs';
import {activeEditions,remainingResearchMinutes,recordedEditionResearch,incomeAssessmentBacklog} from '@/lib/geography-execution.mjs';
import reports from '@/data/geography-reports.json';
import '../givebetter.css';
import '../edition.css';
export const metadata:Metadata={title:'GiveBetter — Cities and regions',description:'Explore GiveBetter research by city and region.',alternates:{canonical:canonicalBase+'/all'},openGraph:{title:'GiveBetter — Cities and regions',images:[]},twitter:{title:'GiveBetter — Cities and regions',images:[]}};
export default function EditionsPage(){
 const editions=activeEditions(progress);
 const remaining=editions.reduce((sum,e)=>sum+remainingResearchMinutes(e).total,0);
 const incomePending=editions.reduce((sum,e)=>sum+incomeAssessmentBacklog(reports,e.id).length,0);
 return <div className="givebetter"><EditionMasthead/><main className="gb-edition"><h1>Cities and regions</h1>
 <p>Explore San Francisco and seven active editions. Each edition compares 25 organizations, examines ten in greater depth, and highlights four promising giving opportunities.</p>
 <div className="gb-edition-table-wrap"><table className="gb-edition-table" aria-label="Research by city and region"><thead><tr><th scope="col">Edition</th><th scope="col">Research reports</th><th scope="col">In-depth reviews</th></tr></thead><tbody><tr><th scope="row"><a href={canonicalBase+'/san-francisco'}>San Francisco</a></th><td>{unifiedResearch.length}</td><td>{readiness.reviews.length}</td></tr>{editions.map(e=><tr key={e.id}><th scope="row"><a href={canonicalBase+editionPath(e.id)}>{e.label}</a></th><td>{e.alphaPublished}/25</td><td>{e.betaAcceptedPublished}/10</td></tr>)}</tbody></table></div>
 <details><summary>Research time and progress</summary>
 <p>Budget per edition: 60 minutes for discovery, 5 × 25 minutes for initial reports, and 15 × 10 minutes for deep reviews: 335 minutes. Existing discovery pools are reused. New-report research remaining: {Math.floor(remaining/60)}h {remaining%60}m, before review/publishing overhead.</p>
 <p>Completion audit: {incomePending} older initial reports are flagged for health-and-income assessment audit or revision. Missing structured fields are a triage signal, not proof economic effects are absent; acceptance requires independent source and model review. Planned revision research: about {incomePending*5} minutes at five minutes per report, plus independent review and publishing. This is a work budget, not recorded time or an elapsed deadline; published counts do not certify this assessment.</p>
 <div className="gb-edition-table-wrap"><table className="gb-edition-table" aria-label="Health and income assessment flags"><thead><tr><th scope="col">Edition</th><th scope="col">Initial reports flagged</th></tr></thead><tbody>{editions.map(e=><tr key={e.id}><th scope="row">{e.label}</th><td>{incomeAssessmentBacklog(reports,e.id).length}</td></tr>)}</tbody></table></div>
 <div className="gb-edition-table-wrap"><table className="gb-edition-table" aria-label="Stage time and progress"><thead><tr><th>Edition</th><th>Discovery</th><th>Recorded initial / deep minutes</th><th>Report research remaining</th><th>Featured</th></tr></thead><tbody>{editions.map(e=>{const time=recordedEditionResearch(reports,e.id);const todo=remainingResearchMinutes(e);return <tr key={e.id}><th>{e.label}</th><td>{e.discoveryAccepted}/100</td><td>{Math.round(time.initialMinutes)} / {Math.round(time.deepMinutes)}</td><td>{todo.total} min</td><td>{e.topPicksPublished}/4</td></tr>;})}</tbody></table></div>
 <p>Recorded minutes are partial historical totals, not time budgets. Shared source intervals may serve multiple editions and are not new work twice. Missing discovery timing is not reconstructed. Future batches record discovery, initial and deep research separately from integration and publishing overhead.</p></details>
 <footer><a href={canonicalBase+'/san-francisco'}>GiveBetter x SF</a></footer></main></div>;
}
