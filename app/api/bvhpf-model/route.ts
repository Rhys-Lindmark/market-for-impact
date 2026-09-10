import {calculate} from '@/lib/bvhpf-model.mjs';
export function GET(){return Response.json({modelVersion:'bvhpf-whole-org-v1',verifiedMarginalFundingOffer:null,interpretation:'Whole-gift partial-health model with site-of-service geography; not measured resident or marginal outcomes.',evaluated:calculate()});}
