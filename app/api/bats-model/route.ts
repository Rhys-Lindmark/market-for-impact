import {calculate,anchors,worlds} from '@/lib/bats-model.mjs';
import report from '@/data/bay/bats-report.json';
export function GET(){return Response.json({modelVersion:report.modelVersion,anchors,scenarios:worlds,sources:report.sources,evaluated:calculate(),verifiedMarginalFundingOffer:null,completeSocietalResourcesUsd:null,interpretation:'Whole organizational expense; mortality pathway only. Capacity is not observed patient volume or purchasable slots.'});}
