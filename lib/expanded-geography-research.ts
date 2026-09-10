import {californiaResearch} from './california-research-index';
import {usResearch} from './us-research-index';
import {internationalResearch} from './international-research-index';
export const expandedGeographyResearch=[
 ...californiaResearch.map(r=>({...r,geography:'California',overallPrice:r.overallUsdPerTenQalys})),
 ...usResearch.map(r=>({...r,geography:'U.S.',overallPrice:r.overallUsdPerTenQalys})),
 ...internationalResearch.map(r=>({...r,geography:'International',overallPrice:r.globalUsdPer10Qaly})),
].sort((a,b)=>(a.overallPrice??Infinity)-(b.overallPrice??Infinity)||a.organization.localeCompare(b.organization));
