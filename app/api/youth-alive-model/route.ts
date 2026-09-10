import {calculate} from '@/lib/youth-alive-model.mjs';
export function GET(){return Response.json({modelVersion:'youth-alive-v2',verifiedMarginalFundingOffer:null,interpretation:'Whole-gift partial-health model; finite external model and explicit analyst priors.',evaluated:calculate()});}
