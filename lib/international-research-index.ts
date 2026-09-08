import data from '@/data/international/amf-cea-v1.json';
import {amfModel} from './amf-model.mjs';
const central=amfModel(data.scenarios.find(s=>s.id==='central')!);
// Never combine global health prices with the SF-resident ranking.
export const internationalResearch=[{organization:'Against Malaria Foundation',program:'Public net-purchase giving',href:'/charities/against-malaria-foundation',globalUsdPer10Qaly:central.globalUsdPer10Qaly,bayCreditedHealthShare:0}];
