import {scenarios as pvfScenarios,calculate as pvfModel} from './pvf-calibrated-model.mjs';

import {scenarios as glideCalibratedScenarios} from './glide-calibrated-model.mjs';

import {calculate as codeModel,scenarios as codeScenarios} from './code-tenderloin-calibrated-model.mjs';
import sfphf from '../data/san-francisco/sfphf-model-v1.json' with {type:'json'};
import {calculate as sfphfModel} from './sfphf-model.mjs';
import felton from '../data/san-francisco/felton-model-v1.json' with {type:'json'};
import {calculate as feltonModel} from './felton-model.mjs';
import hpp from '../data/san-francisco/hpp-model-v1.json' with {type:'json'};
import {calculate as hppModel} from './hpp-model.mjs';
import walk from '../data/san-francisco/walk-sf-cea-v1.json' with {type:'json'};
import {walkSfModel} from './walk-sf-model.mjs';
import {scenarios as hacScenarios,calculate as hacModel} from './hac-calibrated-model.mjs';
import {calculate as spurDepth,scenarios as spurCases} from './spur-calibrated-model.mjs';
import {calculate as oaModel,scenarios as oaScenarios} from './operation-access-calibrated-model.mjs';
import brightline from '../data/san-francisco/brightline-filtration-cea-v1.json' with { type: 'json' };
import rtsf from '../data/san-francisco/rtsf-falls-cea-v1.json' with { type: 'json' };
import {filtrationModel,homeModificationModel} from './home-environment-model.mjs';
import diabetes from '../data/san-francisco/st-anthony-diabetes-cea-v1.json' with { type: 'json' };
import {cases as ymcaCases,calculate as ymcaModel} from './ymca-current-calibrated-model.mjs';
import respite from '../data/san-francisco/cfsf-respite-cea-v1.json' with { type: 'json' };
import wound from '../data/san-francisco/sfccc-wound-cea-v1.json' with { type: 'json' };
import { respiteModel, woundModel } from './clinical-pathways-model.mjs';
import { diabetesAccessModel } from './diabetes-access-model.mjs';
import {calculate as clinicModel,cases as clinicCases} from './clinic-calibrated-model.mjs';
import {diagnostics as breatheCases} from './breathe-calibrated-model.mjs';
import vaccine from '../data/san-francisco/sffc-vaccine-cea-v1.json' with { type: 'json' };
import { vaccineAccessModel } from './vaccine-access-model.mjs';
import hcv from '../data/san-francisco/sfchc-hcv-cea-v1.json' with { type: 'json' };
import { hcvAccessModel } from './hcv-access-model.mjs';
import healthright from '../data/san-francisco/healthright-moud-cea-v1.json' with { type: 'json' };
import { moudAccessModel } from './moud-access-model.mjs';
import dope from '../data/san-francisco/dope-site-cea-v1.json' with { type: 'json' };
import { dopeSiteModel } from './dope-site-model.mjs';
import registry from '../data/san-francisco/city-registry-v1.json' with { type: 'json' };
import {cases as newdoorCases,calculate as newdoorModel} from './newdoor-current-model.mjs';
import {cases as selfhelpCases,calculate as selfhelpModel} from './selfhelp-current-model.mjs';
import hearing from '../data/san-francisco/hearing-access-cea-v2.json' with { type: 'json' };
import {hearingCalibratedModel as hearingAccessModel,scenarios as hearingScenarios} from './hearing-calibrated-model.mjs';
import phcPortfolio from '../data/san-francisco/phc-portfolio-model-v1.json' with {type:'json'};
import {calculate as sfafCalibratedModel,scenarios as sfafCalibratedScenarios} from './sfaf-calibrated-model.mjs';
import {calculate as phcPortfolioModel,scenarios as phcScenarios} from './phc-calibrated-model.mjs';
import {calculate as compassModel,scenarios as compassScenarios} from './compass-calibrated-model.mjs';
import {calculate as hamiltonModel,scenarios as hamiltonScenarios} from './hamilton-calibrated-model.mjs';
import {calculate as fufModel,scenarios as fufScenarios} from './fuf-calibrated-model.mjs';

function scenarioRow(slug, model, calculate) {
  const central = model.scenarios.find(s => /central/i.test(s.name));
  if (!central) throw new Error(`Missing central scenario: ${slug}`);
  const result = calculate(central);
  const positive = model.scenarios.map(calculate).map(s => s.costPerTenQalys).filter(v => Number.isFinite(v) && v > 0);
  return { slug, organization: model.organization, centralUsdPerTenQalys: result.costPerTenQalys,
    ...(Object.hasOwn(result, 'bayCostPerTenQalys') ? {bayUsdPerTenQalys: result.bayCostPerTenQalys} : {}),
    positiveEffectRangeUsd: { low: Math.min(...positive), high: Math.max(...positive) } };
}

