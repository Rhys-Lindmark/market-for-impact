import {calculate,inputs,scenarios,modelVersion} from '@/lib/greenlight-model.mjs';
import sources from '@/data/bay/greenlight-sources.json';
export function GET(){return Response.json({modelVersion,inputs,scenarios,sources,evaluated:calculate(),verifiedMarginalFundingOffer:null,completeSocietalResourcesUsd:null,interpretation:'Whole historical cash expense; partial finite psychotherapy health scope. Subjective scenarios, not measured clinic effects or a marginal donation offer.'});}
