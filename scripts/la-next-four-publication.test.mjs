import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const data=JSON.parse(readFileSync(new URL('../data/geography-reports.json',import.meta.url)));
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-9*Math.max(1,Math.abs(b)),a+' != '+b);
const annuity=T=>Array.from({length:T},(_,i)=>1.03**(-i-1)).reduce((a,b)=>a+b,0);
for(const slug of ['garment-worker-center','housing-rights-center','downtown-women-s-center','radiant-health-centers'])test(slug+' finite component scenarios reproduce',()=>{
 const r=data.reports.find(r=>r.edition==='los-angeles'&&r.slug===slug);
 assert.equal(r.stage,'alpha');assert.match(r.priceScope,/partial-health/);
 for(const s of r.model.scenarios.filter(s=>['central','low','high'].includes(s.id))){
  const p=Object.fromEntries(s.assumptions.split(';').map(x=>x.trim().split('=')).filter(x=>x.length===2&&Number.isFinite(parseFloat(x[1]))).map(([k,v])=>[k,parseFloat(v)]));
  let q;
  if(slug==='garment-worker-center')q=878000*p.a*p.b/p.k*p.q/1.03;
  else if(slug==='housing-rights-center')q=233*(2929777/1999328)*p.z*p.e*p.a*p.b*p.q*annuity(p.T);
  else if(slug==='downtown-women-s-center')q=p.N*p.f*p.a*p.b*p.q/1.03;
  else{
   const art=1872*p.s*p.h*p.f*p.a*p.b*.02*p['ART transfer']*p['Q/event']/1.03;
   const prep=1872*p.s*p.p*p.f*p.a*p.b*p.incidence*.86*p.v*annuity(p.T)/1.03;
   const mental=322*p.s*p['mental eligibility']*p['mental transfer']*p.b*.057/1.03;
   q=(art+prep+mental)*p.z;
  }
  close(q,s.allPopulationQalys);close(q*p.g,s.editionQalys);
 }
 assert.ok(r.model.scenarios.some(s=>s.editionQalys===0));
 assert.ok(r.model.scenarios.some(s=>s.editionQalys<0));
 assert.ok(r.sessionIds.every(id=>data.sessions.some(s=>s.id===id)));
});
