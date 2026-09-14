import fs from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
const data=JSON.parse(fs.readFileSync(new URL('../data/geography-reports.json',import.meta.url)));
test('NYC13–15 reproduce all25 finite multi-pathway scenarios',()=>{
 const slugs=["northern-manhattan-perinatal-partnership","common-justice","newark-community-street-team"];
 let n=0;
 for(const [i,slug] of slugs.entries())for(const s of data.reports.find(r=>r.edition==='new-york-city'&&r.slug===slug).model.scenarios){
 const x=JSON.parse(s.assumptions),F=(r,t)=>-Math.expm1(-(r+Math.log1p(x.d))*t)/(r+Math.log1p(x.d));let q;
 if(i===0)q=x.a*x.b*(x.B*(x.ri*x.ui*F(x.rhoi,x.ti)+x.rd*x.ud*F(x.md,x.td))+x.S*x.o*x.pm*x.um*F(x.rhom,x.tm)+x.K*x.uk*F(0,x.tk))-x.h;
 if(i===1)q=x.D/x.c*x.a*x.b*(x.v*((1-x.z)*x.ui*F(x.ri,x.Ti)+x.z*x.ud*F(x.md,x.Td))+x.ps*x.us*F(x.rs,x.Ts)+x.up*F(0,x.Tp)-x.h);
 if(i===2){const V=x.oV*(x.M*x.fM*x.pM+x.H*x.fH*x.l*(x.r0-x.OR*x.r0/(1-x.r0+x.OR*x.r0)));q=x.a*x.b*(V*((1-x.z)*x.ui*F(x.ri,x.Ti)+x.z*x.ud*F(x.md,x.Td))+x.T*x.fT*x.pT*x.uT*F(x.rT,x.TT)+x.R*x.oR*x.tR*x.deltaR*x.uR*F(x.mR,x.TR)-x.h);}
 const local=q*x.g;
 assert.ok(Math.abs(local-s.editionQalys)<1e-8*Math.max(1,Math.abs(local)),slug+':'+s.id);
 assert.equal(s.costUSD,x.C);
 assert.ok(local>0?Math.abs(10*x.C/local-s.pricePer10Qalys)<1e-6*Math.max(1,s.pricePer10Qalys):s.pricePer10Qalys===null);
 n++;
 }
 assert.equal(n,25);
});
