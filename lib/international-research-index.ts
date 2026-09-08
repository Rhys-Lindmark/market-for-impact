import {calculate} from './harmonized-calibration.mjs';
import {calculate as malariaConsortium} from './malaria-consortium-model.mjs';
import {calculate as helenKeller} from './helen-keller-model.mjs';
// Never combine global health prices with the SF-resident ranking.
export const internationalResearch=[
 {organization:'Helen Keller Intl',program:'Whole-gift nutrition and vision services',href:'/charities/helen-keller-international',globalUsdPer10Qaly:helenKeller().usdPer10GlobalQalys,bayCreditedHealthShare:0},
 {organization:'Malaria Consortium',program:'Whole-gift malaria prevention and broader services',href:'/charities/malaria-consortium',globalUsdPer10Qaly:malariaConsortium().usdPer10GlobalQalys,bayCreditedHealthShare:0},
 {organization:'Against Malaria Foundation',program:'Public net-purchase giving',href:'/charities/against-malaria-foundation',globalUsdPer10Qaly:calculate('amf').usdPer10GlobalQalys,bayCreditedHealthShare:0},
 {organization:'New Incentives',program:'Representative-core vaccination support',href:'/charities/new-incentives',globalUsdPer10Qaly:calculate('ni').usdPer10GlobalQalys,bayCreditedHealthShare:0}
].sort((a,b)=>(a.globalUsdPer10Qaly??Infinity)-(b.globalUsdPer10Qaly??Infinity));
