import {withImpactDisplay} from '@/lib/impact-metric.mjs';
import {calculate} from '@/lib/sisterweb-model.mjs';
export function GET(){return Response.json(withImpactDisplay({modelVersion:'sisterweb-whole-project-v2',verifiedMarginalFundingOffer:null,interpretation:'Conditional whole-project estimate: expense proxy, signed health priors and unresolved entity transition.',evaluated:calculate()}));}
