import {calculate} from '@/lib/berkeley-free-clinic-model.mjs';
export function GET(){return Response.json({modelVersion:'berkeley-free-clinic-whole-org-v1',verifiedMarginalFundingOffer:null,interpretation:'Whole-organization explicit-prior model. Bay and SF residence shares are assumptions, not observed local allocation; volunteer resource proxy is incomplete.',evaluated:calculate()});}
