import data from '@/data/san-francisco/hpp-model-v1.json';
import {calculate} from '@/lib/hpp-model.mjs';
export function GET(){return Response.json({model:data,evaluated:data.scenarios.map(s=>({id:s.id,...calculate(s.inputs)}))});}
