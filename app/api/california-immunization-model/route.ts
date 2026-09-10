import {calculate} from '@/lib/california-immunization-model.mjs';
export function GET(){return Response.json({modelVersion:'california-immunization-coalition-v1',verifiedMarginalFundingOffer:null,interpretation:'Conditional statewide whole-gift model; MMR-specific health calibration and unmeasured local shares.',evaluated:calculate()});}
