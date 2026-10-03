import assert from 'node:assert/strict';
import {calculate} from '../lib/clinic-calibrated-model.mjs';
import {researchRankBySlug} from '../lib/research-cost-ranking.mjs';
const central=calculate();
assert.equal(researchRankBySlug.get('clinic-by-the-bay').centralUsdPerTenQalys,central.donorSFPrice10);
assert.equal(researchRankBySlug.get('clinic-by-the-bay').bayUsdPerTenQalys,central.donorBayPrice10);
