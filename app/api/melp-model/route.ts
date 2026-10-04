import {calculate,defaultInputs,diagnostics,modelVersion,assumptionBasis} from '@/lib/melp-calibrated-model.mjs';
import {calculate as historical,inputs as historicalInputs,scenarios as historicalScenarios} from '@/lib/melp-model.mjs';
import receipts from '@/docs/geography-discovery/melp-calibration-receipts-2026-10-01.json';
import sources from '@/data/bay/melp-source-ledger.json';
import {compare} from '@/lib/device-clinical-comparison.mjs';
export function GET(){const evaluated=calculate();return Response.json({modelVersion,inputs:defaultInputs,sources,currentSourceReceipts:receipts,assumptionBasis,verifiedMarginalFundingOffer:null,interpretation:'Conditional health plus one-off household-resource equivalent years; clinical and incidence judgments, not measured QALYs or a binding marginal offer.',evaluated,rankingCentral:evaluated,diagnostics:diagnostics(),historical:{interpretation:'Frozen prior-weighted model and clinical-family comparison, not current ranking',inputs:historicalInputs,scenarios:historicalScenarios,evaluated:historical(),clinicalComparison:compare()}});}
