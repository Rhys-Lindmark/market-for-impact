import {calculate as healthMobileModel} from './health-mobile-model.mjs';
import {californiaResearch} from './california-research-index';
import {calculate as earModel} from './ear-of-lion-model.mjs';
import {usResearch} from './us-research-index';
import {internationalResearch} from './international-research-index';
export const expandedGeographyResearch=[
 {organization:'Health Mobile',program:'Whole cost; finite symptomatic dental health',href:'/charities/health-mobile',geography:'California',overallPrice:healthMobileModel().allCostPer10},
 {organization:'Ear of the Lion',program:'Whole-gift cost; hearing health quantified',href:'/charities/ear-of-the-lion',geography:'California / Nevada',overallPrice:earModel().allCostPer10},
 ...californiaResearch.map(r=>({...r,geography:'California',overallPrice:r.overallUsdPerTenQalys})),
 ...usResearch.map(r=>({...r,geography:'U.S.',overallPrice:r.overallUsdPerTenQalys})),
 ...internationalResearch.map(r=>({...r,geography:'International',overallPrice:r.globalUsdPer10Qaly})),
].sort((a,b)=>(a.overallPrice??Infinity)-(b.overallPrice??Infinity)||a.organization.localeCompare(b.organization));
