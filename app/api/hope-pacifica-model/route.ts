import * as model from '@/lib/hope-pacifica-model.mjs';
import report from '@/data/bay/hope-pacifica-report.json';
export function GET(){const evaluated=model.calculate();return Response.json({modelVersion:model.modelVersion,sources:report.sources,evaluated,comparison:{basis:'central scenario',bayUsdPerTenQalys:evaluated.centralScenario!.bayCostPer10},verifiedMarginalFundingOffer:null,interpretation:'Exploratory partial health estimate; central scenario and signed probability-weighted result are distinct. See report for assumptions and uncertainty.'});}
