import {version,defaults,cases,calculate} from '@/lib/ymca-current-calibrated-model.mjs';
import historical from '@/data/san-francisco/ymca-legacy-pre-recalibration-model.json';
import earlierDiabetesOnly from '@/data/san-francisco/ymca-dpp-historical-diagnostic-20261004.json';
export function GET(){return Response.json({version,defaults,current:calculate(),evaluated:Object.entries(cases).map(([id,inputs])=>({id,inputs,...calculate(inputs)})),historical,earlierDiabetesOnly});}
