import {calculate,BASE,VERSION} from '@/lib/glide-v2-model.mjs';
import sources from '@/data/san-francisco/glide-v2-sources.json';
import {calculate as currentCalculate,VERSION as currentVersion} from "@/lib/glide-calibrated-model.mjs";
export function GET(){return Response.json({modelVersion:VERSION,currentModelVersion:currentVersion,legacyTopLevelFields:true,current:{modelVersion:currentVersion,evaluated:currentCalculate(),rankingStatistic:"conditional specified health and signed household resources"},inputs:BASE,evaluated:calculate(),sources,rankingStatistic:'central partial-health scenario',verifiedMarginalFundingOffer:null,historicalEndpoint:'/api/glide-coverage-model',historicalRentalReport:'/archive/glide-rental-assistance'});}
