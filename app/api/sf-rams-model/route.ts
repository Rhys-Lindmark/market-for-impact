import {withImpactDisplay} from '@/lib/impact-metric.mjs';
import model from '@/data/san-francisco/rams-depression-cea-v1.json';import{signedCourseQalyModel}from'@/lib/signed-course-qaly-model.mjs';export function GET(){return Response.json(withImpactDisplay({...model,evaluatedScenarios:model.scenarios.map(s=>({...s,...signedCourseQalyModel(s)}))}));}