// Rank the stated best estimate, never a favorable case or formatted price.
// Current Clinic uses an independently rebuilt unweighted health/resource center; historical weights remain in its report/API.
// A common denominator does not remove different cost scopes or evidence quality.
export const researchCostRanking = [
  scenarioRow('homeless-prenatal-program',{organization:'Homeless Prenatal Program',scenarios:hpp.scenarios.map(s=>({...s,name:s.id}))},s=>({costPerTenQalys:hppModel(s.inputs).sf.donor_per_10q,bayCostPerTenQalys:hppModel(s.inputs).bay.donor_per_10q})),
  scenarioRow('felton-institute',{organization:'Felton Institute',scenarios:felton.scenarios.map(s=>({...s,name:s.id}))},s=>({costPerTenQalys:feltonModel({...felton.central_inputs,...s.overrides}).donor_sf_per_10q,bayCostPerTenQalys:feltonModel({...felton.central_inputs,...s.overrides}).donor_bay_per_10q})),
  scenarioRow('sf-public-health-foundation',{organization:'San Francisco Public Health Foundation',scenarios:sfphf.scenarios.map(s=>({...s,name:s.id}))},s=>({costPerTenQalys:sfphfModel(s.inputs).sf.donor_per_10q,bayCostPerTenQalys:sfphfModel(s.inputs).bay.donor_per_10q})),
  scenarioRow('code-tenderloin',{organization:'Code Tenderloin',scenarios:codeScenarios},s=>{const r=codeModel(s.overrides);return {costPerTenQalys:r.sfUsdPerBetterLife,bayCostPerTenQalys:r.bayUsdPerBetterLife};}),
  scenarioRow('walk-san-francisco',{organization:'Walk San Francisco',scenarios:walk.scenarios.filter(s=>['central','favorableJointStress','pessimisticPositive'].includes(s.id)).map(s=>({...s,name:s.id==='favorableJointStress'?'favorable':s.id}))},s=>({costPerTenQalys:walkSfModel(s,walk.giftUsd).sfUsdPer10Qaly,bayCostPerTenQalys:walkSfModel(s,walk.giftUsd).bayUsdPer10Qaly})),
  scenarioRow('housing-action-coalition',{organization:'Housing Action Coalition',scenarios:hacScenarios.map(([name,overrides])=>({name,overrides}))},s=>{const r=hacModel(s.overrides);return {costPerTenQalys:r.donorPriceSF,bayCostPerTenQalys:r.donorPriceBay};}),
  scenarioRow('spur',{organization:'SPUR',scenarios:Object.entries(spurCases).map(([name,inputs])=>({name,inputs}))},s=>{const r=spurDepth(s.inputs);return {costPerTenQalys:r.regions.sf.price10,bayCostPerTenQalys:r.regions.bay.price10};}),
  scenarioRow('operation-access',{organization:'Operation Access',scenarios:Object.entries(oaScenarios).map(([name,inputs])=>({name,inputs}))},s=>{const r=oaModel(s.inputs);return{costPerTenQalys:r.regions.sf.price10,bayCostPerTenQalys:r.regions.bay.price10};}),
  scenarioRow('pacific-vision-foundation',{organization:'Pacific Vision Foundation',scenarios:Object.entries(pvfScenarios).map(([name,inputs])=>({name,inputs}))},s=>{const r=pvfModel(s.inputs);return{costPerTenQalys:r.regions.sf.donorPrice10,bayCostPerTenQalys:r.regions.bay.donorPrice10};}),
  scenarioRow('brightline-defense', {organization:brightline.organization,scenarios:Object.entries(brightline.coreScenarios).map(([name,s])=>({name,...s}))}, filtrationModel),
  scenarioRow('rebuilding-together-sf', {organization:rtsf.organization.name,scenarios:rtsf.scenarios.map(s=>({name:s.id,...s.inputs}))}, homeModificationModel),
  ...registry.rows.filter(r=>!['self-help-for-the-elderly','new-door-ventures','glide','compass-family-services','hamilton-families','friends-of-the-urban-forest'].includes(r.slug)),
  {...scenarioRow('self-help-for-the-elderly',{organization:'Self-Help for the Elderly',scenarios:selfhelpCases.map(s=>({...s,name:s.id==='conditionalCourseReference'?'central':s.id}))},s=>{const r=selfhelpModel(s);return {costPerTenQalys:r.sf.usdPerBetterLife,bayCostPerTenQalys:r.bay.usdPerBetterLife};}),estimateStatus:'conditional-course',estimateBasis:'Conditional prospective SF-resident trial-matched course; not current six-week Sun-style delivery or ordinary-donation EV.'},
  scenarioRow('friends-of-the-urban-forest',{organization:'Friends of the Urban Forest',scenarios:['central','favorable','cautious'].map(name=>({name,...fufScenarios[name]}))},s=>{const {name,...inputs}=s;const r=fufModel(inputs);return {costPerTenQalys:r.sf.costPerBetterLifeUSD,bayCostPerTenQalys:r.bay.costPerBetterLifeUSD};}),
  scenarioRow('hamilton-families',{organization:'Hamilton Families',scenarios:['central','favorable','cautious'].map(name=>({name,...hamiltonScenarios[name]}))},s=>{const {name,...inputs}=s;const r=hamiltonModel(inputs);return {costPerTenQalys:r.costPerBetterLifeUSD,bayCostPerTenQalys:r.bay.costPerBetterLifeUSD};}),
  scenarioRow('compass-family-services',{organization:'Compass Family Services',scenarios:['central','favorable','cautious'].map(name=>({name,...compassScenarios[name]}))},s=>{const {name,...inputs}=s;const r=compassModel(inputs);return {costPerTenQalys:r.costPerBetterLifeUSD,bayCostPerTenQalys:r.bay.costPerBetterLifeUSD};}),
  scenarioRow('glide',{organization:'GLIDE Foundation',scenarios:glideCalibratedScenarios().map(s=>({...s,name:s.id==='conditional_center'?'central':s.id}))},s=>({costPerTenQalys:s.result.sf.donorPer10HealthyYears,bayCostPerTenQalys:s.result.bay.donorPer10HealthyYears})),
  {...scenarioRow('new-door-ventures',{organization:'New Door Ventures',scenarios:newdoorCases.map(s=>({...s,name:s.id==='finiteCourseWorkingPrior'?'central':s.id}))},s=>{const r=newdoorModel(s);return {costPerTenQalys:r.sfUsdPer10ConditionalCombinedHealthyYearEquivalent,bayCostPerTenQalys:r.bayUsdPer10ConditionalCombinedHealthyYearEquivalent};}),estimateStatus:'conditional-net-harm',estimateBasis:'Conditional partial model: specified health, household cash and time assumptions produce a negative assessed-channel result; complete ordinary-donation EV remains unknown.'},
  scenarioRow('hearing-and-speech-center',{organization:hearing.clinical_operator,scenarios:hearingScenarios},s=>hearingAccessModel(s.overrides)),
  scenarioRow('ymca-greater-sf',{organization:'YMCA of Greater San Francisco',scenarios:Object.entries(ymcaCases).map(([name,inputs])=>({name,inputs}))},s=>{const r=ymcaModel(s.inputs);return {costPerTenQalys:r.geography.sf.donorUSDPer10CombinedEquivalentYears,bayCostPerTenQalys:r.geography.bayIncludingSF.donorUSDPer10CombinedEquivalentYears};}),
  scenarioRow('community-forward-sf', respite, respiteModel),
  scenarioRow('sfccc', wound, woundModel),
  scenarioRow('st-anthony-foundation', diabetes, diabetesAccessModel),
  scenarioRow('clinic-by-the-bay',{organization:'Clinic by the Bay',scenarios:Object.entries(clinicCases).map(([id,inputs])=>({name:id,inputs}))},s=>{const r=clinicModel(s.inputs);return {costPerTenQalys:r.donorSFPrice10,bayCostPerTenQalys:r.donorBayPrice10};}),
  scenarioRow('breathe-california', {organization:'Breathe California',scenarios:Object.entries(breatheCases()).map(([name,result])=>({name,result}))},s=>({costPerTenQalys:s.result.ledgers.sf.conditionalDonorPer10,bayCostPerTenQalys:s.result.ledgers.bay.conditionalDonorPer10})),
  scenarioRow('san-francisco-free-clinic', vaccine, vaccineAccessModel),
  {slug:'north-east-medical-services',organization:'North East Medical Services',centralUsdPerTenQalys:null,bayUsdPerTenQalys:null,positiveEffectRangeUsd:null,estimateBasis:'Ordinary Foundation gift unestimated; conditional HBV diagnostic retained in report'},
  scenarioRow('san-francisco-community-health-center', hcv, hcvAccessModel),
  scenarioRow('healthright-360', healthright, moudAccessModel),
  scenarioRow('national-harm-reduction-coalition', dope, dopeSiteModel),
  scenarioRow('san-francisco-aids-foundation',{organization:'San Francisco AIDS Foundation',scenarios:sfafCalibratedScenarios()},s=>{const r=sfafCalibratedModel(s.overrides);return {costPerTenQalys:r.sfUsdPerBetterLife,bayCostPerTenQalys:r.bayUsdPerBetterLife};}),
  scenarioRow('project-homeless-connect',{organization:'Project Homeless Connect',scenarios:phcScenarios},s=>({costPerTenQalys:phcPortfolioModel(s.inputs,s.resources).donor_sf_per_10q,bayCostPerTenQalys:phcPortfolioModel(s.inputs,s.resources).donor_bay_per_10q})),
].sort((a, b) => (a.centralUsdPerTenQalys ?? Infinity) - (b.centralUsdPerTenQalys ?? Infinity) || a.organization.localeCompare(b.organization));

// Null prices have a list position, not a numeric cost-effectiveness rank.
export const researchRankBySlug = new Map(researchCostRanking.map((row, index) => [row.slug, { ...row, orderIndex: index + 1, rank: row.centralUsdPerTenQalys===null?null:index + 1 }]));
