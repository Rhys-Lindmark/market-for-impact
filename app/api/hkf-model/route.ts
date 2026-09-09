import model from '@/data/bay/hkf-model-v1.json';
import {calculate,inputsFor} from '@/lib/hkf-model.mjs';
export function GET(){return Response.json({model,evaluated:model.scenarios.map(s=>({id:s.id,...calculate(inputsFor(model,s))}))});}
