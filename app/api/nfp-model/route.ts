import {calculate} from '@/lib/nfp-model.mjs';
export function GET(){const evaluated=calculate();return Response.json({modelVersion:evaluated.inputs.modelVersion,verifiedMarginalFundingOffer:null,interpretation:'Whole-organization national-gift prior model; Bay and SF allocations are unmeasured subjective shares, not observed local impact.',evaluated});}
