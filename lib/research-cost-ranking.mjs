import pvf from '../data/san-francisco/pvf-cataract-cea-v1.json' with { type: 'json' };
import code from '../data/san-francisco/code-tenderloin-model-v1.json' with {type:'json'};
import {calculate as codeModel} from './code-tenderloin-model.mjs';
import sfphf from '../data/san-francisco/sfphf-model-v1.json' with {type:'json'};
import {calculate as sfphfModel} from './sfphf-model.mjs';
import felton from '../data/san-francisco/felton-model-v1.json' with {type:'json'};
import {calculate as feltonModel} from './felton-model.mjs';
import hpp from '../data/san-francisco/hpp-model-v1.json' with {type:'json'};
import {calculate as hppModel} from './hpp-model.mjs';
import walk from '../data/san-francisco/walk-sf-cea-v1.json' with {type:'json'};
import {walkSfModel} from './walk-sf-model.mjs';
import hac from '../data/san-francisco/hac-developer-pathway-cea-v1.json' with { type: 'json' };
import spur from '../data/san-francisco/spur-portfolio-cea-v3.json' with { type: 'json' };
import {hacModel} from './urban-policy-model.mjs';
import {spurPortfolioModel} from './spur-portfolio-model.mjs';
import oa from '../data/san-francisco/oa-portfolio-model-v2.json' with {type:'json'};
import {calculate as oaModel} from './oa-portfolio-model.mjs';
import {cataractAccessModel} from './surgical-access-model.mjs';
import brightline from '../data/san-francisco/brightline-filtration-cea-v1.json' with { type: 'json' };
import rtsf from '../data/san-francisco/rtsf-falls-cea-v1.json' with { type: 'json' };
import {filtrationModel,homeModificationModel} from './home-environment-model.mjs';
import diabetes from '../data/san-francisco/st-anthony-diabetes-cea-v1.json' with { type: 'json' };
import {ymcaPortfolio as ymca,ymcaPortfolioModel} from './ymca-portfolio-model.mjs';
import respite from '../data/san-francisco/cfsf-respite-cea-v1.json' with { type: 'json' };
import wound from '../data/san-francisco/sfccc-wound-cea-v1.json' with { type: 'json' };
import { respiteModel, woundModel } from './clinical-pathways-model.mjs';
import { diabetesAccessModel } from './diabetes-access-model.mjs';
import clinic from '../data/san-francisco/clinic-portfolio-model-v2.json' with {type:'json'};
import {calculate as clinicModel,inputsFor as clinicInputs,expectedValue as clinicExpected} from './clinic-portfolio-model.mjs';
import breathe from '../data/san-francisco/breathe-cea-v1.json' with { type: 'json' };
import { cessationModel } from './breathe-model.mjs';
import vaccine from '../data/san-francisco/sffc-vaccine-cea-v1.json' with { type: 'json' };
import { vaccineAccessModel } from './vaccine-access-model.mjs';
import hbv from '../data/san-francisco/nems-hbv-cea-v1.json' with { type: 'json' };
import { hbvRetentionModel } from './hbv-retention-model.mjs';
import hcv from '../data/san-francisco/sfchc-hcv-cea-v1.json' with { type: 'json' };
import { hcvAccessModel } from './hcv-access-model.mjs';
import healthright from '../data/san-francisco/healthright-moud-cea-v1.json' with { type: 'json' };
import { moudAccessModel } from './moud-access-model.mjs';
import dope from '../data/san-francisco/dope-site-cea-v1.json' with { type: 'json' };
import { dopeSiteModel } from './dope-site-model.mjs';
import registry from '../data/san-francisco/city-registry-v1.json' with { type: 'json' };
import newdoor from '../data/san-francisco/newdoor-portfolio-v1.json' with {type:'json'};
import {calculate as newdoorPortfolioModel} from './newdoor-portfolio-model.mjs';
import hearing from '../data/san-francisco/hearing-access-cea-v2.json' with { type: 'json' };
import {hearingAccessModel} from './hearing-access-model.mjs';
import sfafPortfolio from '../data/san-francisco/sfaf-portfolio-model-v1.json' with {type:'json'};
import phcPortfolio from '../data/san-francisco/phc-portfolio-model-v1.json' with {type:'json'};
import {calculate as sfafPortfolioModel} from './sfaf-portfolio-model.mjs';
import {calculate as phcPortfolioModel,inputsFor as phcInputs} from './phc-portfolio-model.mjs';

function scenarioRow(slug, model, calculate) {
  const central = model.scenarios.find(s => /central/i.test(s.name));
  if (!central) throw new Error(`Missing central scenario: ${slug}`);
  const result = calculate(central);
  const positive = model.scenarios.map(calculate).map(s => s.costPerTenQalys).filter(v => Number.isFinite(v) && v > 0);
  return { slug, organization: model.organization, centralUsdPerTenQalys: result.costPerTenQalys,
    positiveEffectRangeUsd: { low: Math.min(...positive), high: Math.max(...positive) } };
}

