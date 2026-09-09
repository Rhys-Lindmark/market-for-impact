import model from '@/data/california/calwalks-model-v1.json';
import {calculate} from '@/lib/calwalks-model.mjs';
export function GET(){return Response.json({model,evaluated:model.scenarios.map(s=>({id:s.id,...calculate(s.inputs)}))});}
