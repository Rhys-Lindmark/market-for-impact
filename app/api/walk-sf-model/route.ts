import data from '@/data/san-francisco/walk-sf-cea-v1.json';
import {walkSfModel} from '@/lib/walk-sf-model.mjs';
export function GET(){return Response.json({...data,evaluated:data.scenarios.map(s=>({id:s.id,...walkSfModel(s,data.giftUsd)}))});}
