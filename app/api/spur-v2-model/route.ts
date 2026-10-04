import {version,calculateAll,scenarios,finance} from '@/lib/spur-v2-model.mjs';
import sources from '@/data/san-francisco/spur-v2-sources.json';
import {calculate as currentModel,diagnostics} from '@/lib/spur-calibrated-model.mjs';
import {version as currentVersion} from '@/lib/spur-calibrated-report.mjs';
export function GET(){return Response.json({modelVersion:currentVersion,current:{modelVersion:currentVersion,central:currentModel(),evaluated:diagnostics(),rankingStatistic:'unweighted conditional health and signed household resources'},historicalModelVersion:version,finance,scenarios,evaluated:calculateAll(),sources,rankingStatistic:'historical central partial-health scenario',verifiedMarginalFundingOffer:null,historicalEndpoint:'/api/sf-spur-portfolio'});}
