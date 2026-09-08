import {data,calculate} from '@/lib/helen-keller-model.mjs';
export function GET(){return Response.json({model:data,localBoundary:'Only quantified overseas core has zero direct local credit; whole-organization SF/Bay health remains unestimated.',evaluated:data.scenarios.map(s=>({id:s.id,...calculate(s.overrides)}))});}
