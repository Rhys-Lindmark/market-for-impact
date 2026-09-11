import {calculate as berkeleyFreeClinicModel} from './berkeley-free-clinic-model.mjs';
const berkeleyFreeClinic=berkeleyFreeClinicModel();
import {calculateResidenceSensitivity} from './bvhpf-residence-model.mjs';
const bvhpf=calculateResidenceSensitivity().residenceSensitivity.find(s=>s.id==='subjective-central');
import {calculate as youthAliveModel} from './youth-alive-model.mjs';
const youthAlive=youthAliveModel().weighted;
import {calculate as fufModel} from './fuf-model.mjs';
const fuf=fufModel().weighted;
import data from '@/data/bay/rotacare-cea-v2.json';
import {calculate as safeSoundModel} from './safe-sound-model.mjs';
const safeSound=safeSoundModel();
import {calculate as sonrisasModel} from './sonrisas-model.mjs';
const sonrisas=sonrisasModel().weighted;
import {calculate as sisterwebModel} from './sisterweb-model.mjs';
const sisterweb=sisterwebModel().weighted;
import {calculate as ceresModel} from './ceres-community-model.mjs';
const ceres=ceresModel();
import {calculate as heppacModel} from './heppac-model.mjs';
const heppac=heppacModel().conditionalOrdinaryGiftWeighted;
import {calculate as marinTreatmentModel} from './marin-treatment-model.mjs';
const marinTreatment=marinTreatmentModel();
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
// The main local comparison uses Bay-resident prices; narrower SF shares remain in reports.
export const bayResearch=[{organization:'Berkeley Free Clinic',program:'Whole-gift free medical care and community health',href:'/charities/berkeley-free-clinic',bayUsdPerTenQalys:berkeleyFreeClinic.modeledBayResidentUsdPer10Qaly,sfUsdPerTenQalys:berkeleyFreeClinic.modeledSfResidentUsdPer10Qaly},{scope:'SF',organization:'Bayview Hunters Point Foundation',program:'Whole-gift behavioral health and community services',href:'/charities/bayview-hunters-point-foundation',bayUsdPerTenQalys:bvhpf.bayResidentDonorCostPer10Qaly,sfUsdPerTenQalys:bvhpf.sfResidentDonorCostPer10Qaly},{organization:'Youth ALIVE!',program:'Whole-gift violence prevention and healing',href:'/charities/youth-alive',bayUsdPerTenQalys:youthAlive.donorCostPer10Qaly,sfUsdPerTenQalys:null},{scope:'SF',organization:'Friends of the Urban Forest',program:'Whole-gift street-tree planting and care',href:'/charities/friends-of-the-urban-forest',bayUsdPerTenQalys:fuf.modeledOrdinaryGiftCostPer10Qaly,sfUsdPerTenQalys:fuf.modeledOrdinaryGiftCostPer10Qaly},{organization:'RotaCare Bay Area',program:'Whole-gift cost; blood-pressure care quantified',href:'/charities/rotacare-bay-area',bayUsdPerTenQalys:central.bay.donor_usd_per_10_qaly,sfUsdPerTenQalys:null},{organization:'Roots Community Health',program:'Whole-gift cost; high-risk blood-pressure care quantified',href:'/charities/roots-community-health',bayUsdPerTenQalys:roots.donor_bay_per_10q,sfUsdPerTenQalys:null},
{organization:'Healthier Kids Foundation',program:'Whole-gift child vision, dental and hearing access',href:'/charities/healthier-kids-foundation',bayUsdPerTenQalys:hkf.donor_bay_per_10q,sfUsdPerTenQalys:hkf.donor_sf_per_10q},
{organization:'Via Heart Project',program:'Whole-gift AED placement and maintenance',href:'/charities/via-heart-project',bayUsdPerTenQalys:via.prices.bay.donor,sfUsdPerTenQalys:via.prices.sf.donor},
{organization:'Marin Treatment Center',program:'Conditional whole-gift opioid treatment access',href:'/charities/marin-treatment-center',bayUsdPerTenQalys:marinTreatment.inputs.gift*10/marinTreatment.weighted.bayQaly,sfUsdPerTenQalys:null},
{organization:'HEPPAC',program:'Conditional whole-gift harm reduction',href:'/charities/heppac',bayUsdPerTenQalys:heppac.bayDonorPer10Qaly,sfUsdPerTenQalys:heppac.sfDonorPer10Qaly},
{organization:'Ceres Community Project',program:'Whole-gift medically tailored meal support',href:'/charities/ceres-community-project',bayUsdPerTenQalys:ceres.inputs.giftUsd*10/ceres.weighted.bayQaly,sfUsdPerTenQalys:null},
{scope:'SF',organization:'SisterWeb Community Doula Network',program:'Whole-project prenatal and postpartum support',href:'/charities/sisterweb',bayUsdPerTenQalys:sisterweb.bayDonorPer10Qaly,sfUsdPerTenQalys:sisterweb.sfDonorPer10Qaly},
{organization:'Sonrisas Dental Health',program:'Whole-gift safety-net dental care',href:'/charities/sonrisas-dental-health',bayUsdPerTenQalys:sonrisas.modeledOrdinaryGiftCostPer10Qaly,sfUsdPerTenQalys:null},
{scope:'SF',organization:'Safe & Sound',program:'Whole-gift child and family support',href:'/charities/safe-and-sound',bayUsdPerTenQalys:safeSound.inputs.gift*10/safeSound.weighted.bayQaly,sfUsdPerTenQalys:safeSound.inputs.gift*10/safeSound.weighted.sfQaly}];
