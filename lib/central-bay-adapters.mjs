import {calculate as model0} from './face-to-face-model.mjs';
import {calculate as model1} from './oakland-edc-model.mjs';
import {calculate as model2} from './on-site-dental-model.mjs';
import {calculate as model3} from './hif-model.mjs';
import {calculate as model4} from './bats-model.mjs';
import {calculate as model5} from './dentists-on-wheels-model.mjs';
import {calculate as model6} from './season-of-sharing-model.mjs';
import {calculate as model7} from './greenlight-model.mjs';
import {runModel as model8} from './legal-link-model.mjs';
import {calculate as model9} from './bamru-model.mjs';
import {calculate as model10} from './baylegal-model.mjs';
import {calculate as model11} from './lacasa-model.mjs';
import {calculate as model12} from './melp-model.mjs';
import {calculate as model13} from './berkeley-free-clinic-model.mjs';
import {calculate as model14} from './youth-alive-model.mjs';
import {calculate as model15} from './safe-sound-model.mjs';
import {calculate as model16} from './sonrisas-model.mjs';
import {calculate as model17} from './sisterweb-model.mjs';
import {calculate as model18} from './ceres-community-model.mjs';
import {calculate as model19} from './heppac-model.mjs';
import {calculate as model20} from './marin-treatment-model.mjs';
import {calculate as bvhpfModel} from './bvhpf-model.mjs';
import {residenceScenarios} from './bvhpf-residence-model.mjs';
export function centralRow(rows,key,value){const found=rows.filter(r=>r[key]===value);if(found.length!==1)throw new Error('Expected one central scenario');return found[0];}
export function price(gift,q){if(!Number.isFinite(gift)||!Number.isFinite(q))throw new Error('Nonfinite model input');if(q<=0)return null;const p=10*gift/q;if(!Number.isFinite(p))throw new Error('Nonfinite price');return p;}
const get=(r,path)=>path.split('.').reduce((v,k)=>v[k],r);
export const centralBayAdapters={};
{const r=model0(),c=centralRow(r.rows,'id','central');centralBayAdapters['face-to-face']={bayUsdPerTenQalys:c.bayCostPer10,sfUsdPerTenQalys:null};}
{const r=model1(),c=centralRow(r.rows,'id','central');centralBayAdapters['oakland-eviction-defense-center']={bayUsdPerTenQalys:c.bayCostPer10,sfUsdPerTenQalys:null};}
{const r=model2(),c=centralRow(r.rows,'id','central');centralBayAdapters['on-site-dental-care-foundation']={bayUsdPerTenQalys:c.bayCostPer10,sfUsdPerTenQalys:null};}
{const r=model3(),c=centralRow(r.rows,'id','central');centralBayAdapters['housing-industry-foundation']={bayUsdPerTenQalys:c.bayCostPer10,sfUsdPerTenQalys:null};}
{const r=model4(),c=centralRow(r.rows,'id','central');centralBayAdapters['berkeley-addiction-treatment-services']={bayUsdPerTenQalys:c.costPer10,sfUsdPerTenQalys:null};}
{const r=model5(),c=centralRow(r.rows,'id','central');centralBayAdapters['dentists-on-wheels']={bayUsdPerTenQalys:c.bayCostPer10,sfUsdPerTenQalys:null};}
{const r=model6(),c=centralRow(r.rows,'id','central');centralBayAdapters['season-of-sharing']={bayUsdPerTenQalys:c.bayCostPer10,sfUsdPerTenQalys:null};}
{const r=model7(),c=centralRow(r.rows,'id','central');centralBayAdapters['greenlight-clinic']={bayUsdPerTenQalys:c.bayCostPer10,sfUsdPerTenQalys:null};}
{const r=model8(),c=centralRow(r.rows,'name','Central');centralBayAdapters['legal-link']={bayUsdPerTenQalys:c.bayCostPer10,sfUsdPerTenQalys:c.sfCostPer10};}
{const r=model9(),c=centralRow(r.rows,'name','central');centralBayAdapters['bamru']={bayUsdPerTenQalys:c.bayDonorCostPer10Qaly,sfUsdPerTenQalys:price(get(r,'inputs.giftUsd'),c.sfQaly)};}
{const r=model10(),c=centralRow(r.scenarios,'name','central');centralBayAdapters['bay-area-legal-aid']={bayUsdPerTenQalys:price(get(r,'inputs.ordinaryGiftUsd'),c.bayQaly),sfUsdPerTenQalys:price(get(r,'inputs.ordinaryGiftUsd'),c.sfQaly)};}
{const r=model11(),c=centralRow(r.rows,'id','central');centralBayAdapters['la-casa-de-las-madres']={bayUsdPerTenQalys:price(get(r,'inputs.giftUsd'),c.bayQaly),sfUsdPerTenQalys:price(get(r,'inputs.giftUsd'),c.sfQaly)};}
{const r=model12(),c=centralRow(r.rows,'name','central');centralBayAdapters['melp-ablecloset']={bayUsdPerTenQalys:c.bayDonorCostPer10Qaly,sfUsdPerTenQalys:c.sfDonorCostPer10Qaly};}
{const r=model13(),c=centralRow(r.scenarios,'name','central');centralBayAdapters['berkeley-free-clinic']={bayUsdPerTenQalys:price(get(r,'inputs.ordinaryGiftUsd'),c.bayResidentQaly),sfUsdPerTenQalys:price(get(r,'inputs.ordinaryGiftUsd'),c.sfResidentQaly)};}
{const r=model14(),c=centralRow(r.scenarios,'name','central');centralBayAdapters['youth-alive']={bayUsdPerTenQalys:price(get(r,'inputs.gift'),c.bayQaly),sfUsdPerTenQalys:null};}
{const r=model15(),c=centralRow(r.scenarios,'name','central');centralBayAdapters['safe-and-sound']={bayUsdPerTenQalys:price(get(r,'inputs.gift'),c.bayQaly),sfUsdPerTenQalys:price(get(r,'inputs.gift'),c.sfQaly)};}
{const r=model16(),c=centralRow(r.scenarios,'name','central');centralBayAdapters['sonrisas-dental-health']={bayUsdPerTenQalys:price(get(r,'inputs.giftUsd'),c.bayQaly),sfUsdPerTenQalys:null};}
{const r=model17(),c=centralRow(r.results,'name','central');centralBayAdapters['sisterweb']={bayUsdPerTenQalys:price(get(r,'ordinaryGift'),c.giftBayQaly),sfUsdPerTenQalys:price(get(r,'ordinaryGift'),c.giftSfQaly)};}
{const r=model18(),c=centralRow(r.scenarios,'name','central');centralBayAdapters['ceres-community-project']={bayUsdPerTenQalys:price(get(r,'inputs.giftUsd'),c.bayQaly),sfUsdPerTenQalys:null};}
{const r=model19(),c=centralRow(r.results,'name','central');centralBayAdapters['heppac']={bayUsdPerTenQalys:c.conditionalOrdinaryGift.bayDonorPer10Qaly,sfUsdPerTenQalys:c.conditionalOrdinaryGift.sfDonorPer10Qaly};}
{const r=model20(),c=centralRow(r.scenarios,'name','central');centralBayAdapters['marin-treatment-center']={bayUsdPerTenQalys:price(get(r,'inputs.gift'),c.bayQaly),sfUsdPerTenQalys:null};}
{const r=bvhpfModel(),c=centralRow(r.scenarios,'name','central'),g=centralRow(residenceScenarios,'id','subjective-central');centralBayAdapters['bayview-hunters-point-foundation']={bayUsdPerTenQalys:price(r.inputs.giftUsd,c.netQaly*g.bayResidentShare),sfUsdPerTenQalys:price(r.inputs.giftUsd,c.netQaly*g.sfResidentShare)};}
