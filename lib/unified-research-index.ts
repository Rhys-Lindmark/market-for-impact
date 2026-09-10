import {sortedResearchPrograms} from './sf-research-index';
import {bayResearch} from './bay-research-index';
// SF benefits are part of Bay Area benefits; unmodeled wider spillovers receive no invented credit.
// Bay-wide organizations use their Bay estimate, never their smaller SF allocation.
export const unifiedResearch=[
 ...sortedResearchPrograms.map(r=>({organization:r.organization,program:r.program,href:r.href,scope:'SF',localUsdPerTenQalys:r.centralUsdPerTenQalys as number|null,estimateGeography:'San Francisco',localStatus:'Modeled local health; unquantified wider Bay spillovers excluded'})),
 ...bayResearch.map(r=>({organization:r.organization,program:r.program,href:r.href,scope:r.scope??'Bay',localUsdPerTenQalys:r.bayUsdPerTenQalys as number|null,estimateGeography:'Bay Area',localStatus:'Modeled Bay Area impact; see report for assumptions'})),
].sort((a,b)=>(a.localUsdPerTenQalys??Infinity)-(b.localUsdPerTenQalys??Infinity)||a.organization.localeCompare(b.organization));
