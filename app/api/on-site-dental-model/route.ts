import {calculate,anchors,scenarios,modelVersion} from '@/lib/on-site-dental-model.mjs';
import report from '@/data/bay/on-site-dental-report.json';
import sensitivity from '@/data/bay/on-site-dental-sensitivity.json';
export function GET(){return Response.json({modelVersion,anchors,scenarios,sensitivity,sources:report.sources,evaluated:calculate(),verifiedMarginalFundingOffer:null,completeSocietalResourcesUsd:null,interpretation:'Whole expense; finite symptomatic dental relief only. Unduplicated patients are not completed treatment or causal outcomes.'});}
