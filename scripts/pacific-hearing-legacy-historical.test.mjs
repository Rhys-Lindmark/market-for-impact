import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const p=JSON.parse(fs.readFileSync(new URL('../data/bay/pacific-hearing-legacy-pre-recalibration-model.json',import.meta.url)));
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-10*Math.max(1,Math.abs(b)),`${a} vs ${b}`);
const price=(cost,q)=>q>0?10*cost/q:null;
function independent(result){
 const rows=result.rows.map(s=>{
  const offered=result.gift/result.expense*s.courses,additional=offered*s.funding;
  const gross=additional*s.utility*s.transfer*s.completion*s.years,harm=additional*s.harm,all=gross-harm,bay=all*s.bay;
  return {...s,courseEquivalent:offered,additionalCourses:additional,grossQ:gross,harmQ:harm,allQ:all,bayQ:bay,bayCostPer10:price(result.gift,bay),allCostPer10:price(result.gift,all)};
 });
 let all=0,bay=0;for(const r of rows){all+=r.weight*r.allQ;bay+=r.weight*r.bayQ;}
 return {rows,all,bay,price:price(result.gift,bay)};
}
test('Pacific Hearing full six-world history and all13 diagnostics reproduce independently',()=>{
 assert.equal(p.scenarios.length,6);assert.equal(Object.keys(p.diagnostics.cases).length,13);
 for(const result of [p.evaluated,...Object.values(p.diagnostics.cases)]){
  const r=independent(result);assert.equal(r.rows.length,6);
  for(let i=0;i<6;i++)for(const k of ['courseEquivalent','additionalCourses','grossQ','harmQ','allQ','bayQ','bayCostPer10','allCostPer10']){
   if(r.rows[i][k]===null)assert.equal(result.rows[i][k],null);else close(r.rows[i][k],result.rows[i][k]);
  }
  close(r.all,result.allQ);close(r.bay,result.bayQ);if(r.price===null)assert.equal(result.bayCostPer10,null);else close(r.price,result.bayCostPer10);
 }
 close(p.evaluated.bayCostPer10,937720.9335493005);close(p.evaluated.rows.find(x=>x.id==='central').bayCostPer10,2199017.543859649);
 const f=p.evaluated.rows.find(x=>x.id==='favorable');close(p.evaluated.favorableShareOfSignedQ,f.weight*f.bayQ/p.evaluated.bayQ);assert.ok(p.evaluated.favorableShareOfSignedQ>.91);
 assert.equal(p.evaluated.verifiedMarginalCostPer10,null);assert.equal(p.evaluated.completeResourceCostPer10,null);
});
test('Historical financial identities retain whole accrual cost and inventory adjustment',()=>{
 assert.equal(p.anchors.expense,184099);assert.equal(p.anchors.inventoryAdjustment,45900);
 for(const y of p.finances){assert.equal(y.revenue,y.contributions+y.fees);assert.equal(y.expense,y.grants+y.salariesBenefits+y.contractors+y.occupancy+y.printing+y.other);assert.equal(y.assets-y.liabilities,y.netAssets);}
 const c=p.evaluated,n=p.diagnostics.cases.noInventoryAdjustment;
 assert.notEqual(n.expense,c.expense);assert.equal(c.expense-n.expense,45900);
 assert.equal(n.verifiedMarginalCostPer10,null);assert.equal(p.diagnostics.verifiedCurrentBudget,null);
});
