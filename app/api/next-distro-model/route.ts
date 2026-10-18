import {withImpactDisplay} from '@/lib/impact-metric.mjs';
import model from '@/data/us/next-distro-model-v1.json';
import {calculate} from '@/lib/next-distro-model.mjs';
export function GET(){return Response.json(withImpactDisplay({model,evaluated:Object.entries(model.scenarios).map(([id,overrides])=>({id,...calculate({...model.central,...overrides})}))}));}
