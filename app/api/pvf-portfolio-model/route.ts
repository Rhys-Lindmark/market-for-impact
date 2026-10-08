import model from '@/data/san-francisco/pvf-portfolio-model-v1.json';
import {runScenarios} from '@/lib/pvf-portfolio-model.mjs';
import {central,diagnostics} from '@/lib/pvf-calibrated-model.mjs';
export function GET(){return Response.json({...model,evaluated:runScenarios(),current:{inputs:central,evaluated:diagnostics(),scope:'Conditional first-eye health and signed household resources; other portfolio effects unknown'},scope:'Complete donor numerator; selected pathway only',verifiedMarginalFundingOffer:null});}
