import assert from 'node:assert/strict';
import {isDeepStrictEqual} from 'node:util';

// Strict deep equality for large JSON trees (whole report/session registries).
// assert.deepEqual builds a full diff on failure, which on the 22 MB geography
// data grew test processes to 14–35 GB and exhausted the Mac on 2026-10-18.
// This uses the same comparison but reports only where the first difference is.
const label=v=>v&&typeof v==='object'?String(v.id??v.slug??v.organizationId??v.organization??'object'):JSON.stringify(v)?.slice(0,80);

export function sameData(actual,expected,message='data'){
 if(isDeepStrictEqual(actual,expected))return;
 if(Array.isArray(actual)&&Array.isArray(expected)){
  if(actual.length!==expected.length)assert.fail(`${message}: length ${actual.length} !== ${expected.length}`);
  const i=actual.findIndex((x,j)=>!isDeepStrictEqual(x,expected[j]));
  assert.fail(`${message}: first difference at index ${i} (${label(actual[i])} vs ${label(expected[i])})`);
 }
 if(actual&&expected&&typeof actual==='object'&&typeof expected==='object'){
  const keys=[...new Set([...Object.keys(actual),...Object.keys(expected)])].filter(k=>!isDeepStrictEqual(actual[k],expected[k]));
  assert.fail(`${message}: differs at keys ${keys.slice(0,10).join(', ')}${keys.length>10?` (+${keys.length-10} more)`:''}`);
 }
 assert.fail(`${message}: ${label(actual)} !== ${label(expected)}`);
}
