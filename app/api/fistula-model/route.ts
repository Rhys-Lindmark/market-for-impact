import {withImpactDisplay} from '@/lib/impact-metric.mjs';
import model from '@/data/international/fistula-model-v1.json';
import {calculate} from '@/lib/fistula-model.mjs';
export function GET(){return Response.json(withImpactDisplay({model,evaluated:model.scenarios.map(s=>({id:s.id,...calculate({...model.central_inputs,...s.overrides})}))}));}
