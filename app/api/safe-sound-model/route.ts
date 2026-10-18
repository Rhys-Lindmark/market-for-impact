import {withImpactDisplay} from '@/lib/impact-metric.mjs';
import {calculate} from '@/lib/safe-sound-model.mjs';
export function GET(){return Response.json(withImpactDisplay({modelVersion:'safe-sound-whole-org-v2',verifiedMarginalFundingOffer:null,interpretation:'Conditional whole-organization analyst-prior model, not measured marginal outcomes.',evaluated:calculate()}));}
