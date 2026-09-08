import data from '@/data/us/end-overdose-model-v1.json';
import {calculate} from '@/lib/end-overdose-model.mjs';
export function GET(){return Response.json({model:data,evaluated:data.scenarios.map(s=>({id:s.id,...calculate(s.inputs)}))});}
