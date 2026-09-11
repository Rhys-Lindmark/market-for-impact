import * as model from '@/lib/berkeley-need-model.mjs';
import report from '@/data/bay/berkeley-need-report.json';
export function GET(){const evaluated=model.calculate();return Response.json({modelVersion:model.modelVersion,sources:report.sources,evaluated,comparison:{basis:'central scenario',bayUsdPerTenQalys:evaluated.results.find(r=>r.id==='central')!.bayCostPer10},verifiedMarginalFundingOffer:null,interpretation:'Exploratory partial health estimate; central scenario and signed probability-weighted result are distinct. See report for assumptions and uncertainty.'});}
