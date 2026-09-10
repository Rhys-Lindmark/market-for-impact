import {calculate} from '@/lib/fuf-model.mjs';
export function GET(){return Response.json({modelVersion:'fuf-whole-org-v2',verifiedMarginalFundingOffer:null,interpretation:'Conditional whole-gift analyst-prior model; tree-health conversion is unvalidated.',evaluated:calculate()});}
