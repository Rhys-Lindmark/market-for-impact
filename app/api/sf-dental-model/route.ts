import data from '@/data/san-francisco/clinic-dental-cea-v1.json';
import {dentalAccessModel} from '@/lib/dental-access-model.mjs';
export function GET(){return Response.json({...data,evaluatedScenarios:data.scenarios.map(s=>({...s,...dentalAccessModel(s)}))});}
