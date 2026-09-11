import * as model from '@/lib/silicon-valley-bicycle-coalition-model.mjs';
import report from '@/data/bay/silicon-valley-bicycle-coalition-report.json';
export function GET(){const evaluated=model.calculate();const central=('rows' in evaluated?evaluated.rows:evaluated.results).find(r=>r.id==='central')!;return Response.json({modelVersion:model.modelVersion,sources:report.sources,evaluated,comparison:{basis:'central scenario',bayUsdPerTenQalys:central.bayCostPer10},verifiedMarginalFundingOffer:null});}
