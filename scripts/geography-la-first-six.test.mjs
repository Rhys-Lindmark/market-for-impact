import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {expenseAverage,reportPrice} from '../lib/geography-reports.mjs';
const data=JSON.parse(readFileSync(new URL('../data/geography-reports.json',import.meta.url)));
const get=slug=>data.reports.find(r=>r.edition==='los-angeles'&&r.slug===slug);
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-9*Math.max(1,Math.abs(b)),`${a} != ${b}`);
const verify=(r,values)=>{for(const [id,all,g=1] of values){const s=r.model.scenarios.find(s=>s.id===id);close(s.allPopulationQalys,all);close(s.editionQalys,all*g);}};
// Lestonnac and Climate Resolve reproduction tests deleted: both were rebuilt (Lestonnac recalibrated; Climate Resolve
// deep review accepted 2026-10-05). Covered by lestonnac-la-historical / lestonnac-la-calibrated and la-climate-accepted.
test('SAFE finite survival, injury discount, and public resource sensitivity reproduce',()=>{
 const r=get('streets-are-for-everyone');
 const q=(t,p,a,b,z,s,u,T,qi)=>{const L=u*(1-Math.exp(-(.01+Math.log(1.03))*T))/(.01+Math.log(1.03));const K=125*t*p*a*b;return (K*.19*z*s*L+K*.33*z*s*qi)/1.03;};
 const c=q(.25,.2,.2,.25,.1,.8,.85,30,1);
 verify(r,[['central',c,.9],['poor',q(1/12,.05,.05,.1,.02,.5,.7,15,.1),.7],['favorable',q(.5,.5,.4,.5,.5,1,.9,40,3),.98],['zero',0],['downside',-c,.9],['public-cost',c,.9]]);
 close(r.model.scenarios.find(s=>s.id==='public-cost').costUSD,449963+.3125*7950000/125);
 close(expenseAverage(r),332876);assert.ok(r.priceScope);
});
test('Breathe central and broad alternatives retain finite health and original expense mean',()=>{
 const r=get('breathe-southern-california'),q=(N,b,u,ret,w)=>N*b*2.1/14*u*ret*w/1.03;
 verify(r,[['central',q(100,.25,.1,.5,.75),.5],['high',q(300,.75,.2,1,1),.9],['low',q(30,.05,.03,.2,.5),.2],['zero',0]]);
 assert.ok(reportPrice(r)>0);close(expenseAverage(r),2435019.3333333335);assert.equal(r.annualExpenses.find(y=>y.year===2023).comparable,true);
});
test('NLSLA legal benchmark and one-year health bridges reproduce',()=>{
 const r=get('neighborhood-legal-services-los-angeles-county');
 const q=(b,k,rH,pH,uH,pM,uM,pP,uP)=>b*k*(2483*.28*rH*pH*uH+1893*pM*uM+1162*pP*uP)/1.03;
 verify(r,[['central',q(.25,.8,.5,.25,.02,.2,.02,.15,.01)],['conservative',q(.1,.6,.25,.1,.01,.05,.005,.05,.002)],['favorable',q(.75,1,1,.5,.05,.5,.05,.4,.03)],['zero',0]]);
 close(expenseAverage(r),37077374.666666664);assert.ok(r.priceScope);
});
test('CCA threshold survival integral is not a forecast or manufactured central',()=>{
 const r=get('coalition-for-clean-air'),h0=.05,h1=h0*Math.exp(-Math.log(1.06)/10),rho=Math.log(1.03);
 const q=.75*((1-Math.exp(-(h1+rho)*10))/(h1+rho)-(1-Math.exp(-(h0+rho)*10))/(h0+rho));
 close(q,.006532944220465575);
 close(r.model.scenarios.find(s=>s.id==='zero').editionQalys,0);
 close(r.model.scenarios.find(s=>s.id==='central').editionQalys,.009968713757273838);
 // The central is unchanged by the beta rebuild (la-cca-accepted.test.mjs), but allPopulationQalys now equals the LA share.
 close(expenseAverage(r),(1472176+2162329+2494912)/3);assert.ok(reportPrice(r)>0);
});
