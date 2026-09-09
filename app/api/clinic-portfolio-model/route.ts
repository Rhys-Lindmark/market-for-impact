import model from '@/data/san-francisco/clinic-portfolio-model-v2.json';
import {calculate,inputsFor,expectedValue} from '@/lib/clinic-portfolio-model.mjs';
export function GET(){return Response.json({model,expected:expectedValue(model),evaluated:model.scenarios.map(s=>({id:s.id,...calculate(inputsFor(model,s))}))});}
