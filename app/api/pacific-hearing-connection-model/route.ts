import {calculate,central,cases,historical,modelVersion} from '@/lib/pacific-hearing-calibrated-model.mjs';
import {finances} from '@/lib/pacific-hearing-v2-model.mjs';
import report from '@/data/bay/pacific-hearing-v2-report.json';
export async function GET(){
 const evaluated=calculate();
 return Response.json({modelVersion,anchors:central,finances,sources:report.sources,evaluated,rankingCentral:evaluated,scenarios:Object.entries(cases).map(([id,inputs])=>({id,inputs,result:calculate(inputs)})),historical:historical(),verifiedMarginalFundingOffer:null,completeSocietalResourcesUsd:null,interpretation:'Current unweighted Bay health and signed household-resource comparison; historical central and subjective weighted diagnostics are separate, not current funding offers.'});
}
