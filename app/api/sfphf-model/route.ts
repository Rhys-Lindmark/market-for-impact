import data from '@/data/san-francisco/sfphf-model-v1.json';
import {calculate} from '@/lib/sfphf-model.mjs';
export function GET(){return Response.json({model:data,evaluated:data.scenarios.map(s=>({id:s.id,...calculate(s.inputs)}))});}
