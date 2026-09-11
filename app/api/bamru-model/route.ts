import {calculate,inputs,scenarios,modelVersion} from '@/lib/bamru-model.mjs';
import sources from '@/data/bay/bamru-sources.json';
export function GET(){return Response.json({modelVersion,inputs,scenarios,sources,evaluated:calculate(),verifiedMarginalFundingOffer:null,completeSocietalResourcesUsd:null,interpretation:'Audited exploratory calculation; HOLD giving. Current whole cash expense is an analyst assumption, not verified accounts. Rescue activity is not measured deaths prevented; joint scenarios include null and harm. Prior weights are not calibrated probabilities.'});}
