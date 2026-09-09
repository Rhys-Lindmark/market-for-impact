import data from '@/data/san-francisco/code-tenderloin-model-v1.json';
import {calculate} from '@/lib/code-tenderloin-model.mjs';
export function GET(){return Response.json({model:data,evaluated:data.scenarios.map(s=>({id:s.id,...calculate({...data.central_inputs,...s.overrides})}))});}
