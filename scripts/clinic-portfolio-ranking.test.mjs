import assert from 'node:assert/strict';
import model from '../data/san-francisco/clinic-portfolio-model-v2.json' with {type:'json'};
import {expectedValue} from '../lib/clinic-portfolio-model.mjs';
import {researchRankBySlug} from '../lib/research-cost-ranking.mjs';
assert.equal(researchRankBySlug.get('clinic-by-the-bay').centralUsdPerTenQalys,expectedValue(model).donor_sf_per_10q);
