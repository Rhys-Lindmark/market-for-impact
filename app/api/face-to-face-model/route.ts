import {withImpactDisplay} from '@/lib/impact-metric.mjs';
import {calculate,anchors,scenarios,modelVersion} from '@/lib/face-to-face-model.mjs';
import report from '@/data/bay/face-to-face-report.json';
import sensitivity from '@/data/bay/face-to-face-sensitivity.json';
export function GET(){return Response.json(withImpactDisplay({modelVersion,anchors,scenarios,sensitivity,sources:report.sources,evaluated:calculate(),verifiedMarginalFundingOffer:null,completeSocietalResourcesUsd:null,interpretation:'Whole expense; overdose-survival component only. Retrospective rescue reports do not identify prospective hazards or deaths prevented.'}));}
