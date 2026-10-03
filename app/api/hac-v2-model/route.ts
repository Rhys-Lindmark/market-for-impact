import {version,inputs,calculateAll} from '@/lib/hac-v2-model.mjs';
import sources from '@/data/san-francisco/hac-v2-sources.json';
import {calculate as currentModel,calculateAll as currentAll} from "@/lib/hac-calibrated-model.mjs";
import {version as currentVersion} from "@/lib/hac-calibrated-report.mjs";
export function GET(){return Response.json({modelVersion:version,currentModelVersion:currentVersion,legacyTopLevelFields:true,current:{modelVersion:currentVersion,central:currentModel(),evaluated:currentAll(),rankingStatistic:"conditional health and signed household resources"},historicalModelVersion:version,inputs,evaluated:calculateAll(),sources,rankingStatistic:'central partial-health scenario',verifiedMarginalFundingOffer:null});}
