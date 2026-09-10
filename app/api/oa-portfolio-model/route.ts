import model from '@/data/san-francisco/oa-portfolio-model-v2.json';
import {calculate} from '@/lib/oa-portfolio-model.mjs';
export function GET(){return Response.json({model,evaluated:model.scenarios.map(s=>({id:s.id,...calculate(model,s)}))});}
