import {calculate,diagnostics,modelVersion,currentEvidence} from '@/lib/hope-v2-model.mjs';
import sources from '@/data/san-francisco/hope-v2-sources.json';
export function GET(){return Response.json({modelVersion,currentEvidence,evaluated:calculate(),diagnostics:diagnostics(),sources,verifiedMarginalFundingOffer:null,historicalEndpoint:'/api/hope-pacifica-model'});}
