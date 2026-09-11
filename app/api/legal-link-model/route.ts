import {runModel,anchors,scenarios,MODEL_VERSION} from '@/lib/legal-link-model.mjs';
import report from '@/data/bay/legal-link-report.json';
export function GET(){return Response.json({modelVersion:MODEL_VERSION,anchors,scenarios,sources:report.sources,evaluated:runModel(),verifiedMarginalFundingOffer:null,completeSocietalResourcesUsd:null,interpretation:'Full historical expense with partial training-to-health scope. Declared static scenarios only; no empirical health effect. Planned publicly funded direct service is not an additional donation slot.'});}
