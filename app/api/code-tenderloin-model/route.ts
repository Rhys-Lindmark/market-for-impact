import data from '@/data/san-francisco/code-tenderloin-model-v1.json';
import {calculate as historical} from '@/lib/code-tenderloin-model.mjs';
import {calculate,defaultInputs,diagnostics,modelVersion,assumptionBasis} from '@/lib/code-tenderloin-calibrated-model.mjs';
import receipts from '@/docs/geography-discovery/code-tenderloin-calibration-receipts-2026-10-01.json';
export function GET(){const evaluated=calculate();return Response.json({modelVersion,inputs:defaultInputs,assumptionBasis,currentSourceReceipts:receipts,verifiedMarginalFundingOffer:null,interpretation:'Conditional finite health and net worker-resource equivalent years; not measured QALYs, a priced funding offer or evidence of unrestricted scaling.',evaluated,rankingCentral:evaluated,diagnostics:diagnostics(),historical:{interpretation:'Frozen health-only model and scenarios, not current ranking',model:data,evaluated:data.scenarios.map(s=>({id:s.id,...historical({...data.central_inputs,...s.overrides})}))}});}
