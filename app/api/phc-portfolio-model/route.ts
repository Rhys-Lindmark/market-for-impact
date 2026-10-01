import model from '@/data/san-francisco/phc-portfolio-model-v1.json';
import {calculate,inputsFor,diagnostics,modelVersion} from '@/lib/phc-calibrated-model.mjs';
export function GET(){return Response.json({model:{...model,model_id:modelVersion,as_of:'2026-10-01'},evaluated:model.scenarios.map(s=>({id:s.id,...calculate(inputsFor(model,s))})),diagnostics:diagnostics(),historicalModelId:model.model_id});}
