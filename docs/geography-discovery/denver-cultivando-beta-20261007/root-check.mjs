import assert from 'node:assert/strict';import {defaults,cases,calculate} from './model.mjs';
let checks=0;const near=(a,b)=>{assert(Number.isFinite(a)&&Number.isFinite(b));assert(Math.abs(a-b)<=1e-10*Math.max(1,Math.abs(a),Math.abs(b)),a+' vs '+b);checks++;};
function independent(o){const p={...defaults,...o},gate=p.implementation*p.attribution,h=p.N*p.householdShare,z=h*gate,a=Math.min(p.engaged*p.advocateOverlap,h)*gate,w=p.displacedPeople*gate,wb=Math.min(w*p.workerOverlap,z),shared=Math.min(a,wb)*p.workerAdvocateOverlap;
let duration=0;for(let i=0;i<p.T;i++)duration+=Math.min(1,p.T-i)/(1+p.r)**(p.delay+i);
const health=p.g*(p.N*gate*p.q*duration-p.engaged*p.harm),positive=x=>x>0?x*p.overlap:x;
const groups=[[shared,1,1,1],[a-shared,1,1,0],[wb-shared,1,0,1],[z-a-wb+shared,1,0,0],[p.engaged-a,0,1,0],[w-wb,0,0,1]];
const breaks=[0,1,p.delay,p.delay+1,p.delay+p.T];for(let y=1;y<p.T;y++)breaks.push(p.delay+y);const times=[...new Set(breaks)].sort((a,b)=>a-b);let income=0;
for(let i=0;i<times.length-1;i++){const lo=times[i],hi=times[i+1],at=(lo+hi)/2;for(const[n,benefit,advocate,worker]of groups){let gain=0;if(benefit&&at>=p.delay&&at<p.delay+p.T)gain+=positive(p.resourceGain);if(advocate&&at<1)gain-=p.cost;if(worker&&at>=p.delay&&at<p.delay+1)gain+=positive(p.displacedGain);if(n>0&&gain)income+=.5*n*p.g*(hi-lo)*Math.log1p(gain/p.baseline)/(1+p.r)**lo;}}
if(gate&&p.externalCost)income+=.5*p.payerPeople*Math.log1p(-p.g*gate*p.externalCost/p.payerPeople/p.payerBaseline)/(1+p.r)**p.delay;
return{health,income,total:health+income,price:health+income>0?10*p.C/(health+income):null};}
for(const[id,o]of cases){const got=calculate(o),x=independent(o);near(got.incomeEquivalent,x.income);if(!o.clinicalUnknown)near(got.editionQalys,x.health);if(!o.clinicalUnknown&&!o.incomeUnknown){near(got.totalEquivalent,x.total);if(!o.costUnknown){if(x.price===null){assert.equal(got.price10,null);checks++;}else near(got.price10,x.price);}}}
const base=calculate();near(base.editionQalys,3.7044032321435134);near(base.incomeEquivalent,.4866243310580494);near(base.price10,3599241.4205161664);assert.equal(defaults.C,1508452);checks++;
near(calculate({implementation:0}).incomeEquivalent,.5*defaults.engaged*Math.log1p(-defaults.cost/defaults.baseline));
assert(calculate({implementation:0}).editionQalys<0);checks++;assert.equal(calculate({implementation:0,cost:0,harm:0}).totalEquivalent,0);checks++;
near(calculate({resourceGain:-100,displacedGain:-1000,overlap:0}).incomeEquivalent,calculate({resourceGain:-100,displacedGain:-1000,overlap:1}).incomeEquivalent);
assert(calculate({delay:0,T:.5,cost:100,workerOverlap:1,workerAdvocateOverlap:1}).incomeEquivalent<calculate({delay:0,T:.5,cost:0,workerOverlap:1,workerAdvocateOverlap:1}).incomeEquivalent);checks++;
assert(calculate({externalCost:200000}).incomeEquivalent<base.incomeEquivalent);checks++;assert(calculate({q:0,harm:0,cost:0,externalCost:0,displacedPeople:0}).price10>0);checks++;
console.log(JSON.stringify({passed:checks,scenarios:cases.length,central:base.price10,health:base.editionQalys,income:base.incomeEquivalent}));
