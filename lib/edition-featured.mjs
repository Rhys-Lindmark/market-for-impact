import selection from '../data/edition-featured.json' with {type:'json'};
import {reportsForEdition,researchListPrice} from './geography-reports.mjs';
// The featured four use the full research list's ordering and price definition.
// The accepted editorial ledger remains historical evidence, not a second rank.
export function featuredReports(reports,edition){
 const entry=selection.editions[edition];
 if(entry?.status!=='accepted')return [];
 const picks=reportsForEdition({reports},edition).filter(r=>r.acceptance.status==='accepted'&&researchListPrice(r)>0).slice(0,4);
 return picks.length===4?picks:[];
}
