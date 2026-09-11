import {calculate,inputs,scenarios,modelVersion} from '@/lib/melp-model.mjs';
import sources from '@/data/bay/melp-source-ledger.json';
import {compare} from '@/lib/device-clinical-comparison.mjs';
export function GET(){return Response.json({modelVersion,inputs,scenarios,sources,verifiedMarginalFundingOffer:null,interpretation:'Exploratory whole-gift analyst priors, not measured MELP QALYs. Weighted Bay result includes signed null/harm scenarios. Complete societal resources unknown. Giving HOLD.',evaluated:calculate(),clinicalComparison:compare()});}
