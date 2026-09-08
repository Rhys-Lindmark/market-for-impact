import {calculate} from './harmonized-calibration.mjs';
// Never combine global health prices with the SF-resident ranking.
export const internationalResearch=[
 {organization:'Against Malaria Foundation',program:'Public net-purchase giving',href:'/charities/against-malaria-foundation',globalUsdPer10Qaly:calculate('amf').usdPer10GlobalQalys,bayCreditedHealthShare:0},
 {organization:'New Incentives',program:'Representative-core vaccination support',href:'/charities/new-incentives',globalUsdPer10Qaly:calculate('ni').usdPer10GlobalQalys,bayCreditedHealthShare:0}
].sort((a,b)=>(a.globalUsdPer10Qaly??Infinity)-(b.globalUsdPer10Qaly??Infinity));
