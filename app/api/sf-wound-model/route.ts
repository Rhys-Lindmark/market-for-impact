import data from '@/data/san-francisco/sfccc-wound-cea-v1.json';
import {woundModel} from '@/lib/clinical-pathways-model.mjs';
export function GET(){return Response.json({...data,evaluatedScenarios:data.scenarios.map(s=>({...s,...woundModel(s)}))});}
