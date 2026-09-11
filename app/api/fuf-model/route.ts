import {calculate,diagnostics,finances} from '@/lib/fuf-v2-model.mjs';
import report from '@/data/sf/fuf-v2-report.json';
export function GET(){const evaluated=calculate();return Response.json({modelVersion:'fuf-depth-v2-2025-sources',sources:report.sources,finances,verifiedMarginalFundingOffer:null,interpretation:'Central scenario for ranking; separate subjective weighted result. Partial tree-health model, unvalidated conversion.',evaluated,rankingCentral:evaluated.scenarios.find(s=>s.name==='central'),diagnostics:diagnostics()});}
