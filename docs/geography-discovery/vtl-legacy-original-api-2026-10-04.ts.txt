import {visionToLearn,visionToLearnModel} from '@/lib/vision-to-learn-model.mjs';
export function GET(){return Response.json({model:visionToLearn,evaluated:visionToLearn.scenarios.map(s=>({id:s.id,...visionToLearnModel(s.inputs)}))});}
