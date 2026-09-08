import data from '@/data/san-francisco/hearing-access-cea-v2.json';
import {hearingAccessModel} from '@/lib/hearing-access-model.mjs';
export function GET(){return Response.json({...data,evaluated:data.scenarios.map(s=>({name:s.name,...hearingAccessModel(s)}))});}
