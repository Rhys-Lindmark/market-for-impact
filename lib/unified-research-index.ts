import {sortedResearchPrograms} from './sf-research-index';
import {bayResearch} from './bay-research-index';
import {localRescueResearch} from './local-rescue-research';
import {selectedSevenResearch} from './selected-seven-research';
import {localResearchEstimate} from './local-research-estimate.mjs';
// SF benefits are part of Bay Area benefits; unmodeled wider spillovers receive no invented credit.
// Bay-wide organizations use their Bay estimate, never their smaller SF allocation.
export const unifiedResearch=[
 ...sortedResearchPrograms.map(r=>({organization:r.organization,program:r.program,href:r.href,scope:'SF',...localResearchEstimate(r)})),
 ...[...bayResearch,...selectedSevenResearch,...localRescueResearch.map(r=>({...r,scope:'Bay'}))].map(r=>({organization:r.organization,program:r.program,href:r.href,scope:r.scope??'Bay',localUsdPerTenQalys:r.bayUsdPerTenQalys as number|null,estimateGeography:'Bay Area',localStatus:r.href==='/charities/bayview-hunters-point-foundation'?'Subjective modeled Bay-resident allocation:90%; measured residence unavailable':'Modeled Bay Area impact; see report for assumptions'})),
].sort((a,b)=>(a.localUsdPerTenQalys??Infinity)-(b.localUsdPerTenQalys??Infinity)||a.organization.localeCompare(b.organization));