// Rank the stated best estimate, never a favorable case or formatted price.
// Clinic uses its explicitly weighted signed-health expectation; other rows use central scenarios.
// A common denominator does not remove different cost scopes or evidence quality.
export const researchCostRanking = [
  scenarioRow('homeless-prenatal-program',{organization:'Homeless Prenatal Program',scenarios:hpp.scenarios.map(s=>({...s,name:s.id}))},s=>({costPerTenQalys:hppModel(s.inputs).sf.donor_per_10q})),
  scenarioRow('felton-institute',{organization:'Felton Institute',scenarios:felton.scenarios.map(s=>({...s,name:s.id}))},s=>({costPerTenQalys:feltonModel({...felton.central_inputs,...s.overrides}).donor_sf_per_10q})),
  scenarioRow('sf-public-health-foundation',{organization:'San Francisco Public Health Foundation',scenarios:sfphf.scenarios.map(s=>({...s,name:s.id}))},s=>({costPerTenQalys:sfphfModel(s.inputs).sf.donor_per_10q})),
  scenarioRow('code-tenderloin',{organization:'Code Tenderloin',scenarios:code.scenarios.map(s=>({...s,name:s.id}))},s=>({costPerTenQalys:codeModel({...code.central_inputs,...s.overrides}).donor_sf_per_10q})),
  scenarioRow('walk-san-francisco',{organization:'Walk San Francisco',scenarios:walk.scenarios.filter(s=>['central','favorableJointStress','pessimisticPositive'].includes(s.id)).map(s=>({...s,name:s.id==='favorableJointStress'?'favorable':s.id}))},s=>({costPerTenQalys:walkSfModel(s,walk.giftUsd).sfUsdPer10Qaly})),
  scenarioRow('housing-action-coalition',{organization:hac.organization,scenarios:hac.scenarios.filter(s=>!s.inherits).map(s=>({...s,name:s.id}))},hacModel),
  scenarioRow('spur',{organization:'SPUR',scenarios:spur.scenarios.filter(s=>['central','favorable','pessimisticPositive'].includes(s.id)).map(s=>({...s,name:s.id}))},s=>({costPerTenQalys:spurPortfolioModel(s,spur.budget.totalUsd).sfUsdPer10Qaly})),
  scenarioRow('operation-access',{organization:'Operation Access',scenarios:oa.scenarios.map(s=>({...s,name:s.id}))},s=>({costPerTenQalys:oaModel(oa,s).regions.sf.donor_per_10q})),
  scenarioRow('pacific-vision-foundation', {organization:pvf.organization.name,scenarios:pvf.coreScenarios.map(s=>({name:s.id,...s.inputs}))}, s=>cataractAccessModel(Object.fromEntries(Object.entries(s).filter(([k])=>k!=='name')))),
  scenarioRow('brightline-defense', {organization:brightline.organization,scenarios:Object.entries(brightline.coreScenarios).map(([name,s])=>({name,...s}))}, filtrationModel),
  scenarioRow('rebuilding-together-sf', {organization:rtsf.organization.name,scenarios:rtsf.scenarios.map(s=>({name:s.id,...s.inputs}))}, homeModificationModel),
  ...registry.rows.filter(r=>r.slug!=='new-door-ventures'),
  scenarioRow('new-door-ventures',{organization:newdoor.organization,scenarios:newdoor.scenarios.map(s=>({...s,name:s.id}))},s=>({costPerTenQalys:newdoorPortfolioModel(s,newdoor.giftUsd).sfUsdPer10Qaly})),
  scenarioRow('hearing-and-speech-center',{organization:hearing.clinical_operator,scenarios:hearing.scenarios},hearingAccessModel),
  scenarioRow('ymca-greater-sf', {organization:ymca.organization,scenarios:ymca.scenarios.filter(s=>['central','favorable','pessimisticPositive'].includes(s.id)).map(s=>({...s,name:s.id}))},s=>({costPerTenQalys:ymcaPortfolioModel(s).sfUsdPer10Qaly})),
  scenarioRow('community-forward-sf', respite, respiteModel),
  scenarioRow('sfccc', wound, woundModel),
  scenarioRow('st-anthony-foundation', diabetes, diabetesAccessModel),
  {...scenarioRow('clinic-by-the-bay',{organization:'Clinic by the Bay',scenarios:clinic.scenarios.map(s=>({...s,name:s.id}))},s=>({costPerTenQalys:clinicModel(clinicInputs(clinic,s)).donor_sf_per_10q})),centralUsdPerTenQalys:clinicExpected(clinic).donor_sf_per_10q,estimateBasis:'Subjective signed-health expectation; unweighted central and weight sensitivity in report'},
  scenarioRow('breathe-california', breathe, cessationModel),
  scenarioRow('san-francisco-free-clinic', vaccine, vaccineAccessModel),
  scenarioRow('north-east-medical-services', hbv, hbvRetentionModel),
  scenarioRow('san-francisco-community-health-center', hcv, hcvAccessModel),
  scenarioRow('healthright-360', healthright, moudAccessModel),
  scenarioRow('national-harm-reduction-coalition', dope, dopeSiteModel),
  scenarioRow('san-francisco-aids-foundation',{organization:'San Francisco AIDS Foundation',scenarios:sfafPortfolio.scenarios.map(s=>({...s,name:s.id}))},s=>({costPerTenQalys:sfafPortfolioModel(s.inputs).sf.donor_per_10q})),
  scenarioRow('project-homeless-connect',{organization:'Project Homeless Connect',scenarios:phcPortfolio.scenarios.map(s=>({...s,name:s.id}))},s=>({costPerTenQalys:phcPortfolioModel(phcInputs(phcPortfolio,s)).donor_sf_per_10q})),
].sort((a, b) => (a.centralUsdPerTenQalys ?? Infinity) - (b.centralUsdPerTenQalys ?? Infinity) || a.organization.localeCompare(b.organization));

export const researchRankBySlug = new Map(researchCostRanking.map((row, index) => [row.slug, { ...row, rank: index + 1 }]));
