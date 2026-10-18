import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {reportPrice,expenseAverage} from '../lib/geography-reports.mjs';
const data=JSON.parse(readFileSync(new URL('../data/geography-reports.json',import.meta.url)));
const get=slug=>data.reports.find(r=>r.edition==='los-angeles'&&r.slug===slug);
const close=(a,b)=>assert.ok(Number.isFinite(a)&&Math.abs(a-b)<1e-9*Math.max(1,Math.abs(b)),a+' != '+b);
const params=(s,defaults={})=>Object.assign({},defaults,...[...s.assumptions.matchAll(/\b([A-Za-z]+)\s*=\s*(-?(?:\d+(?:\.\d*)?|\.\d+))/g)].map(m=>({[m[1]]:Number(m[2])})));
test('environmental and legal frontiers are requirements, not forecasts',()=>{
 for(const slug of ['communities-for-a-better-environment','east-yard-communities-for-environmental-justice']){
  const r=get(slug);assert.ok(reportPrice(r)>0);
  for(const s of r.model.scenarios.filter(s=>s.id.includes('threshold'))){
   close(s.editionQalys,10*s.costUSD/(s.id.includes('100k')?100000:1000000));
  }
  assert.equal(r.model.scenarios.find(s=>s.id==='zero').editionQalys,0);
  assert.ok(r.model.scenarios.some(s=>s.editionQalys<0));
 }
});
// Deleted reproduction tests (reports were rebuilt/accepted as beta; each is covered by its successor):
//   VACF -> la-vacf-accepted, MMHN -> la-mmhn-accepted, UPI -> upi-la-historical / upi-la-calibrated,
//   Human Options -> la-human-options-accepted, Public Law Center -> la-public-law-center-accepted.
test('ICLC does not multiply family size or repeat lifetime benefit',()=>{
 const r=get('inner-city-law-center');
 // The 2026-10-07 JSON-parameter scenarios (central{...}, income-unknown...) are the rebuilt model; only the original k=v ones reproduce here.
 for(const s of r.model.scenarios.filter(s=>!s.assumptions.startsWith('{')&&!/income-unknown/.test(s.id))){
  const p=params(s,{d:.8,a:.25,b:.5,q:.03,g:.98});
  const q=s.id==='zero'?0:875*p.d*p.a*p.b*p.q/1.03;
  close(s.allPopulationQalys,q);close(s.editionQalys,p.g*q);
 }
 close(expenseAverage(r),(17090749+18745042+20403467)/3);
 close(r.model.scenarios.find(s=>s.id==='initial-central-diagnostic').costUSD,20326674+76793+12354422);
});
test('all eight retain actual author intervals and explicit component scope',()=>{
 const slugs=['communities-for-a-better-environment','east-yard-communities-for-environmental-justice','vietnamese-american-cancer-foundation','maternal-mental-health-now','urban-peace-institute','public-law-center','inner-city-law-center','human-options'];
 for(const slug of slugs){
  const r=get(slug);assert.ok(['alpha','beta'].includes(r.stage));assert.equal(r.acceptance.status,'accepted');
  assert.equal(r.summary.what.length,3);
  for(const id of r.sessionIds){const s=data.sessions.find(x=>x.id===id);assert.ok(Date.parse(s.endedAt)>Date.parse(s.startedAt));assert.doesNotMatch(s.evidence,/\/tmp\//);}
  if(reportPrice(r)>0)assert.match(r.priceScope,/partial|component|conditional|unknown/i);
 }
});
