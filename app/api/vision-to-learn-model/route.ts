import {withImpactDisplay} from '@/lib/impact-metric.mjs';
import {version,defaults,calculate,calculateAll} from '@/lib/vtl-legacy-calibrated-model.mjs';
import historical from '@/data/us/vtl-legacy-pre-recalibration-model.json';
export function GET(){return Response.json(withImpactDisplay({version,defaults,current:calculate(),evaluated:calculateAll(),historical}));}
