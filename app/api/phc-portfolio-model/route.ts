import model from '@/data/san-francisco/phc-portfolio-model-v1.json';
import {calculate,inputsFor} from '@/lib/phc-portfolio-model.mjs';
export function GET(){return Response.json({model,evaluated:model.scenarios.map(s=>({id:s.id,...calculate(inputsFor(model,s))}))});}
