import model from '@/data/san-francisco/oa-portfolio-model-v2.json';
import {calculate} from '@/lib/oa-portfolio-model.mjs';
import {central,diagnostics} from '@/lib/operation-access-calibrated-model.mjs';
export function GET(){return Response.json({current:{inputs:central,evaluated:diagnostics()},historicalNotice:'The original model and evaluated fields are retained as history, not current ranking values.',model,evaluated:model.scenarios.map(s=>({id:s.id,...calculate(model,s)}))});}
