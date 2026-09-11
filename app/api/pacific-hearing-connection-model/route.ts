import {calculate,anchors,scenarios,modelVersion} from '@/lib/pacific-hearing-connection-model.mjs';
import report from '@/data/bay/pacific-hearing-connection-report.json';
export function GET(){return Response.json({modelVersion,anchors,scenarios,sources:report.sources,evaluated:calculate(),verifiedMarginalFundingOffer:null,completeSocietalResourcesUsd:null,interpretation:'Whole accounting expense; partial hearing health. Unknown treatment volume is explicitly modeled, not measured. No priced marginal offer.'});}
