import {data,calculate} from '@/lib/malaria-consortium-model.mjs';
export function GET(){return Response.json({model:data,evaluated:data.scenarios.map(s=>({id:s.id,...calculate(s.overrides)}))});}
