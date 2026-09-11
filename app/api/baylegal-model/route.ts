import {INPUTS,SCENARIOS,calculate} from '@/lib/baylegal-model.mjs';
import report from '@/data/bay/baylegal-report.json';
export function GET(){return Response.json({modelVersion:report.modelVersion,inputs:INPUTS,scenarios:SCENARIOS,sources:report.sources,evaluated:calculate(),verifiedMarginalFundingOffer:null,completeSocietalResourcesUsd:null,interpretation:'Whole-organization expense, partial quantified health pathways. Bay share reflects reported service populations, not an audited residence census. Historical pro-rata donated-resource sensitivity is not verified marginal gross cost.'});}
