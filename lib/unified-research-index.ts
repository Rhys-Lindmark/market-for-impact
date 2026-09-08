import {sortedResearchPrograms} from './sf-research-index';
import {internationalResearch} from './international-research-index';
import {usResearch} from './us-research-index';
import {remedyLocalScenarios} from './local-impact-data';
import {bayResearch} from './bay-research-index';
// Every displayed comparison price has the same SF-resident denominator.
// Unknown local effects sort last; never substitute a global/national price.
export const unifiedResearch=[
 ...sortedResearchPrograms.map(r=>({organization:r.organization,program:r.program,href:r.href,scope:'SF',sfUsdPerTenQalys:r.centralUsdPerTenQalys as number|null,localStatus:'modeled'})),
 ...bayResearch.map(r=>({organization:r.organization+' (Bay Area)',program:r.program,href:r.href,scope:'Bay',sfUsdPerTenQalys:r.sfUsdPerTenQalys as number|null,localStatus:'Bay estimate in report; SF resident effect not established'})),
 ...usResearch.map(r=>({organization:r.organization+' (U.S.)',program:r.program,href:r.href,scope:'US',sfUsdPerTenQalys:r.href==='/charities/remedy-alliance'?remedyLocalScenarios[0].sfUsdPer10Q:r.sfUsdPerTenQalys as number|null,localStatus:'Very uncertain local-share judgment; see report'})),
 ...internationalResearch.map(r=>({organization:r.organization+' (International)',program:r.program,href:r.href,scope:'International',sfUsdPerTenQalys:null as number|null,localStatus:'No local estimate yet'})),
].sort((a,b)=>(a.sfUsdPerTenQalys??Infinity)-(b.sfUsdPerTenQalys??Infinity)||a.organization.localeCompare(b.organization));
