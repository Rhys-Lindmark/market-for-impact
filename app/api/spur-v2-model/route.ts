import {version,calculateAll,scenarios,finance} from '@/lib/spur-v2-model.mjs';
import sources from '@/data/san-francisco/spur-v2-sources.json';
export function GET(){return Response.json({modelVersion:version,finance,scenarios,evaluated:calculateAll(),sources,rankingStatistic:'central partial-health scenario',verifiedMarginalFundingOffer:null,historicalEndpoint:'/api/sf-spur-portfolio'});}
