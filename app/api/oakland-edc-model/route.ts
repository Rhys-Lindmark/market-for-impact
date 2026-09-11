import {calculate,anchors,scenarios,modelVersion} from '@/lib/oakland-edc-model.mjs';
import report from '@/data/bay/oakland-edc-report.json';
import sensitivity from '@/data/bay/oakland-edc-sensitivity.json';
export function GET(){return Response.json({modelVersion,anchors,scenarios,sensitivity,sources:report.sources,evaluated:calculate(),verifiedMarginalFundingOffer:null,completeSocietalResourcesUsd:null,interpretation:'Whole legal-services expense; finite housing-related health only. Reported clients and retained tenancies are not causal health outcomes.'});}
