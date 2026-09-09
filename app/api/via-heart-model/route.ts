import model from '@/data/bay/via-heart-model-v1.json';
import {calculate} from '@/lib/via-heart-model.mjs';
export function GET(){return Response.json({model,evaluated:Object.entries(model.scenarios).map(([id,overrides])=>({id,...calculate({...model.central,...overrides})}))});}
