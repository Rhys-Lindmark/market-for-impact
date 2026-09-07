import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {therapyDecisionModel} from '../../lib/therapy-model.mjs';
import {medicationAccessModel} from '../../lib/medication-access-model.mjs';
import {directQalyModel} from '../../lib/direct-qaly-model.mjs';
import {youthJobsDecisionModel} from '../../lib/youth-jobs-model.mjs';
import {cashHousingModel} from '../../lib/cash-housing-model.mjs';
import {earlierCareModel} from '../../lib/earlier-care-model.mjs';
import {dentalPreventionModel} from '../../lib/dental-prevention-model.mjs';
import {supportiveHealthModel} from '../../lib/supportive-health-model.mjs';
import {signedCourseQalyModel} from '../../lib/signed-course-qaly-model.mjs';
import {fallsCourseModel} from '../../lib/falls-course-model.mjs';
import {roomTurnoverModel} from '../../lib/room-turnover-model.mjs';
import {youthMortalityModel} from '../../lib/youth-mortality-model.mjs';
const calculators={therapy:therapyDecisionModel,medication:medicationAccessModel,direct:directQalyModel,youthJobs:youthJobsDecisionModel,cashHousing:cashHousingModel,earlierCare:earlierCareModel,dental:dentalPreventionModel,supportive:supportiveHealthModel,signedCourse:signedCourseQalyModel,falls:fallsCourseModel,turnover:roomTurnoverModel,youthMortality:youthMortalityModel};
export function buildCityRegistry(){
 const read=f=>JSON.parse(fs.readFileSync(f,'utf8'));
 const config=read('data/san-francisco/city-registry-config-v1.json');
 const queue=read('data/san-francisco/research-funnel-config-v1.json').deepDiveQueue;
 if(config.length!==queue.length||new Set(config.map(r=>r.ein)).size!==queue.length)throw Error('Registry must cover each original EIN once');
 const rows=config.map(r=>{
  const identity=queue.find(q=>q[0]===r.ein);if(!identity)throw Error('Unknown original EIN');
  const source=fs.readFileSync('data/san-francisco/'+r.modelFile,'utf8'),m=JSON.parse(source);
  let central;
  if(r.calculator==='bridge')central=m.modeledBridge.bestCostPerTenQalysUsd;
  else if(r.calculator==='published')central=m.publishedPriceUsd;
  else if(r.calculator==='poh')central=m.inputs[0].best/m.inputs[1].best*10;
  else {const s=m.scenarios.find(s=>/central/i.test(s.name));if(!s||!calculators[r.calculator])throw Error('Missing central calculator: '+r.slug);central=calculators[r.calculator](s).costPerTenQalys;}
  if(!Number.isFinite(central)||central<=0)throw Error('Invalid central price: '+r.slug);
  if(!fs.existsSync('app/charities/'+r.slug+'/page.tsx'))throw Error('Missing report');
  return{...r,organization:identity[1],centralUsdPerTenQalys:central,modelVersion:m.version,modelSha256:createHash('sha256').update(source).digest('hex'),canonicalUrl:'https://ai.rhyslindmark.com/donate/charities/'+r.slug};
 });
 return{version:'sf-city-registry-v1',reviewedAt:'2026-09-07',denominator:'10 incremental QALYs',scope:'Original 25 exploratory models, not a recommendation ranking. SFAF and PHC are separate comparators.',verifiedMarginalOffers:0,rows};
}
