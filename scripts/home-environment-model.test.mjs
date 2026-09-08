import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import b from '../data/san-francisco/brightline-filtration-cea-v1.json' with {type:'json'};
import r from '../data/san-francisco/rtsf-falls-cea-v1.json' with {type:'json'};
import {filtrationModel,homeModificationModel} from '../lib/home-environment-model.mjs';
import {researchRankBySlug} from '../lib/research-cost-ranking.mjs';
const near=(a,e)=>e===null?assert.equal(a,null):assert.ok(Math.abs(a-e)<1e-6*Math.max(1,Math.abs(e)),`${a} != ${e}`);
test('Brightline core and separate stresses recompute from named inputs',()=>{
 for(const s of [...Object.values(b.coreScenarios),...Object.values(b.separateStressScenarios)]){
  assert.equal(s.calendarMonths,s.onsetMonths+s.plateauMonths);
  if(s.costBreakdown)near(Object.values(s.costBreakdown).reduce((a,v)=>a+v,0),s.paidDirectDeliveryCostUsd);
  const o=filtrationModel(s);near(o.integratedBenefitYears,s.expected.integratedBenefitYears);near(o.netQalys,s.expected.incrementalQaly);near(o.costPerTenQalys,s.expected.usdPer10Qaly);
 }
 assert.ok(Object.values(b.coreScenarios).every(s=>s.calendarMonths===6));
 near(filtrationModel(b.coreScenarios.central).costPerTenQalys,3600000);
 near(filtrationModel(b.separateStressScenarios.nonadditionalDonorSpecificHarm).netQalys,-.001);
});
test('RTSF core and stress resource perspectives recompute; null and harm have no positive price',()=>{
 for(const s of [...r.scenarios,...r.stressTests]){
  const o=homeModificationModel(s.inputs);near(o.netQalys,s.outputs.netAttributedQaly);near(o.costPerTenQalys,s.outputs.conditionalDonorUsdPer10Qaly);near(o.directResourcePrice,s.outputs.directResourceUsdPer10AttributedQaly);near(o.expandedResourcePrice,s.outputs.expandedResourceUsdPer10AttributedQaly);
 }
 near(Object.values(r.costs.centralDecompositionUsd).reduce((a,v)=>a+v,0),1000);
 assert.ok(r.scenarios.every(s=>s.inputs.effectiveYears<=1));
 near(homeModificationModel(r.scenarios[0].inputs).costPerTenQalys,5000000);
});
test('rankings exclude unverified longer persistence and preserve donor constraints',()=>{
 const br=researchRankBySlug.get('brightline-defense'),rr=researchRankBySlug.get('rebuilding-together-sf');
 near(br.centralUsdPerTenQalys,3600000);near(br.positiveEffectRangeUsd.low,266666.6666667);
 near(rr.centralUsdPerTenQalys,5000000);near(rr.positiveEffectRangeUsd.low,266666.6666667);
 assert.equal(b.roomForFundingUsd,null);assert.equal(r.fundingRoom.availableMarginalFundingUsd,null);
 assert.equal(b.donationIdentity.donationEin,'331131608');assert.equal(r.organization.ein,'943107808');
 assert.equal(b.existingFundingContext.regionalFiltrationAllocation.brightlineAwardUsd,null);
 assert.match(r.fundingRoom.currentPublicBaseline,/funding|funded/i);
 for(const slug of ['brightline-defense','rebuilding-together-sf'])assert.ok(fs.existsSync(`app/charities/${slug}/page.tsx`));
});
