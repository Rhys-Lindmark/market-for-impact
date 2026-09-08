import data from '@/data/san-francisco/breathe-cea-v1.json';
import {cessationModel,asthmaModel} from '@/lib/breathe-model.mjs';
export function GET(){return Response.json({...data,evaluatedScenarios:data.scenarios.map(s=>({...s,...cessationModel(s)})),evaluatedAsthmaScenarios:data.asthmaScenarios.map(s=>({...s,...asthmaModel(s)}))});}
