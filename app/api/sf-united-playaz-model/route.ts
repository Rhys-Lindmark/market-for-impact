import {withImpactDisplay} from '@/lib/impact-metric.mjs';
import model from'@/data/san-francisco/united-playaz-cea-v1.json';import{youthMortalityModel}from'@/lib/youth-mortality-model.mjs';export function GET(){return Response.json(withImpactDisplay({...model,evaluatedScenarios:model.scenarios.map(s=>({...s,...youthMortalityModel(s)}))}));}
