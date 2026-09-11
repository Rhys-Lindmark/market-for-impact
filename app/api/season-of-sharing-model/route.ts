import {calculate,inputs,scenarios,modelVersion} from '@/lib/season-of-sharing-model.mjs';
import sources from '@/data/bay/season-of-sharing-sources.json';
export function GET(){return Response.json({modelVersion,inputs,scenarios,sources,evaluated:calculate(),verifiedMarginalFundingOffer:null,completeSocietalResourcesUsd:null,interpretation:'Housing-health component only with whole-gift cash cost; food-health benefits unquantified, not zero. Not a complete organizational health estimate.'});}
