import {calculate,modelVersion} from '@/lib/nems-v2-model.mjs';
import report from '@/data/san-francisco/nems-v2-report.json';
import {calculate as currentCalculate,diagnostics,modelVersion as currentVersion} from '@/lib/nems-current-model.mjs';
import {sources as currentSources} from '@/lib/nems-current-report.mjs';
export function GET(){return Response.json({modelVersion:currentVersion,evaluated:currentCalculate(),diagnostics:diagnostics(),sources:currentSources,historical:{modelVersion,evaluated:calculate(),sources:report.sources},ordinaryGiftBayUsdPerTenQalys:null,verifiedMarginalFundingOffer:null});}
