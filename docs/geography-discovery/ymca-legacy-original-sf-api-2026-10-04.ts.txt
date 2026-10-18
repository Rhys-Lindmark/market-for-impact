import data from '@/data/san-francisco/ymca-dpp-cea-v1.json';
import {diabetesPreventionModel} from '@/lib/large-bay-impact-model.mjs';
export function GET(){return Response.json({...data,evaluatedScenarios:data.scenarios.map(s=>({...s,...diabetesPreventionModel(s)}))});}
