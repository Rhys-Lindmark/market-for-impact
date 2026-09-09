import data from '@/data/california/cca-model-v1.json';
import {calculate} from './cca-model.mjs';
const central=calculate(data.scenarios.find(s=>s.id==='central')!.inputs);
// California-wide organizations remain a distinct cohort. All prices below
// retain the full gift; geography changes the health denominator, not cost.
export const californiaResearch=[{organization:'Coalition for Clean Air',program:'Whole-gift statewide air-quality policy',href:'/charities/coalition-for-clean-air',overallUsdPerTenQalys:central.us.donor_usd_per_10_qaly,bayUsdPerTenQalys:central.bay.donor_usd_per_10_qaly,sfUsdPerTenQalys:central.sf.donor_usd_per_10_qaly}];
