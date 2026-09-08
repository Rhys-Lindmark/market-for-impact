import data from '@/data/bay/rotacare-cea-v2.json';
import {rotacareModel} from '@/lib/rotacare-model.mjs';
export function GET(){return Response.json({...data,evaluated:data.scenarios.map(s=>({id:s.id,...rotacareModel(s.inputs)}))});}
