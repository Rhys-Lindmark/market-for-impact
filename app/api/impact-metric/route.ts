import {impactMetric,impactUnitExplanation} from '@/lib/impact-metric.mjs';
export async function GET(){return Response.json({display:impactMetric(),explanation:impactUnitExplanation,canonicalModelUnit:'USD per ten modeled healthy-year welfare equivalents',configuration:'lib/impact-metric.mjs: impactMetricConfig.id; backend-only, rebuild and publish after changing'});}
