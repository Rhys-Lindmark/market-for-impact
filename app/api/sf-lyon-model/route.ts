import {withImpactDisplay} from '@/lib/impact-metric.mjs';
import model from '@/data/san-francisco/lyon-earlier-care-cea-v1.json';
import {earlierCareModel} from '@/lib/earlier-care-model.mjs';
export function GET(){return Response.json(withImpactDisplay({...model,evaluatedScenarios:model.scenarios.map(s=>({...s,...earlierCareModel(s)}))}));}
