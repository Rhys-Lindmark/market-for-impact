import {withImpactDisplay} from '@/lib/impact-metric.mjs';
import {calculate} from '@/lib/public-health-advocates-model.mjs';
export function GET(){return Response.json(withImpactDisplay({modelVersion:'public-health-advocates-v1',verifiedMarginalFundingOffer:null,interpretation:'Historical policy-equivalent benchmark and explicit analyst priors, not measured marginal outcomes.',evaluated:calculate()}));}
