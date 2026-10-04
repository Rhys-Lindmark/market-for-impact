import selection from '../data/edition-featured.json' with {type:'json'};
import {reportPrice} from './geography-reports.mjs';
// One accepted selection serves landing and full-research pages. Do not infer
// recommendations from historical diagnostics or a report-count threshold.
export function featuredReports(reports,edition){
 const entry=selection.editions[edition];
 if(entry?.status!=='accepted'||entry.slugs.length!==4)return [];
 const picks=entry.slugs.map(slug=>reports.find(r=>r.edition===edition&&r.slug===slug));
 if(picks.some(r=>!r||r.stage!=='beta'||r.acceptance.status!=='accepted'||reportPrice(r)===null))throw Error('Featured selection requires four accepted positive current in-depth references: '+edition);
 return picks;
}
