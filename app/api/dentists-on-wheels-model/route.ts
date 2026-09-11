import {calculate,anchors,scenarios,modelVersion} from '@/lib/dentists-on-wheels-model.mjs';
import report from '@/data/bay/dentists-on-wheels-report.json';
import sensitivity from '@/data/bay/dentists-on-wheels-sensitivity.json';
export function GET(){return Response.json({modelVersion,anchors,scenarios,sensitivity,sources:report.sources,evaluated:calculate(),verifiedMarginalFundingOffer:null,completeSocietalResourcesUsd:null,interpretation:'Whole accounting expense; finite symptomatic dental health only. Procedures are not unique people or causal pain-relief episodes. No priced marginal offer.'});}
