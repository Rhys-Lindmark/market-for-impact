import {californiaResearch} from './california-research-index';
import {calculate as earModel} from './ear-of-lion-model.mjs';
import {usResearch} from './us-research-index';
import {internationalResearch} from './international-research-index';
export const expandedGeographyResearch=[
 {organization:'Ear of the Lion',program:'Whole-gift cost; hearing health quantified',href:'/charities/ear-of-the-lion',geography:'California / Nevada',overallPrice:earModel().allCostPer10},
 ...californiaResearch.map(r=>({...r,geography:'California',overallPrice:r.overallUsdPerTenQalys})),
 ...usResearch.map(r=>({...r,geography:'U.S.',overallPrice:r.overallUsdPerTenQalys})),
 ...internationalResearch.map(r=>({...r,geography:'International',overallPrice:r.globalUsdPer10Qaly})),
].sort((a,b)=>(a.overallPrice??Infinity)-(b.overallPrice??Infinity)||a.organization.localeCompare(b.organization));
