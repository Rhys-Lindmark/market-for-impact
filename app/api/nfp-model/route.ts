import {calculate,version} from '@/lib/changent-legacy-recalibration.mjs';
import historical from '@/data/us/changent-legacy-pre-recalibration-model.json';
export function GET(){return Response.json({modelVersion:version,verifiedMarginalFundingOffer:null,interpretation:'Conditional national-support finite health plus signed household-resource illustration; weighted and central distinct, not measured donation EV. Total Bay/SF allocation unknown.',evaluated:calculate(),historical,followupBoundDiagnostic:historical.portfolioFollowup,lifetimeDiagnostic:historical.portfolioPublishedLifetime});}
