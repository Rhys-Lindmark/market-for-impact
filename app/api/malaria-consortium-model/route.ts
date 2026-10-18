import {withImpactDisplay} from '@/lib/impact-metric.mjs';
import {data,calculate} from '@/lib/malaria-consortium-model.mjs';
export function GET(){return Response.json(withImpactDisplay({model:data,evaluated:data.scenarios.map(s=>({id:s.id,...calculate(s.overrides)}))}));}
