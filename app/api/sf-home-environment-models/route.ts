import brightline from '@/data/san-francisco/brightline-filtration-cea-v1.json';
import rtsf from '@/data/san-francisco/rtsf-falls-cea-v1.json';
import {filtrationModel,homeModificationModel} from '@/lib/home-environment-model.mjs';
export function GET(){return Response.json({
 brightline:{...brightline,evaluatedCore:Object.entries(brightline.coreScenarios).map(([name,s])=>({name,...filtrationModel(s)})),evaluatedStress:Object.entries(brightline.separateStressScenarios).map(([name,s])=>({name,...filtrationModel(s)}))},
 rtsf:{...rtsf,evaluatedCore:rtsf.scenarios.map(s=>({name:s.id,...homeModificationModel(s.inputs)})),evaluatedStress:rtsf.stressTests.map(s=>({name:s.id,...homeModificationModel(s.inputs)}))},
});}
