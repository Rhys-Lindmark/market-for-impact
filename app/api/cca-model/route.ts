import data from '@/data/california/cca-model-v1.json';
import {calculate} from '@/lib/cca-model.mjs';
export function GET(){return Response.json({model:data,evaluated:data.scenarios.map(s=>({id:s.id,...calculate(s.inputs)}))});}
