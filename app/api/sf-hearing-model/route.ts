import data from '@/data/san-francisco/hearing-access-cea-v2.json';
import {hearingCalibratedModel,hearingDiagnostics,modelVersion} from '@/lib/hearing-calibrated-model.mjs';
export function GET(){return Response.json({...data,model_id:modelVersion,as_of:'2026-10-01',historicalModelId:data.model_id,
 current_charitable_eligibility:'IRS September 8 revocation data still list historical EIN94-1322198, effective2025-11-15, posted2026-03-10, blank reinstatement. September10 Publication78 and checked CA BMF have no exact match. Later reinstatement/successor and current appointments remain unverified; not evidence of closure.',
 evaluated:data.scenarios.map(s=>({name:s.name,...hearingCalibratedModel(s)})),incomeDiagnostics:hearingDiagnostics(),
 unitNote:'healthYears are clinical QALYs; incomeEquivalentYears are welfare comparisons; totalYears and compatibility netQalys include both.',
 financialReview:{years:[2022,2021,2020],expenses:[2316008,2352018,2713993],averageAnnualExpenses:2460673,scope:'Historical whole-organization expenses, not current marginal hearing-course cost.'}});}
