import {withImpactDisplay} from '@/lib/impact-metric.mjs';
import data from '@/data/san-francisco/st-anthony-diabetes-cea-v1.json';
import {diabetesAccessModel} from '@/lib/diabetes-access-model.mjs';
export function GET(){return Response.json(withImpactDisplay({...data,evaluatedScenarios:data.scenarios.map(s=>({...s,...diabetesAccessModel(s)})),evaluatedRedesign:{...data.redesign,...diabetesAccessModel(data.redesign)}}));}
