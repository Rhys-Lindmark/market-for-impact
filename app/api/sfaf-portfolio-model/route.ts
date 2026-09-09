import model from '@/data/san-francisco/sfaf-portfolio-model-v1.json';
import {calculate} from '@/lib/sfaf-portfolio-model.mjs';
export function GET(){return Response.json({model,evaluated:model.scenarios.map(s=>({id:s.id,...calculate(s.inputs)}))});}
