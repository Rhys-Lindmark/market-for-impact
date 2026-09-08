import data from '@/data/bay/rotacare-cea-v2.json';
import {rotacareModel} from './rotacare-model.mjs';
const central=rotacareModel(data.scenarios.find(s=>s.id==='central')!.inputs);
// Bay-resident prices must not enter the SF-resident ranking.
export const bayResearch=[{organization:'RotaCare Bay Area',program:'Whole-gift cost; blood-pressure care quantified',href:'/charities/rotacare-bay-area',bayUsdPerTenQalys:central.bay.donor_usd_per_10_qaly,sfUsdPerTenQalys:null}];
