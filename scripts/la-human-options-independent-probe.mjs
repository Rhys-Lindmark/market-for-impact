import assert from 'node:assert/strict';
import path from 'node:path';import fs from 'node:fs';import{pathToFileURL}from'node:url';
const dir=process.argv[2];if(!dir)throw Error('Provide Human Options packet directory');
const{calculate,cases}=await import(pathToFileURL(path.resolve(dir,'model.mjs')));
let checks=0;
const near=(a,b)=>{assert.ok(Math.abs(a-b)<1e-10*Math.max(1,Math.abs(b)),`${a} != ${b}`);checks++;};
const overlap=(v,k)=>v>0?v*k:v;
const annuity=(n,d,r)=>{let a=0;for(let i=0;i<Math.ceil(n);i++)a+=Math.min(1,n-i)/(1+r)**(d+i);return a;};
for(const[id,overrides]of cases){
 const s=calculate(overrides),p=s.inputs;
 const c=p.Np*p.communityAdultUnique*p.b,h=p.Ns*p.residentialHouseholdShare*p.b,j=Math.min(c,h*p.resourceOverlap);
 near(s.community,c);near(s.residential,h);near(s.joint,j);
 const qc=p.Np*p.dp*p.rp*p.b*p.ep*p.up*p.Tp/(1+p.discount)**p.counselingDelay;
 const qs=p.Ns*p.ds*p.rs*p.b*p.es*p.us*p.Ts/(1+p.discount)**p.safetyDelay;
 near(s.qCounsel,qc);near(s.qSafety,qs);
 const health=p.g*(overlap(qc,p.k)+overlap(qs,p.k)-(c+h-j)*p.clinicalHarmPerPerson/(1+p.discount)**p.resourceDelay);
 if(p.clinicalUnknown){assert.equal(s.editionQalys,null);checks++;}else near(s.editionQalys,health);
 const net=overlap(p.housingResourceGain,p.positiveOverlap)-p.housingCost;near(s.housingNet,net);
 const expected=[['community-only',c-j,p.baseline,-p.communityCost],['housing-only',h-j,p.baseline,net],['joint-community-housing',j,p.baseline,net-p.communityCost]];
 if(p.b>0&&p.partnerCostPerHousehold!==0)expected.push(['partner-payer-opportunity-stress',p.partnerPeople,p.partnerBaseline,-(c+h-j)*p.partnerCostPerHousehold/p.partnerPeople]);
 if(p.b>0&&p.landlordNetMargin!==0)expected.push(['landlord-counterparty-margin-stress',p.landlordPeople,p.landlordBaseline,h*p.landlordNetMargin/p.landlordPeople]);
 for(const[key,n,b,g]of expected){if(n===0)continue;const x=s.incomePathways.find(v=>v.id===key);assert.ok(x,id+': '+key);checks++;near(x.people,n);near(x.annualIncomeBeforeUSD,b);near(x.annualIncomeGainUSD,g);}
 let income=0;for(const x of s.incomePathways){assert.ok(x.annualIncomeBeforeUSD+x.annualIncomeGainUSD>0);checks++;income+=.5*x.people*(x.editionShare??1)*annuity(x.years,x.delayYears,x.discountRate)*Math.log1p(x.annualIncomeGainUSD/x.annualIncomeBeforeUSD);}
 near(s.incomeEquivalent,income);
 if(p.incomeUnknown||p.clinicalUnknown){assert.equal(s.totalEquivalent,null);assert.equal(s.price10,null);checks+=2;}else{near(s.totalEquivalent,health+income);if(health+income>0)near(s.price10,10*p.C/(health+income));else{assert.equal(s.price10,null);checks++;}}
}
const z=calculate({b:0});near(z.editionQalys,0);near(z.incomeEquivalent,0);
near(calculate({housingResourceGain:-1000,positiveOverlap:.5}).incomeEquivalent,calculate({housingResourceGain:-1000,positiveOverlap:0}).incomeEquivalent);
assert.ok(calculate({rp:0,rs:0}).incomeEquivalent<0);checks++;
assert.ok(calculate({housingResourceGain:3000}).incomeEquivalent>0);checks++;
const rp=path.resolve(dir,'report.json');if(fs.existsSync(rp)){const r=JSON.parse(fs.readFileSync(rp));for(const s of r.model.scenarios){const e=calculate(s.inputs);for(const[k,alias]of[['editionQalys','editionQalys'],['incomeEquivalent','incomeEquivalentYears'],['totalEquivalent','combinedEquivalentYears'],['price10','costPer10Qalys']]){const got=s[k]??s[alias]??null;if(e[k]===null){assert.equal(got,null);checks++;}else near(got,e[k]);}}}
console.log(JSON.stringify({checks,cases:cases.length,central:calculate().price10,health:calculate().editionQalys,income:calculate().incomeEquivalent}));
