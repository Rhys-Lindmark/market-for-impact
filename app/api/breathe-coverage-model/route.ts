import {withImpactDisplay} from '@/lib/impact-metric.mjs';
import model from '@/data/san-francisco/breathe-coverage-v2.json';
import {calculate} from '@/lib/breathe-coverage-model.mjs';
export function GET(){return Response.json(withImpactDisplay({...model,evaluated:model.scenarios.map(s=>({id:s.id,...calculate(model,s)})),verifiedMarginalFundingOffer:null}));}
