import model from '@/data/us/sirum-model-v1.json';
import {calculate} from '@/lib/sirum-model.mjs';
export function GET(){return Response.json({model,evaluated:model.scenarios.map(({id,overrides})=>({id,...calculate({...model.central,...overrides})}))});}

