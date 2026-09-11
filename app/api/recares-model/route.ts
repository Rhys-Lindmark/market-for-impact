import {calculate,inputs,scenarios,modelVersion} from '@/lib/recares-model.mjs';
import sources from '@/data/bay/recares-source-ledger.json';
export function GET(){return Response.json({modelVersion,inputs,scenarios,sources,verifiedMarginalFundingOffer:null,interpretation:'Exploratory whole-gift analyst priors, not measured ReCARES QALYs. Weighted Bay result includes signed null/harm scenarios. Complete societal resources unknown. Giving HOLD.',evaluated:calculate()});}
