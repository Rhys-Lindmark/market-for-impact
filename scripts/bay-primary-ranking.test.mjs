import test from 'node:test';
import assert from 'node:assert/strict';
import {researchCostRanking as rows} from '../lib/research-cost-ranking.mjs';
import {localResearchEstimate} from '../lib/local-research-estimate.mjs';
import {calculate as hpp} from '../lib/hpp-model.mjs';
import {calculate as felton} from '../lib/felton-model.mjs';
import {calculate as sfphf} from '../lib/sfphf-model.mjs';
import {calculate as code} from '../lib/code-tenderloin-model.mjs';
import {walkSfModel} from '../lib/walk-sf-model.mjs';
import {spurPortfolioModel} from '../lib/spur-portfolio-model.mjs';
import {calculate as oa} from '../lib/oa-portfolio-model.mjs';
import {calculate as newdoorPortfolioModel} from '../lib/newdoor-portfolio-model.mjs';
import {ymcaPortfolio,ymcaPortfolioModel} from '../lib/ymca-portfolio-model.mjs';
import {expectedValue as clinic} from '../lib/clinic-portfolio-model.mjs';
import {calculate as sfaf} from '../lib/sfaf-portfolio-model.mjs';
import {calculate as phc,inputsFor} from '../lib/phc-portfolio-model.mjs';
import fs from 'node:fs';
const read=name=>JSON.parse(fs.readFileSync(new URL('../data/san-francisco/'+name,import.meta.url)));
const central=d=>d.scenarios.find(s=>s.id==='central');
test('twelve explicit Bay adapters match model outputs without changing SF prices',()=>{
 const h=read('hpp-model-v1.json'),f=read('felton-model-v1.json'),p=read('sfphf-model-v1.json'),c=read('code-tenderloin-model-v1.json'),w=read('walk-sf-cea-v1.json'),s=read('spur-portfolio-cea-v3.json'),o=read('oa-portfolio-model-v2.json'),n=read('newdoor-portfolio-v1.json'),cl=read('clinic-portfolio-model-v2.json'),a=read('sfaf-portfolio-model-v1.json'),ph=read('phc-portfolio-model-v1.json');
 const expected={
  'homeless-prenatal-program':hpp(central(h).inputs).bay.donor_per_10q,
  'felton-institute':felton({...f.central_inputs,...central(f).overrides}).donor_bay_per_10q,
  'sf-public-health-foundation':sfphf(central(p).inputs).bay.donor_per_10q,
  'code-tenderloin':code({...c.central_inputs,...central(c).overrides}).donor_bay_per_10q,
  'walk-san-francisco':walkSfModel(central(w),w.giftUsd).bayUsdPer10Qaly,
  spur:spurPortfolioModel(central(s),s.budget.totalUsd).bayUsdPer10Qaly,
  'operation-access':oa(o,central(o)).regions.bay.donor_per_10q,
  'new-door-ventures':newdoorPortfolioModel(central(n),n.giftUsd).bayUsdPer10Qaly,
  'ymca-greater-sf':ymcaPortfolioModel(central(ymcaPortfolio)).bayUsdPer10Qaly,
  'clinic-by-the-bay':clinic(cl).donor_bay_per_10q,
  'san-francisco-aids-foundation':sfaf(central(a).inputs).bay.donor_per_10q,
  'project-homeless-connect':phc(inputsFor(ph,central(ph))).donor_bay_per_10q,
 };
 assert.equal(rows.filter(r=>Object.hasOwn(r,'bayUsdPerTenQalys')).length,12);
 for(const [slug,value] of Object.entries(expected)){
  assert.ok(Number.isFinite(value)&&value>0,slug);
  const row=rows.find(r=>r.slug===slug);assert.equal(row.bayUsdPerTenQalys,value,slug);
  assert.equal(localResearchEstimate(row).localUsdPerTenQalys,value,slug);
  assert.equal(localResearchEstimate(row).estimateGeography,'Bay Area');
 }
 assert.equal(rows.find(r=>r.slug==='project-homeless-connect').centralUsdPerTenQalys,798863.3403891586);
});
test('Bay selection distinguishes missing model from explicit null, independent of price or scope',()=>{
 assert.equal(localResearchEstimate({centralUsdPerTenQalys:10}).localUsdPerTenQalys,10);
 assert.equal(localResearchEstimate({centralUsdPerTenQalys:10}).estimateGeography,'San Francisco');
 assert.equal(localResearchEstimate({centralUsdPerTenQalys:10,bayUsdPerTenQalys:null}).localUsdPerTenQalys,null);
 assert.equal(localResearchEstimate({centralUsdPerTenQalys:10,bayUsdPerTenQalys:20,scope:'SF'}).localUsdPerTenQalys,20);
});
