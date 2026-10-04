import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {calculate,calculatePublishedLifetimeBestGuess,mortalityHorizonSensitivityInputs} from '../lib/nfp-portfolio-model.mjs';
import {calculate as nfp} from '../lib/nfp-model.mjs';
const saved=JSON.parse(fs.readFileSync('data/us/changent-legacy-pre-recalibration-model.json'));
test('Changent complete original NFP/followup/lifetime models stay preserved',()=>{
 assert.deepEqual(nfp(),saved.nfpOnly);
 assert.deepEqual(calculate(),saved.portfolioFollowup);
 assert.deepEqual(calculatePublishedLifetimeBestGuess(),saved.portfolioPublishedLifetime);
 for(const s of saved.lifetimeSensitivity)assert.deepEqual(calculatePublishedLifetimeBestGuess(undefined,undefined,{...mortalityHorizonSensitivityInputs,postAge20PersistencePrior:s.postAge20PersistencePrior}),s.evaluated);
 for(const [path,hash] of Object.entries(saved.sourceHashes))assert.equal(createHash('sha256').update(fs.readFileSync(path)).digest('hex'),hash,path);
});
