import {version,defaults,cases,calculate} from '@/lib/newdoor-current-model.mjs';
import historical from '@/data/san-francisco/newdoor-pre-recalibration-20261004.json';
import earlier from '@/data/san-francisco/newdoor-earlier-employment-diagnostic-20261004.json';
export function GET(){return Response.json({version,ordinaryDonation:{inputs:defaults,result:calculate(defaults)},reference:{inputs:cases.find(s=>s.id==='finiteCourseWorkingPrior'),result:calculate(cases.find(s=>s.id==='finiteCourseWorkingPrior'))},cases:cases.map(inputs=>({inputs,result:calculate(inputs)})),historicalPortfolio:historical,earlierEmploymentOnlyDiagnostic:earlier});}
