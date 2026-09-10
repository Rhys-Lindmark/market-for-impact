import {calculate} from '@/lib/heppac-model.mjs';
export function GET(){return Response.json({modelVersion:'heppac-whole-org-v5',verifiedMarginalFundingOffer:null,interpretation:'Conditional ordinary-gift prior model; gross resources and local shares are illustrative, not measured.',evaluated:calculate()});}
