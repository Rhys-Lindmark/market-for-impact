import {calculate} from './harmonized-calibration.mjs';
import {calculate as miraclefeet} from './miraclefeet-model.mjs';
import {calculate as malariaConsortium} from './malaria-consortium-model.mjs';
import {calculate as helenKeller} from './helen-keller-model.mjs';
import fistula from '@/data/international/fistula-model-v1.json';
import {calculate as fistulaModel} from './fistula-model.mjs';
// Never combine global health prices with the SF-resident ranking.
export const internationalResearch=[
 {organization:'MiracleFeet',program:'Global partner-clinic support for clubfoot treatment',href:'/charities/miraclefeet',globalUsdPer10Qaly:miraclefeet().weighted.modeledOrdinaryGiftCostPer10Qaly,bayCreditedHealthShare:0},
 {organization:'Fistula Foundation',program:'Whole-gift childbirth-injury repair access',href:'/charities/fistula-foundation',globalUsdPer10Qaly:fistulaModel(fistula.central_inputs).donor_per_10q,bayCreditedHealthShare:0},
 {organization:'Helen Keller Intl',program:'Whole-gift nutrition and vision services',href:'/charities/helen-keller-international',globalUsdPer10Qaly:helenKeller().usdPer10GlobalQalys,bayCreditedHealthShare:0},
 {organization:'Malaria Consortium',program:'Whole-gift malaria prevention and broader services',href:'/charities/malaria-consortium',globalUsdPer10Qaly:malariaConsortium().usdPer10GlobalQalys,bayCreditedHealthShare:0},
 {organization:'Against Malaria Foundation',program:'Public net-purchase giving',href:'/charities/against-malaria-foundation',globalUsdPer10Qaly:calculate('amf').usdPer10GlobalQalys,bayCreditedHealthShare:0},
 {organization:'New Incentives',program:'Representative-core vaccination support',href:'/charities/new-incentives',globalUsdPer10Qaly:calculate('ni').usdPer10GlobalQalys,bayCreditedHealthShare:0}
].sort((a,b)=>(a.globalUsdPer10Qaly??Infinity)-(b.globalUsdPer10Qaly??Infinity));
