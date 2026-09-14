import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {reportPrice,expenseAverage} from '../lib/geography-reports.mjs';
const data=JSON.parse(readFileSync(new URL('../data/geography-reports.json',import.meta.url)));
const get=slug=>data.reports.find(r=>r.edition==='los-angeles'&&r.slug===slug);
const close=(a,b)=>assert.ok(Number.isFinite(a)&&Math.abs(a-b)<1e-9*Math.max(1,Math.abs(b)),a+' != '+b);
const params=(s,defaults={})=>Object.assign({},defaults,...[...s.assumptions.matchAll(/\b([A-Za-z]+)\s*=\s*(-?(?:\d+(?:\.\d*)?|\.\d+))/g)].map(m=>({[m[1]]:Number(m[2])})));
test('environmental and legal frontiers are requirements, not forecasts',()=>{
 for(const slug of ['communities-for-a-better-environment','east-yard-communities-for-environmental-justice','public-law-center']){
  const r=get(slug);assert.ok(reportPrice(r)>0);
  for(const s of r.model.scenarios.filter(s=>s.id.includes('threshold'))){
   close(s.editionQalys,10*s.costUSD/(s.id.includes('100k')?100000:1000000));
  }
  assert.equal(r.model.scenarios.find(s=>s.id==='zero').editionQalys,0);
  assert.ok(r.model.scenarios.some(s=>s.editionQalys<0));
 }
 const plc=get('public-law-center');
 close(plc.model.scenarios.find(s=>s.id==='central').editionQalys,3800*.25*.25*.25*.03*(1/1.03+1/1.03**2)*.9);
 assert.match(plc.model.costScope,/donated/);
 close(expenseAverage(plc),(13652011+19002911+21372374)/3);
});
test('VACF screening reference includes prevalence and cascade, applied once',()=>{
 const r=get('vietnamese-american-cancer-foundation');
 for(const s of r.model.scenarios){
  const p=params(s),q=2499*p.s*p.d*p.a*p.b*p.t*.081;
  close(s.allPopulationQalys,q);close(s.editionQalys,q*p.g);close(s.costUSD,2205208);
 }
 close(expenseAverage(r),(1038000+1349832+2205208)/3);
});
test('MMHN training and finite peer effects are deduplicated before discounting',()=>{
 const r=get('maternal-mental-health-now');
 for(const s of r.model.scenarios){
  const p=JSON.parse(s.assumptions.slice(0,s.assumptions.indexOf('}')+1));
  const training=800*p.d*p.L*p.r*p.a*p.b*p.q;
  const peer=150*.11*p.rP*p.aP*p.b*p.u*p.w/52;
  close(s.allPopulationQalys,p.k*(training+peer)/1.03);
  close(s.editionQalys,p.k*(p.g*training+peer)/1.03);close(s.costUSD,p.C);
 }
 assert.equal(expenseAverage(r),null);
});
test('UPI injury risk, finite health, coalition and funding attribution',()=>{
 const r=get('urban-peace-institute');
 for(const s of r.model.scenarios){
  const p=params(s,{N:1027,r:.04,e:.1,f:.2,qd:20,qn:.5,a:.75,b:.5,g:1,H:0});
  const q=p.N*p.r*p.e*(p.f*p.qd+(1-p.f)*p.qn)*p.a*p.b;
  close(s.allPopulationQalys,q-p.H);close(s.editionQalys,q*p.g-p.H);
 }
 close(expenseAverage(r),(3185128+5293277+8897684)/3);
 assert.match(r.sections.cost,/nonoperating|operating-expense/);
});
test('ICLC does not multiply family size or repeat lifetime benefit',()=>{
 const r=get('inner-city-law-center');
 for(const s of r.model.scenarios){
  const p=params(s,{d:.8,a:.25,b:.5,q:.03,g:.98});
  const q=s.id==='zero'?0:875*p.d*p.a*p.b*p.q/1.03;
  close(s.allPopulationQalys,q);close(s.editionQalys,p.g*q);
 }
 close(expenseAverage(r),(17090749+18745042+20403467)/3);
 close(r.model.scenarios.find(s=>s.id==='central').costUSD,20326674+76793+12354422);
});
test('Human Options finite counseling/safety branches and three original years',()=>{
 const r=get('human-options');
 for(const s of r.model.scenarios){
  if(s.id==='downside'){assert.equal(s.editionQalys,null);continue;}
  const p=params(s,{dp:.5,rp:.5,b:.5,up:.15,Tp:.5,ds:.5,rs:.5,us:.1,Ts:.5,k:.8,g:.95});
  const q=s.id==='zero'?0:p.k*(1200*p.dp*p.rp*p.b*.17*p.up*p.Tp/1.03+498*p.ds*p.rs*p.b*.13*p.us*p.Ts/1.03**2);
  close(s.allPopulationQalys,q);close(s.editionQalys,p.g*q);close(s.costUSD,7312028+283191);
 }
 close(expenseAverage(r),(6857303+237693+7818547+256966+7312028+283191)/3);
 assert.match(r.sections.qualitative,/64%/);
});
test('all eight retain actual author intervals and explicit component scope',()=>{
 const slugs=['communities-for-a-better-environment','east-yard-communities-for-environmental-justice','vietnamese-american-cancer-foundation','maternal-mental-health-now','urban-peace-institute','public-law-center','inner-city-law-center','human-options'];
 for(const slug of slugs){
  const r=get(slug);assert.equal(r.stage,'alpha');assert.equal(r.acceptance.status,'accepted');
  assert.equal(r.summary.what.length,3);
  for(const id of r.sessionIds){const s=data.sessions.find(x=>x.id===id);assert.ok(Date.parse(s.endedAt)>Date.parse(s.startedAt));assert.doesNotMatch(s.evidence,/\/tmp\//);}
  if(reportPrice(r)>0)assert.match(r.priceScope,/partial-health/);
 }
});
