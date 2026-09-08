import data from '@/data/international/new-incentives-cea-v1.json';
import {newIncentivesModel} from '@/lib/new-incentives-model.mjs';
export function GET(){return Response.json({...data,evaluated:data.scenarios.map(s=>({id:s.id,...newIncentivesModel(s,data.giftUsd)}))});}
