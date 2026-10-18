import {withImpactDisplay} from '@/lib/impact-metric.mjs';
import model from'@/data/san-francisco/thc-turnover-cea-v1.json';import{roomTurnoverModel}from'@/lib/room-turnover-model.mjs';export function GET(){return Response.json(withImpactDisplay({...model,evaluatedScenarios:model.scenarios.map(s=>({...s,...roomTurnoverModel(s)}))}));}
