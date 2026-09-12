import test from 'node:test';
import assert from 'node:assert/strict';
import data from '../data/research-expenses.json' with {type:'json'};
import {expenseSummary} from '../lib/research-expenses.mjs';
test('expense averages use three actual consecutive years; never impute missing data',()=>{
 assert.equal(expenseSummary().average,null);
 assert.equal(expenseSummary({years:[{year:2024,expenses:100}]}).average,null);
 assert.equal(expenseSummary({years:[{year:2024,expenses:100},{year:2023,expenses:200},{year:2021,expenses:300}]}).average,null);
 assert.equal(expenseSummary(data.organizations.recares).average,88845);
 assert.equal(expenseSummary(data.organizations['project-homeless-connect']).average,null);
 assert.equal(expenseSummary(data.organizations['hope-pacifica']).average,null);
 assert.equal(expenseSummary(data.organizations['homeless-youth-alliance']).average,null);
});
test('expense records preserve identity, accounting basis, fiscal year and source',()=>{
 for(const [slug,row] of Object.entries(data.organizations)){
  assert.ok(row.entity&&row.basis,slug);
  assert.equal(new Set(row.years.map(y=>y.year)).size,row.years.length,slug);
  for(const year of row.years){
   assert.ok(Number.isInteger(year.year)&&year.year>=2000&&year.year<=2026,slug);
   assert.ok(year.expenses===null||(Number.isFinite(year.expenses)&&year.expenses>=0),slug);
   assert.ok(year.source.startsWith('https://'),slug);
  }
 }
});
