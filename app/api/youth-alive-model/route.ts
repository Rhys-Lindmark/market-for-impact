import {withImpactDisplay} from '@/lib/impact-metric.mjs';
import {calculate} from '@/lib/youth-alive-model.mjs';
export function GET(){return Response.json(withImpactDisplay({modelVersion:'youth-alive-v2',verifiedMarginalFundingOffer:null,interpretation:'Whole-gift partial-health model; finite external model and explicit analyst priors.',evaluated:calculate()}));}
