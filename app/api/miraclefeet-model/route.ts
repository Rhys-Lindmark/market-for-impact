import {calculate} from '@/lib/miraclefeet-model.mjs';
export function GET(){const evaluated=calculate();return Response.json({modelVersion:evaluated.inputs.modelVersion,verifiedMarginalFundingOffer:null,interpretation:'International whole-gift explicit-prior model; no direct Bay or San Francisco benefit credited.',evaluated});}
