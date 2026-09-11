import {version,inputs,calculateAll} from '@/lib/hac-v2-model.mjs';
import sources from '@/data/san-francisco/hac-v2-sources.json';
export function GET(){return Response.json({modelVersion:version,inputs,evaluated:calculateAll(),sources,rankingStatistic:'central partial-health scenario',verifiedMarginalFundingOffer:null});}
