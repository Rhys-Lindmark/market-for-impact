import data from '@/data/california/cca-model-v1.json';
import {calculate as cicModel} from './california-immunization-model.mjs';
const cic=cicModel();
import {calculate} from './cca-model.mjs';
import calwalks from '@/data/california/calwalks-model-v1.json';
import {calculate as calwalksModel} from './calwalks-model.mjs';
const walks=calwalksModel(calwalks.scenarios.find(s=>s.id==='central')!.inputs);
const central=calculate(data.scenarios.find(s=>s.id==='central')!.inputs);
// California-wide organizations remain a distinct cohort. All prices below
// retain the full gift; geography changes the health denominator, not cost.
export const californiaResearch=[{organization:'Coalition for Clean Air',program:'Whole-gift statewide air-quality policy',href:'/charities/coalition-for-clean-air',overallUsdPerTenQalys:central.us.donor_usd_per_10_qaly,bayUsdPerTenQalys:central.bay.donor_usd_per_10_qaly,sfUsdPerTenQalys:central.sf.donor_usd_per_10_qaly},
{organization:'California Walks',program:'Whole-gift crossing-safety implementation',href:'/charities/california-walks',overallUsdPerTenQalys:walks.us.donor_usd_per_10_qaly,bayUsdPerTenQalys:walks.bay.donor_usd_per_10_qaly,sfUsdPerTenQalys:walks.sf.donor_usd_per_10_qaly},
{organization:'California Immunization Coalition',program:'Whole-gift statewide vaccination policy and access',href:'/charities/california-immunization-coalition',overallUsdPerTenQalys:cic.weighted.donorCostPer10Qaly,bayUsdPerTenQalys:cic.inputs.gift*10/cic.weighted.bayQaly,sfUsdPerTenQalys:cic.inputs.gift*10/cic.weighted.sfQaly}];
