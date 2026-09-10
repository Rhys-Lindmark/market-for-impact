import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import data from '../data/international/amf-cea-v1.json' with {type:'json'};
import {amfModel} from '../lib/amf-model.mjs';
import {researchCostRanking} from '../lib/research-cost-ranking.mjs';
test('AMF nine audited scenarios match independent stored calculations',()=>{
 for(const s of data.scenarios){const r=amfModel(s);assert.ok(Math.abs(r.globalQaly-s.outputs.totalNetQaly)<1e-8,s.id);if(r.globalQaly>0){assert.ok(Math.abs(r.globalUsdPer10Qaly-s.outputs.donorUsdPer10Qaly)<.001);assert.ok(Math.abs(r.globalUsdPer10Qaly/10-r.globalUsdPerQaly)<1e-8);}else assert.equal(r.globalUsdPer10Qaly,null);assert.equal(r.bayUsdPer10Qaly,null);assert.equal(r.bayDirectQaly,0);}
});
test('AMF global benefits never enter SF ranking and retain donor cost',()=>{
 assert.ok(!researchCostRanking.some(r=>JSON.stringify(r).includes('against-malaria')));
 for(const s of data.scenarios){const r=amfModel(s);assert.equal(r.donorCostUsd,1000*s.price);assert.equal(r.grossAssociatedCostUsd,1000*(s.price+s.extra));}
 const index=fs.readFileSync('lib/unified-research-index.ts','utf8');assert.doesNotMatch(index,/internationalResearch\.map/);
 const page=fs.readFileSync('app/research/page.tsx','utf8');assert.match(page,/San Francisco Bay Area/);assert.doesNotMatch(page,/globalUsdPer10Qaly/);
 const archive=fs.readFileSync('lib/expanded-geography-research.ts','utf8');assert.match(archive,/internationalResearch/);assert.match(archive,/globalUsdPer10Qaly/);
 const legacy=fs.readFileSync('app/archive/international-research/page.tsx','utf8');assert.match(legacy,/export \{default,metadata\} from '\.\.\/expanded-geography-research\/page'/);
});
test('AMF arithmetic rejects nonfinite and invalid horizons',()=>{
 const s=data.scenarios[0];assert.throws(()=>amfModel({...s,price:NaN}),RangeError);assert.throws(()=>amfModel({...s,horizon:Infinity}),RangeError);
});
