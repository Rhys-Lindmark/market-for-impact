import {withImpactDisplay} from '@/lib/impact-metric.mjs';
import data from '@/data/california/cca-model-v1.json';
import {calculate} from '@/lib/cca-model.mjs';
export function GET(){return Response.json(withImpactDisplay({model:data,evaluated:data.scenarios.map(s=>({id:s.id,...calculate(s.inputs)}))}));}
