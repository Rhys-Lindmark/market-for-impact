import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const snapshot = JSON.parse(await readFile(new URL('../data/givedirectly/benchmark.json', import.meta.url)));

test('GiveDirectly benchmark snapshot preserves three incompatible comparison objects', () => {
  assert.equal(snapshot.benchmarks.length, 3);
  assert.deepEqual(snapshot.benchmarks.map((item) => item.benchmarkType), ['welfare-anchor', 'program-estimate', 'funding-bar']);
  const program = snapshot.benchmarks.find((item) => item.benchmarkType === 'program-estimate');
  assert.deepEqual([program.estimateLow, program.estimateHigh], [3, 4]);
  assert.match(program.limitations.join(' '), /pass-through/i);
  assert.match(program.limitations.join(' '), /local-economy multiplier/i);
  assert.match(program.limitations.join(' '), /pilot/i);
});

test('every benchmark is versioned, sourced, and explicit about assumptions and limits', () => {
  const sourceUrls = new Set(snapshot.sources.map((source) => source.url));
  for (const benchmark of snapshot.benchmarks) {
    assert.ok(sourceUrls.has(benchmark.sourceUrl));
    assert.ok(benchmark.effectiveAt && benchmark.modelVersion && benchmark.currencyBasis && benchmark.populationBasis);
    assert.ok(benchmark.assumptions.length > 0 && benchmark.limitations.length > 0);
  }
});
