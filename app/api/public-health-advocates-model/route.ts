import {calculate} from '@/lib/public-health-advocates-model.mjs';
export function GET(){return Response.json({modelVersion:'public-health-advocates-v1',verifiedMarginalFundingOffer:null,interpretation:'Historical policy-equivalent benchmark and explicit analyst priors, not measured marginal outcomes.',evaluated:calculate()});}
