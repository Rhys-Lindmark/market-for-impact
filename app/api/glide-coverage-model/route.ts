import {withImpactDisplay} from '@/lib/impact-metric.mjs';
import model from '@/data/san-francisco/glide-coverage-v2.json';
import {calculate} from '@/lib/glide-coverage-model.mjs';
import {scenarios} from '@/lib/glide-coverage-scenarios.mjs';
export function GET(){return Response.json(withImpactDisplay({model,evaluated:scenarios(model).map(s=>({id:s.id,outputs:calculate(s.inputs)})),verifiedMarginalFundingOffer:null}));}
