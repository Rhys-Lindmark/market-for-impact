import data from '@/data/san-francisco/felton-model-v1.json';
import {calculate} from '@/lib/felton-model.mjs';
export function GET(){return Response.json({model:data,evaluated:data.scenarios.map(s=>({id:s.id,...calculate({...data.central_inputs,...s.overrides})}))});}
