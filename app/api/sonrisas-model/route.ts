import {calculate} from '@/lib/sonrisas-model.mjs';
export function GET(){return Response.json({modelVersion:'sonrisas-whole-org-v2',interpretation:'Conditional whole-gift dental model: finite DALY-derived health sensitivity, not measured marginal QALYs.',evaluated:calculate()});}
