import data from '@/data/international/amf-cea-v1.json';
import {amfModel} from '@/lib/amf-model.mjs';
export function GET(){return Response.json({...data,evaluated:data.scenarios.map(s=>({id:s.id,...amfModel(s)}))});}
