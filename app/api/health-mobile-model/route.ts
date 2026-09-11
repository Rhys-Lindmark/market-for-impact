import {calculate,anchors,scenarios,modelVersion} from '@/lib/health-mobile-model.mjs';
import report from '@/data/bay/health-mobile-report.json';
import sensitivity from '@/data/bay/health-mobile-sensitivity.json';
export function GET(){return Response.json({modelVersion,anchors,scenarios,sensitivity,sources:report.sources,evaluated:calculate(),verifiedMarginalFundingOffer:null,completeSocietalResourcesUsd:null,interpretation:'Whole organizational cost; finite symptomatic dental health only. Targets are not observed treatment; Bay attribution is explicitly modeled.'});}
