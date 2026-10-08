import assert from 'node:assert/strict';
export const inputs={C:13035827,Y:3,N:1900000,r:.5,u:.5,q:.02,p:.1,a:.1,b:.25,start:2,T:2,discount:.03,g:1,h:0};
export function calculate(o={}){const x={...inputs,...o};let A=0;for(let t=x.start;t<x.start+x.T;t++)A+=1/(1+x.discount)**t;const V=x.N*x.r*x.u*A,H=V*x.q,all=x.b*(x.p*x.a*H-x.h),health=all*x.g,costUSD=x.C*x.Y;return{x,A,V,H,allPopulationQalys:all,editionQalys:health,costUSD,income:null,combinedPrice:null,healthOnlyPrice:health>0?10*costUSD/health:null};}
export const scenarios=[['central',{}],['no-health-change',{q:0}],['no-capacity-change',{b:0}],['adverse',{p:0,h:50}]];
// Illustrative transfer only: this is not a current measured national cash gain.
export function financialDiagnostic(o={}){const z=calculate(o),x=z.x,people=x.N*x.r*x.u*x.p*x.a*x.b*x.g,before=9214,familySize=2.9,annualCash=569/familySize,positiveOverlap=.5,income=.5*people*z.A*Math.log1p(annualCash*positiveOverlap/before);return{...z,people,before,familySize,annualCash,positiveOverlap,income,combinedPrice:z.editionQalys+income>0?10*z.costUSD/(z.editionQalys+income):null};}
export function tests(){assert(Math.abs(calculate().editionQalys-44.12126725156421)<1e-10);assert.equal(calculate().income,null);assert.equal(calculate({q:0}).editionQalys,0);assert.equal(calculate({b:0}).editionQalys,0);assert.equal(calculate({p:0,h:50}).editionQalys,-12.5);}
