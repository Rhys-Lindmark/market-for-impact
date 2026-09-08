import data from '@/data/international/amf-cea-v1.json';
import {amfModel} from './amf-model.mjs';
import ni from '@/data/international/new-incentives-cea-v1.json';
import {newIncentivesModel} from './new-incentives-model.mjs';
const central=amfModel(data.scenarios.find(s=>s.id==='central')!);
// Never combine global health prices with the SF-resident ranking.
export const internationalResearch=[
 {organization:'Against Malaria Foundation',program:'Public net-purchase giving',href:'/charities/against-malaria-foundation',globalUsdPer10Qaly:central.globalUsdPer10Qaly,bayCreditedHealthShare:0},
 {organization:'New Incentives',program:'Representative-core vaccination support',href:'/charities/new-incentives',globalUsdPer10Qaly:newIncentivesModel(ni.scenarios.find(s=>s.id==='central')!,ni.giftUsd).globalUsdPer10Qaly,bayCreditedHealthShare:0}
].sort((a,b)=>(a.globalUsdPer10Qaly??Infinity)-(b.globalUsdPer10Qaly??Infinity));
