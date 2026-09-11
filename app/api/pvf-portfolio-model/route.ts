import model from '@/data/san-francisco/pvf-portfolio-model-v1.json';
import {runScenarios} from '@/lib/pvf-portfolio-model.mjs';
export function GET(){return Response.json({...model,evaluated:runScenarios(),scope:'Whole gift; first-eye health component only; remaining health unquantified',verifiedMarginalFundingOffer:null});}
