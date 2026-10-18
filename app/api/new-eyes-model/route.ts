import {withImpactDisplay} from '@/lib/impact-metric.mjs';
import data from '@/data/us/new-eyes-model-v1.json';
import {calculate} from '@/lib/new-eyes-model.mjs';
export function GET(){return Response.json(withImpactDisplay({model:data,evaluated:calculate(data),withoutFavorable:calculate(data,false)}));}
