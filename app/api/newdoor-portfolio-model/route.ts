import data from '@/data/san-francisco/newdoor-portfolio-v1.json';
import {calculate} from '@/lib/newdoor-portfolio-model.mjs';
export function GET(){return Response.json({model:data,evaluated:data.scenarios.map(s=>({id:s.id,...calculate(s,data.giftUsd)}))});}
