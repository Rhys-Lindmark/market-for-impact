import {version,defaults,cases,calculate} from '@/lib/selfhelp-current-model.mjs';
import historical from '@/data/san-francisco/selfhelp-pre-recalibration-20261004.json';
export function GET(){return Response.json({version,reference:{inputs:defaults,result:calculate(defaults)},ordinaryDonation:{expectedValue:null,reason:'Current ordinary-donation allocation, local transfer, fully supported costs and additional capacity are unidentified.'},cases:cases.map(inputs=>({inputs,result:calculate(inputs)})),historical});}
