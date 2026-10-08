import {calculate,diagnostics,modelVersion,assumptionBasis} from '@/lib/fuf-calibrated-model.mjs';
import {calculate as historical,diagnostics as historicalDiagnostics,finances} from '@/lib/fuf-v2-model.mjs';
import report from '@/data/sf/fuf-v2-report.json';
import receipts from '@/docs/geography-discovery/fuf-calibration-receipts-2026-10-01.json';
export function GET(){const evaluated=calculate();return Response.json({modelVersion,sources:report.sources,currentSourceReceipts:receipts,finances,verifiedMarginalFundingOffer:null,interpretation:'Conditional health plus temporary income-equivalent years; causal, transport and incidence judgments, not measured clinical QALYs or a marginal quote.',assumptionBasis,evaluated,rankingCentral:evaluated,diagnostics:diagnostics(),historical:{interpretation:'Frozen earlier unsupported tree-year priors; not current ranking',evaluated:historical(),diagnostics:historicalDiagnostics()}});}
