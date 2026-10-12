import {withImpactDisplay} from '@/lib/impact-metric.mjs';
import model from '@/data/bay/hkf-model-v1.json';
import {calculate,inputsFor} from '@/lib/hkf-model.mjs';
export function GET(){return Response.json(withImpactDisplay({model,evaluated:model.scenarios.map(s=>({id:s.id,...calculate(inputsFor(model,s))}))}));}
