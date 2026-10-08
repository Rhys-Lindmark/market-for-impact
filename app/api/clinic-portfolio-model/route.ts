import model from '@/data/san-francisco/clinic-portfolio-model-v2.json';
import {calculate,inputsFor,expectedValue} from '@/lib/clinic-portfolio-model.mjs';
import {calculate as current,cases,groups,central} from '@/lib/clinic-calibrated-model.mjs';
export function GET(){return Response.json({central,groups,evaluated:current(),rankingCentral:current(),scenarios:Object.entries(cases).map(([id,inputs])=>({id,inputs,result:current(inputs)})),historical:{model,expected:expectedValue(model),evaluated:model.scenarios.map(s=>({id:s.id,...calculate(inputsFor(model,s))}))},fundingRoom:null,comprehensiveResourceCost:null});}
