import data from '@/data/us/new-eyes-model-v1.json';
import {calculate} from '@/lib/new-eyes-model.mjs';
export function GET(){return Response.json({model:data,evaluated:calculate(data),withoutFavorable:calculate(data,false)});}
