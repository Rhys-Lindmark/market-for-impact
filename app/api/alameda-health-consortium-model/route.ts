import {withImpactDisplay} from '@/lib/impact-metric.mjs';
import * as model from '@/lib/alameda-health-consortium-model.mjs';
import report from '@/data/bay/alameda-health-consortium-report.json';
export function GET(){const evaluated=model.calculate();const central=('rows' in evaluated?evaluated.rows:evaluated.results).find(r=>r.id==='central')!;return Response.json(withImpactDisplay({modelVersion:model.modelVersion,sources:report.sources,evaluated,comparison:{basis:'central scenario',bayUsdPerTenQalys:central.bayCostPer10},verifiedMarginalFundingOffer:null}));}
