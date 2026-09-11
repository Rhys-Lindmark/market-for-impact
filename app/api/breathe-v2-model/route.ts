import {calculate,oldBaseline,VERSION,FINANCE,BASE,WORLDS} from '@/lib/breathe-v2-model.mjs';
import sources from '@/data/san-francisco/breathe-v2-sources.json';
export function GET(){return Response.json({modelVersion:VERSION,finance:FINANCE,inputs:BASE,worlds:WORLDS,sources,evaluated:calculate(),oldBaseline:oldBaseline(),rankingStatistic:'central clinical-subset scenario',historicalEndpoint:'/api/breathe-coverage-model',verifiedMarginalFundingOffer:null});}
