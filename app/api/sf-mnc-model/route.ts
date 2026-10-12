import {withImpactDisplay} from '@/lib/impact-metric.mjs';
import model from '@/data/san-francisco/mnc-dental-cea-v1.json';import{dentalPreventionModel}from'@/lib/dental-prevention-model.mjs';export function GET(){return Response.json(withImpactDisplay({...model,evaluatedScenarios:model.scenarios.map(s=>({...s,...dentalPreventionModel(s)}))}));}
