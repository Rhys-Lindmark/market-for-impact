import assert from 'node:assert/strict';
import test from 'node:test';
import { grantPath, isGrantSourceKey, organizationPath, parseStringArray } from '../db/detail-contract.ts';

test('detail routes accept only supported source ledgers', () => {
  assert.equal(isGrantSourceKey('coefficient'), true);
  assert.equal(isGrantSourceKey('coefficient-egc'), true);
  assert.equal(isGrantSourceKey('givewell'), true);
  assert.equal(isGrantSourceKey('renphil'), true);
  assert.equal(isGrantSourceKey('giving-green'), true);
  assert.equal(isGrantSourceKey('unknown'), false);
});

test('detail paths encode source identifiers and organization slugs', () => {
  assert.equal(grantPath('givewell', 'record/with spaces'), '/grants/givewell/record%2Fwith%20spaces');
  assert.equal(organizationPath('against-malaria-foundation'), '/organizations/against-malaria-foundation');
});

test('detail array parsing preserves strings and fails closed', () => {
  assert.deepEqual(parseStringArray('["one",2,"two"]'), ['one', 'two']);
  assert.deepEqual(parseStringArray('{"one":1}'), []);
  assert.deepEqual(parseStringArray('not-json'), []);
});
