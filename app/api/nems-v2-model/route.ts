import {calculate,modelVersion} from '@/lib/nems-v2-model.mjs';
import report from '@/data/san-francisco/nems-v2-report.json';
export function GET(){return Response.json({modelVersion,evaluated:calculate(),sources:report.sources,ordinaryGiftBayUsdPerTenQalys:null,verifiedMarginalFundingOffer:null});}
