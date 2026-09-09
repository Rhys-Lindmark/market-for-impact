import data from '@/data/bay/rotacare-cea-v2.json';
import viaData from '@/data/bay/via-heart-model-v1.json';
import {calculate as viaModel} from './via-heart-model.mjs';
const via=viaModel(viaData.central);
import {rotacareModel} from './rotacare-model.mjs';
import rootsData from '@/data/bay/roots-model-v1.json';
import {calculate as rootsModel} from './roots-model.mjs';
import hkfData from '@/data/bay/hkf-model-v1.json';
import {calculate as hkfModel} from './hkf-model.mjs';
const hkf=hkfModel(hkfData.central_inputs);
const roots=rootsModel(rootsData.scenarios.find(s=>s.id==='central')!.inputs);
const central=rotacareModel(data.scenarios.find(s=>s.id==='central')!.inputs);
// Bay-resident prices must not enter the SF-resident ranking.
export const bayResearch=[{organization:'RotaCare Bay Area',program:'Whole-gift cost; blood-pressure care quantified',href:'/charities/rotacare-bay-area',bayUsdPerTenQalys:central.bay.donor_usd_per_10_qaly,sfUsdPerTenQalys:null},{organization:'Roots Community Health',program:'Whole-gift cost; high-risk blood-pressure care quantified',href:'/charities/roots-community-health',bayUsdPerTenQalys:roots.donor_bay_per_10q,sfUsdPerTenQalys:null},
{organization:'Healthier Kids Foundation',program:'Whole-gift child vision, dental and hearing access',href:'/charities/healthier-kids-foundation',bayUsdPerTenQalys:hkf.donor_bay_per_10q,sfUsdPerTenQalys:hkf.donor_sf_per_10q},
{organization:'Via Heart Project',program:'Whole-gift AED placement and maintenance',href:'/charities/via-heart-project',bayUsdPerTenQalys:via.prices.bay.donor,sfUsdPerTenQalys:via.prices.sf.donor}];
