import data from '@/data/us/remedy-alliance-cea-v1.json';
import eoData from '@/data/us/end-overdose-model-v1.json';
import {calculate as eoModel} from './end-overdose-model.mjs';
import hrtData from '@/data/us/hrt-model-v1.json';
import {calculate as hrtModel} from './hrt-model.mjs';
const hrt=hrtModel(hrtData.central_inputs);
const eo=eoModel(eoData.scenarios.find(s=>s.id==='central')!.inputs);
import {remedyAllianceModel} from './remedy-alliance-model.mjs';
import {visionToLearn,visionToLearnModel} from './vision-to-learn-model.mjs';
const vtl=visionToLearnModel(visionToLearn.scenarios[0].inputs);
const central=remedyAllianceModel(data.scenarios.find(s=>s.id==='central')!,data.giftUsd);
// A service location does not establish the marginal residence share.
// Never join these national prices into the SF-resident ranking.
export const usResearch=[{organization:'End Overdose',program:'Whole-gift overdose training and prevention',href:'/charities/end-overdose',outcomeScope:'US-wide',overallUsdPerTenQalys:eo.global.donor_usd_per_10_qaly,bayHealthShare:.07,bayUsdPerTenQalys:eo.bay.donor_usd_per_10_qaly,sfUsdPerTenQalys:eo.sf.donor_usd_per_10_qaly,verifiedServiceGeographies:['California','United States']},{organization:data.organization,program:'National naloxone supply and access',href:'/charities/remedy-alliance',outcomeScope:'US-wide',overallUsdPerTenQalys:central.donorUsdPer10Qaly,bayHealthShare:null,bayUsdPerTenQalys:null,sfUsdPerTenQalys:null,verifiedServiceGeographies:['California','United States']},
{organization:'Vision To Learn',program:'School-based vision care',href:'/charities/vision-to-learn',outcomeScope:'US-wide',overallUsdPerTenQalys:vtl.donor_per10_us,bayHealthShare:.08,bayUsdPerTenQalys:vtl.donor_per10_bay,sfUsdPerTenQalys:vtl.donor_per10_sf,verifiedServiceGeographies:['California','United States']},
{organization:'Harm Reduction Therapeutics',program:'Whole-gift RiVive supply and manufacturing',href:'/charities/harm-reduction-therapeutics',outcomeScope:'US-wide',overallUsdPerTenQalys:hrt.donor_us_per_10q,bayHealthShare:hrtData.central_inputs.bay_share,bayUsdPerTenQalys:hrt.donor_bay_per_10q,sfUsdPerTenQalys:hrt.donor_sf_per_10q,verifiedServiceGeographies:['United States']}];
