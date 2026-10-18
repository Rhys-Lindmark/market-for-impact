import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
const dir=process.argv[2];if(!dir)throw Error('Provide MMHN packet directory');
const {calculate,cases}=await import(pathToFileURL(path.resolve(dir,'model.mjs')));
let checks=0;
const near=(a,b)=>{assert.ok(Math.abs(a-b)<1e-10*Math.max(1,Math.abs(b)),`${a} != ${b}`);checks++;};
const keepNegative=(v,k)=>v>0?v*k:v;
const annuity=(years,delay,rate)=>{let v=0;for(let t=0;t<Math.ceil(years);t++)v+=Math.min(1,years-t)/(1+rate)**(delay+t);return v;};
for(const[id,overrides]of cases){
 const s=calculate(overrides),p=s.inputs;
 const training=p.T*p.d*p.L*p.r*p.a*p.b*p.q;
 const peer=p.P*p.peerUnique*p.e*p.rP*p.aP*p.b*p.u*p.w/52;
 const health=(keepNegative(training*p.gT,p.k)+keepNegative(peer,p.k))/(1+p.discount)**p.delay;
 if(p.clinicalUnknown){assert.equal(s.editionQalys,null);checks++;}else near(s.editionQalys,health);
 near(s.providers,p.T*p.uniqueCourseShare*p.b*p.gT);
 near(s.trainingParents,p.T*p.d*p.L*p.b*p.resourceExposure*p.gT);
 near(s.peerParents,p.P*p.peerUnique*p.b);
 near(s.joint,Math.min(s.trainingParents,s.peerParents*p.peerOverlap));
 const baseGain=keepNegative(p.resourceGain,p.positiveOverlap);
 const fundPeople=p.fundAmount!==0&&p.b>0?p.fundHouseholds:0;
 const fundJoint=Math.min(s.providers,fundPeople*p.fundOverlap);
 const expected=[['local-course-participant',s.providers-fundJoint,p.providerBaseline,-p.hours*p.timeValue*p.unpaidShare],['workflow-only-parent',s.trainingParents-s.joint,p.patientBaseline,baseGain-p.patientCost],['peer-only-parent',s.peerParents-s.joint,p.patientBaseline,baseGain-p.peerCost],['joint-workflow-peer-parent',s.joint,p.patientBaseline,baseGain-p.patientCost-p.peerCost]];
 if(fundPeople>0){const gross=p.fundAmount*p.b*p.fundAdditional,net=keepNegative(gross*(1-p.fundOffsets)/p.fundHouseholds,p.positiveOverlap);expected.push(['disjoint-fund-recipient',fundPeople-fundJoint,30000,net],['joint-course-fund-recipient',fundJoint,p.providerBaseline,net-p.hours*p.timeValue*p.unpaidShare],['hypothetical-fund-payer',p.fundPayerPeople,p.fundPayerBaseline,-gross/p.fundPayerPeople]);}
 for(const[key,n,b,g]of expected){if(n===0)continue;const x=s.incomePathways.find(v=>v.id===key);assert.ok(x,id+': '+key);checks++;near(x.people,n);near(x.annualIncomeBeforeUSD,b);near(x.annualIncomeGainUSD,g);}
 let income=0;
 for(const x of s.incomePathways){assert.ok(x.annualIncomeBeforeUSD+x.annualIncomeGainUSD>0);checks++;income+=.5*x.people*annuity(x.years,x.delayYears,x.discountRate)*Math.log1p(x.annualIncomeGainUSD/x.annualIncomeBeforeUSD);}
 near(s.incomeEquivalent,income);
 if(p.clinicalUnknown||p.incomeUnknown){assert.equal(s.totalEquivalent,null);assert.equal(s.price10,null);checks+=2;}else{near(s.totalEquivalent,health+income);if(health+income>0)near(s.price10,10*p.C/(health+income));else{assert.equal(s.price10,null);checks++;}}
}
const z=calculate({b:0});near(z.editionQalys,0);near(z.incomeEquivalent,0);
assert.ok(calculate({q:0,rP:0}).incomeEquivalent<0);checks++;
const lossA=calculate({resourceGain:-100,positiveOverlap:.5}),lossB=calculate({resourceGain:-100,positiveOverlap:0});near(lossA.incomeEquivalent,lossB.incomeEquivalent);
const reportPath=path.resolve(dir,'report.json');
if(fs.existsSync(reportPath)){const r=JSON.parse(fs.readFileSync(reportPath));for(const s of r.model.scenarios){const expected=calculate(s.inputs);for(const[k,alias]of[['editionQalys','editionQalys'],['incomeEquivalent','incomeEquivalentYears'],['totalEquivalent','combinedEquivalentYears'],['price10','costPer10Qalys']]){const got=s[k]??s[alias]??null;if(expected[k]===null){assert.equal(got,null);checks++;}else near(got,expected[k]);}}}
console.log(JSON.stringify({checks,cases:cases.length,central:calculate().price10}));
