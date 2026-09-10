import {calculate} from '@/lib/ceres-community-model.mjs';
export function GET(){return Response.json({modelVersion:'ceres-whole-org-v2',interpretation:'Conditional whole-gift prior model; exploratory mortality, not a verified marginal funding offer.',evaluated:calculate()});}
