import {version,defaults,cases,calculate} from '@/lib/huckleberry-current-model.mjs';
import historical from '@/data/san-francisco/huckleberry-pre-recalibration-20261004.json';
export function GET(){return Response.json({version,reference:{inputs:defaults,result:calculate()},ordinaryDonation:{expectedValue:null,reason:'Ordinary gift allocation, local transfer, costs and additional capacity unidentified.'},cases:cases.map(inputs=>({inputs,result:calculate(inputs)})),historical});}
