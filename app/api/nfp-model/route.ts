import {calculate} from '@/lib/nfp-model.mjs';
export function GET(){return Response.json({modelVersion:'nurse-family-partnership-v2-unit-aligned',verifiedMarginalFundingOffer:null,interpretation:'Whole-organization national-gift prior model; Bay and SF allocations are unmeasured subjective shares, not observed local impact.',evaluated:calculate()});}
