import assert from 'node:assert/strict';
import model from '../data/san-francisco/clinic-portfolio-model-v2.json' with {type:'json'};
import {calculate,inputsFor} from '../lib/clinic-portfolio-model.mjs';
import {researchRankBySlug} from '../lib/research-cost-ranking.mjs';
const central=calculate(inputsFor(model,model.scenarios.find(s=>s.id==='Central')));
assert.equal(researchRankBySlug.get('clinic-by-the-bay').centralUsdPerTenQalys,central.donor_sf_per_10q);
assert.equal(researchRankBySlug.get('clinic-by-the-bay').bayUsdPerTenQalys,central.donor_bay_per_10q);
