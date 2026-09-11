import {calculate,BASE,VERSION} from '@/lib/glide-v2-model.mjs';
import sources from '@/data/san-francisco/glide-v2-sources.json';
export function GET(){return Response.json({modelVersion:VERSION,inputs:BASE,evaluated:calculate(),sources,rankingStatistic:'central partial-health scenario',verifiedMarginalFundingOffer:null,historicalEndpoint:'/api/glide-coverage-model',historicalRentalReport:'/archive/glide-rental-assistance'});}
