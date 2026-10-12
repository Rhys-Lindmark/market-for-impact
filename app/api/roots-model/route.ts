import {withImpactDisplay} from '@/lib/impact-metric.mjs';
import data from '@/data/bay/roots-model-v1.json';
import {calculate} from '@/lib/roots-model.mjs';
export function GET(){return Response.json(withImpactDisplay({model:data,evaluated:data.scenarios.map(s=>({id:s.id,...calculate(s.inputs)}))}));}
