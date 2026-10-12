import {withImpactDisplay} from '@/lib/impact-metric.mjs';
import data from '@/data/us/end-overdose-model-v1.json';
import {calculate} from '@/lib/end-overdose-model.mjs';
export function GET(){return Response.json(withImpactDisplay({model:data,evaluated:data.scenarios.map(s=>({id:s.id,...calculate(s.inputs)}))}));}
