import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const saved=JSON.parse(fs.readFileSync('docs/geography-discovery/exploratory-coverage-topology-2026-10-04.json','utf8'));
test('21 frozen exploratory boundaries bind to original funnel entities and existing consumers',()=>{
 const current=JSON.parse(execFileSync(process.execPath,['scripts/exploratory-coverage-topology.mjs'],{encoding:'utf8'}));
 assert.equal(saved.boundaries.length,21);
 assert.equal(new Set(saved.boundaries.map(b=>b.ein)).size,21);
 // Hashes are capture-time evidence, not a prohibition on future recalibration.
 const identity=row=>({organization:row.organization,ein:row.ein,route:row.route});
 assert.deepEqual(current.boundaries.map(identity),saved.boundaries.map(identity));
 for(const row of saved.boundaries){
  assert.equal(row.accepted,false);
  assert.equal(row.historicalCostEffectivenessStatus,'exploratory-model');
  assert.equal(row.historicalReportStatus,'initial-review-complete');
  for(const source of [{path:row.reportFile,sha256:row.reportSha256},...row.imports,...row.apiConsumers]){
   assert.match(source.sha256,/^[a-f0-9]{64}$/);
   assert.ok(fs.existsSync(source.path),source.path);
  }
 }
});
