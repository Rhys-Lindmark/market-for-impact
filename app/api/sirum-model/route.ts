import {withImpactDisplay} from '@/lib/impact-metric.mjs';
import model from '@/data/us/sirum-model-v1.json';
import {calculate} from '@/lib/sirum-model.mjs';
export function GET(){return Response.json(withImpactDisplay({model,evaluated:model.scenarios.map(({id,overrides})=>({id,...calculate({...model.central,...overrides})}))}));}

