import data from '@/data/us/remedy-alliance-cea-v1.json';
import {remedyAllianceModel} from '@/lib/remedy-alliance-model.mjs';
export function GET(){return Response.json({...data,evaluated:data.scenarios.map(s=>({id:s.id,...remedyAllianceModel(s,data.giftUsd)}))});}
