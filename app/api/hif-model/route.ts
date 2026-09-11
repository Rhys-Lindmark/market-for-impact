import {calculate,inputs,scenarios,modelVersion} from '@/lib/hif-model.mjs';
import report from '@/data/bay/hif-report.json';
import saved from '@/data/bay/hif-results.json';
export function GET(){return Response.json({modelVersion,inputs,scenarios,saved,sources:report.sources,evaluated:calculate(),verifiedMarginalFundingOffer:null,completeSocietalResourcesUsd:null,interpretation:'Whole organizational expense; EHF prevention-health only. Rehousing, affordable-housing and renovation benefits remain unquantified, not zero.'});}
