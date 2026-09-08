import hac from '@/data/san-francisco/hac-developer-pathway-cea-v1.json';
import spur from '@/data/san-francisco/spur-clean-heat-cea-v1.json';
import {hacModel,resolveHacScenario,spurModel} from '@/lib/urban-policy-model.mjs';
export function GET(){return Response.json({
  hac:{...hac,evaluated:hac.scenarios.map(s=>({id:s.id,...hacModel(resolveHacScenario(hac,s))}))},
  spur:{...spur,evaluated:spur.scenarios.map(s=>({id:s.key,...spurModel(s)}))}
});}
