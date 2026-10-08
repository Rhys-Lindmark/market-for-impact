import assert from 'node:assert/strict';
export const inputs={G:10000,c:107.15848764044944,b:.1,d:.001,T:3,q:.01,h:.00001,g:.99};
export function calculate(o={}){const x={...inputs,...o};let D=0;for(let t=1;t<=x.T;t++)D+=1/(1.03)**t;const N=x.G/x.c*x.b,all=N*(x.d*D*x.q-x.h),health=all*x.g;return{x,D,N,allPopulationQalys:all,editionQalys:health,costUSD:x.G,income:null,combinedPrice:null,healthOnlyPrice:health>0?10*x.G/health:null};}
export function tests(){assert(Math.abs(calculate().editionQalys-.00016893904358000525)<1e-15);assert.equal(calculate().income,null);assert.equal(calculate({b:0}).editionQalys,0);assert(calculate({d:0}).editionQalys<0);}
