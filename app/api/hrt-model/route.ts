import model from '@/data/us/hrt-model-v1.json';
import {calculate,inputsFor} from '@/lib/hrt-model.mjs';
export function GET(){return Response.json({model,evaluated:model.scenarios.map(s=>({id:s.id,...calculate(inputsFor(model,s))}))});}
