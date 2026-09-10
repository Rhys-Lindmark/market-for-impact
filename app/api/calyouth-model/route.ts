import {calculate} from '@/lib/calyouth-model.mjs';
export function GET(){return Response.json({modelVersion:'calyouth-v1',verifiedMarginalFundingOffer:null,interpretation:'Conditional finite morbidity model, no mortality credit; geography is an unmeasured prior.',evaluated:calculate()});}
