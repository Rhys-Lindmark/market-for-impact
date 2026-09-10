import {calculate as nfpModel} from './nfp-model.mjs';
const nfp=nfpModel().weighted;
import sirumData from '@/data/us/sirum-model-v1.json';
import {calculate as sirumModel} from './sirum-model.mjs';
const sirum=sirumModel(sirumData.central);
import data from '@/data/us/remedy-alliance-cea-v1.json';
import nextData from '@/data/us/next-distro-model-v1.json';
import {calculate as nextModel} from './next-distro-model.mjs';
const next=nextModel(nextData.central);
import eoData from '@/data/us/end-overdose-model-v1.json';
import {calculate as eoModel} from './end-overdose-model.mjs';
import hrtData from '@/data/us/hrt-model-v1.json';
import {calculate as hrtModel} from './hrt-model.mjs';
const hrt=hrtModel(hrtData.central_inputs);
const eo=eoModel(eoData.scenarios.find(s=>s.id==='central')!.inputs);
import {remedyAllianceModel} from './remedy-alliance-model.mjs';
import {visionToLearn,visionToLearnModel} from './vision-to-learn-model.mjs';
import newEyesData from '@/data/us/new-eyes-model-v1.json';
import {calculate as newEyesModel} from './new-eyes-model.mjs';
const vtl=visionToLearnModel(visionToLearn.scenarios[0].inputs);
const newEyes=newEyesModel(newEyesData);
const central=remedyAllianceModel(data.scenarios.find(s=>s.id==='central')!,data.giftUsd);
// A service location does not establish the marginal residence share.
// Never join these national prices into the SF-resident ranking.
export const usResearch=[{organization:'Changent / Nurse-Family Partnership',program:'Whole-gift national home-visiting implementation support',href:'/charities/nurse-family-partnership',outcomeScope:'US-wide',overallUsdPerTenQalys:nfp.donorCostPer10Qaly,bayHealthShare:nfp.bayImpactShare,bayUsdPerTenQalys:nfp.bayDonorCostPer10Qaly,sfUsdPerTenQalys:nfp.sfDonorCostPer10Qaly,verifiedServiceGeographies:['United States']},{organization:'SIRUM',program:'Whole-gift surplus medicine access',href:'/charities/sirum',outcomeScope:'US-wide',overallUsdPerTenQalys:sirum.regions.us.donorPer10Q,bayHealthShare:sirumData.central.bay_share,bayUsdPerTenQalys:sirum.regions.bay.donorPer10Q,sfUsdPerTenQalys:sirum.regions.sf.donorPer10Q,verifiedServiceGeographies:['California','United States']},{organization:'End Overdose',program:'Whole-gift overdose training and prevention',href:'/charities/end-overdose',outcomeScope:'US-wide',overallUsdPerTenQalys:eo.global.donor_usd_per_10_qaly,bayHealthShare:.07,bayUsdPerTenQalys:eo.bay.donor_usd_per_10_qaly,sfUsdPerTenQalys:eo.sf.donor_usd_per_10_qaly,verifiedServiceGeographies:['California','United States']},{organization:data.organization,program:'National naloxone supply and access',href:'/charities/remedy-alliance',outcomeScope:'US-wide',overallUsdPerTenQalys:central.donorUsdPer10Qaly,bayHealthShare:null,bayUsdPerTenQalys:null,sfUsdPerTenQalys:null,verifiedServiceGeographies:['California','United States']},
{organization:'Vision To Learn',program:'School-based vision care',href:'/charities/vision-to-learn',outcomeScope:'US-wide',overallUsdPerTenQalys:vtl.donor_per10_us,bayHealthShare:.08,bayUsdPerTenQalys:vtl.donor_per10_bay,sfUsdPerTenQalys:vtl.donor_per10_sf,verifiedServiceGeographies:['California','United States']},
{organization:'Harm Reduction Therapeutics',program:'Whole-gift RiVive supply and manufacturing',href:'/charities/harm-reduction-therapeutics',outcomeScope:'US-wide',overallUsdPerTenQalys:hrt.donor_us_per_10q,bayHealthShare:hrtData.central_inputs.bay_share,bayUsdPerTenQalys:hrt.donor_bay_per_10q,sfUsdPerTenQalys:hrt.donor_sf_per_10q,verifiedServiceGeographies:['United States']},
{organization:'NEXT Distro',program:'Whole-gift mail-based harm reduction',href:'/charities/next-distro',outcomeScope:'US-wide',overallUsdPerTenQalys:next.prices.us.donor,bayHealthShare:nextData.central.bay_share,bayUsdPerTenQalys:next.prices.bay.donor,sfUsdPerTenQalys:next.prices.sf.donor,verifiedServiceGeographies:['California','United States']},
{organization:'New Eyes for the Needy',program:'Whole-gift prescription-glasses access',href:'/charities/new-eyes-for-the-needy',outcomeScope:'US-wide',overallUsdPerTenQalys:newEyes.national.donor_per_10q,bayHealthShare:newEyesData.geography.bay_share,bayUsdPerTenQalys:newEyes.bay.donor_per_10q,sfUsdPerTenQalys:newEyes.sf.donor_per_10q,verifiedServiceGeographies:['California','United States']}];
