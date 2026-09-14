import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {expenseAverage,reportPrice} from '../lib/geography-reports.mjs';
const data=JSON.parse(readFileSync(new URL('../data/geography-reports.json',import.meta.url)));
const get=slug=>data.reports.find(r=>r.edition==='los-angeles'&&r.slug===slug);
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-9*Math.max(1,Math.abs(b)),`${a} != ${b}`);
const verify=(r,values)=>{for(const [id,all,g=1] of values){const s=r.model.scenarios.find(s=>s.id===id);close(s.allPopulationQalys,all);close(s.editionQalys,all*g);}};
test('Lestonnac finite clinical scenarios and original gross costs reproduce',()=>{
 const r=get('lestonnac-free-clinic'),q=(e,b,u)=>10000*e*b*u/1.03;
 verify(r,[['central',q(.35,.35,.02),.7],['poor',q(.1,.1,.005),.4],['favorable',q(.6,.7,.05),.9],['zero',0],['harm',q(.35,.35,-.005),.7]]);
 close(expenseAverage(r),4108413);close(reportPrice(r),10*4695553/(q(.35,.35,.02)*.7));
 assert.equal(r.model.scenarios.find(s=>s.id==='poor').costUSD,4695553*1.25);
});
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
test('Climate Resolve finite disjoint heat branches and attribution cost reproduce',()=>{
 const r=get('climate-resolve'),A=n=>Array.from({length:n},(_,i)=>1/1.03**(i+1)).reduce((a,b)=>a+b,0);
 const q=(f,p,a,b,H,u,z,Hr,ur)=>97124*f*2.5*p*a*b*H*u/365*A(3)+40*z*3*Hr*ur/365*A(5);
 const c=q(.25,.1,.1,.5,20,.05,.5,20,.02);
 verify(r,[['central',c],['conservative',q(.1,.02,.03,.2,10,.01,.1,10,.005)],['favorable',q(.4,.25,.25,.8,40,.1,.8,40,.05)],['all-resource-sensitivity',c],['zero',0]]);
 close(r.model.scenarios.find(s=>s.id==='all-resource-sensitivity').costUSD,3745093+1000*97124*.25*.1*.1*.5);
 assert.match(r.sections.cost,/donor-attributable cooling unit/);assert.ok(r.priceScope);
});
test('CCA threshold survival integral is not a forecast or manufactured central',()=>{
 const r=get('coalition-for-clean-air'),h0=.05,h1=h0*Math.exp(-Math.log(1.06)/10),rho=Math.log(1.03);
 const q=.75*((1-Math.exp(-(h1+rho)*10))/(h1+rho)-(1-Math.exp(-(h0+rho)*10))/(h0+rho));
 close(q,.006532944220465575);
 verify(r,[['zero',0],['threshold-million',2494912/100000],['threshold-hundred-thousand',2494912/10000]]);
 close(expenseAverage(r),2035946.6666666667);assert.equal(reportPrice(r),null);
});
