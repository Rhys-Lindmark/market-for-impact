import {withImpactDisplay} from '@/lib/impact-metric.mjs';
import data from '@/data/san-francisco/felton-model-v1.json';
import {calculate} from '@/lib/felton-model.mjs';
export function GET(){return Response.json(withImpactDisplay({model:data,evaluated:data.scenarios.map(s=>({id:s.id,...calculate({...data.central_inputs,...s.overrides})}))}));}
