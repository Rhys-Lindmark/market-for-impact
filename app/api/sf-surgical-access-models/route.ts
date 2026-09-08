import pvf from '@/data/san-francisco/pvf-cataract-cea-v1.json';
import oa from '@/data/san-francisco/oa-colonoscopy-cea-v1.json';
import {cataractAccessModel,colonoscopyAccessModel} from '@/lib/surgical-access-model.mjs';
export function GET(){return Response.json({oa:{...oa,evaluated:oa.scenarios.map(s=>({name:s.name,...colonoscopyAccessModel(s,oa.resourceSensitivity)}))},pvf:{...pvf,
 evaluatedCore:pvf.coreScenarios.map(s=>({name:s.id,...cataractAccessModel(s.inputs)})),
 evaluatedSeparate:pvf.separateScenarios.map(s=>({name:s.id,...cataractAccessModel(s.inputs)}))}});}
