import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import archive from '../data/san-francisco/ymca-legacy-pre-recalibration-model.json' with {type:'json'};
import {ymcaPortfolioModel} from '../lib/ymca-portfolio-model.mjs';
test('All seven original YMCA portfolio worlds stay reproducible',()=>{
 assert.equal(archive.evaluated.length,7);
 for(const scenario of archive.evaluated)assert.deepEqual(ymcaPortfolioModel(scenario.inputs),scenario.output);
});
test('Seven original YMCA portfolio and earlier-DPP source hashes stay preserved',()=>{
 const overrides={'app/charities/ymca-greater-sf/page.tsx':'docs/geography-discovery/ymca-legacy-original-page-2026-10-04.tsx.txt','app/api/ymca-portfolio-model/route.ts':'docs/geography-discovery/ymca-legacy-original-api-2026-10-04.ts.txt'};
 for(const entry of archive.sources){const actual=crypto.createHash('sha256').update(fs.readFileSync(new URL('../'+(overrides[entry.path]??entry.path),import.meta.url))).digest('hex');assert.equal(actual,entry.sha256,entry.path);}
});
