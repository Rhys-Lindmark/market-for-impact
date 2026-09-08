import data from '@/data/san-francisco/cfsf-respite-cea-v1.json';
import {respiteModel} from '@/lib/clinical-pathways-model.mjs';
export function GET(){return Response.json({...data,evaluatedScenarios:data.scenarios.map(s=>({...s,...respiteModel(s)}))});}
