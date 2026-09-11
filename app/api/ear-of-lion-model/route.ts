import {calculate,anchors,scenarios,modelVersion} from '@/lib/ear-of-lion-model.mjs';
import report from '@/data/bay/ear-of-lion-report.json';
export function GET(){return Response.json({modelVersion,anchors,scenarios,sources:report.sources,evaluated:calculate(),verifiedMarginalFundingOffer:null,completeSocietalResourcesUsd:null});}
