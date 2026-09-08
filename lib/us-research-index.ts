import data from '@/data/us/remedy-alliance-cea-v1.json';
import {remedyAllianceModel} from './remedy-alliance-model.mjs';
import {visionToLearn,visionToLearnModel} from './vision-to-learn-model.mjs';
const vtl=visionToLearnModel(visionToLearn.scenarios[0].inputs);
const central=remedyAllianceModel(data.scenarios.find(s=>s.id==='central')!,data.giftUsd);
// A service location does not establish the marginal residence share.
// Never join these national prices into the SF-resident ranking.
export const usResearch=[{organization:data.organization,program:'National naloxone supply and access',href:'/charities/remedy-alliance',outcomeScope:'US-wide',overallUsdPerTenQalys:central.donorUsdPer10Qaly,bayHealthShare:null,bayUsdPerTenQalys:null,sfUsdPerTenQalys:null,verifiedServiceGeographies:['California','United States']},
{organization:'Vision To Learn',program:'School-based vision care',href:'/charities/vision-to-learn',outcomeScope:'US-wide',overallUsdPerTenQalys:vtl.donor_per10_us,bayHealthShare:.08,bayUsdPerTenQalys:vtl.donor_per10_bay,sfUsdPerTenQalys:vtl.donor_per10_sf,verifiedServiceGeographies:['California','United States']}];
