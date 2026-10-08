import model from '@/data/san-francisco/sfaf-portfolio-model-v1.json';
import {calculate as historical} from '@/lib/sfaf-portfolio-model.mjs';
import {calculate,defaultInputs,diagnostics,modelVersion,assumptionBasis} from '@/lib/sfaf-calibrated-model.mjs';
import receipts from '@/docs/geography-discovery/sfaf-calibration-receipts-2026-10-01.json';
export function GET(){const evaluated=calculate();return Response.json({modelVersion,inputs:defaultInputs,assumptionBasis,currentSourceReceipts:receipts,verifiedMarginalFundingOffer:null,interpretation:'Conditional finite prevention health and signed household-resource equivalents; not locally measured outcomes or a verified funding offer.',evaluated,rankingCentral:evaluated,diagnostics:diagnostics(),historical:{interpretation:'Frozen clinical model and original scenarios, not the current combined ledger',model,evaluated:model.scenarios.map(s=>({id:s.id,...historical(s.inputs)}))}});}
