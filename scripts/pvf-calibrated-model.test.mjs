import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {calculate,central,diagnostics,historical} from '../lib/pvf-calibrated-model.mjs';
import frozen from '../data/san-francisco/pvf-legacy-pre-recalibration-model.json' with {type:'json'};
const near=(a,b)=>assert(Math.abs(a-b)<1e-11*Math.max(1,Math.abs(a),Math.abs(b)));
test('conditional health reconstructs assignment trial without duplicate completion attrition',()=>{
 const p=central,r=calculate(),offers=p.gift*p.allocation/p.courseCash*p.funding;
 near(r.healthUS,offers*Math.exp(-p.mortality*p.delay)*(1-p.buyer-p.free)*p.trialQ*p.severityTransfer*p.waitFraction*p.completionTransfer/(1+p.discount)**p.delay);
 near(calculate({completedShare:.45}).healthUS,r.healthUS/2);
 assert.equal(calculate({completedShare:0}).healthUS,0);
 near(r.regions.bay.donorPrice10,13567493.202684198);
 near(r.regions.sf.donorPrice10,30526859.706039447);
});
test('same-household flows telescope after population incidence, not before logarithm',()=>{
 const r=calculate({gift:10000,allocation:.1,funding:1,courseCash:1000,buyer:.2,free:.1,worker:.3,completedShare:1,mortality:0,delay:0,discount:0,baseline:1000,buyerPayment:200,travel:10,medicineCost:20,lostDays:1,netDay:100,recoveryPay:100,positiveIndependent:1});
 const independent=.5*(.2*Math.log(1190/1000)+.1*Math.log(990/1000)+.7*Math.log(970/1000));
 near(r.cashEquivalentUS+r.payEquivalentUS,independent);
 assert(r.flows.cash.some(x=>x.annualIncomeGainUSD<0&&x.independentShare===1));
});
test('full negative burdens survive removal of positive overlap retention',()=>{
 const r=calculate({positiveIndependent:0,recoveryPay:-500});
 assert(r.payEquivalentUS<calculate().payEquivalentUS);
 for(const f of [...r.flows.cash,...r.flows.pay])if(f.annualIncomeGainUSD<0)assert.equal(f.independentShare,1);
 const buyer=calculate({buyer:1,free:0,positiveIndependent:0,travel:0});
 assert(buyer.cashEquivalentUS>0);assert.equal(buyer.healthUS,0);
});
test('worker recovery incidence is outside the nonlinear household logarithm',()=>{
 const r=calculate({gift:10000,allocation:.1,funding:1,courseCash:1000,buyer:0,free:0,worker:.3,completedShare:1,mortality:0,delay:0,discount:0,baseline:1000,travel:0,medicineCost:0,lostDays:0,recoveryPay:100,positiveIndependent:1});
 near(r.payEquivalentUS,.3*.5*Math.log1p(.1));
 assert(Math.abs(r.payEquivalentUS-.5*Math.log1p(.03))>1e-4);
});
test('known completion absence zeros pay despite unavailable pay, cash or reach',()=>{
 for(const o of [{payKnown:false},{cashKnown:false},{reachKnown:false,payKnown:false,cashKnown:false}]){
  const r=calculate({...o,completedShare:0});assert.equal(r.payEquivalentUS,0);assert.equal(r.rawPayPVUS,0);
 }
 assert(calculate({completedShare:0}).cashEquivalentUS<0);
 assert.equal(calculate({completedShare:0,cashKnown:false}).cashEquivalentUS,null);
});
test('unavailable transfer/reach zero placeholders do not establish observed absence',()=>{
 for(const k of ['waitFraction','severityTransfer','completionTransfer'])assert.equal(calculate({clinicalKnown:false,[k]:0}).healthUS,null);
 for(const k of ['allocation','funding','cap'])assert.equal(calculate({reachKnown:false,[k]:0}).native.assignedUniqueFirstEyeCourses,null);
 assert.equal(calculate({gift:0,reachKnown:false,clinicalKnown:false,cashKnown:false,payKnown:false}).regions.us.combined,0);
 assert(calculate({payYears:0}).payEquivalentUS<0);
});
test('regional totals preserve signed resources and unknown portfolio scope',()=>{
 const r=calculate();near(r.resourcesUS,r.cashEquivalentUS+r.payEquivalentUS);assert(r.resourcesUS<0);
 for(const z of Object.values(r.regions)){near(z.combined,z.health+z.resources);near(z.donorPrice10,10*central.gift/z.combined);}
 assert.equal(r.fullPortfolioHealth,null);assert.equal(r.identifiedExpectedValue,null);assert.equal(r.verifiedCapacity,null);
 assert.equal(calculate({bayHealth:0,sfHealth:0,bayResources:0,sfResources:0,localityKnown:false}).regions.bay.combined,0);
});
test('all scenario outputs run and eighteen complete historical hashes remain unchanged',()=>{
 assert(Object.keys(diagnostics()).length>=35);
 const h=historical();assert.equal(Object.keys(h).length,18);
 for(const s of frozen.scenarios)assert.equal(createHash('sha256').update(JSON.stringify(h[s.id])).digest('hex'),s.resultSha256);
});
test('input ownership, finiteness, geographic nesting and consumption domain are enforced',()=>{
 for(const o of [null,[],Object.create(null),{[Symbol('x')]:1},{unknown:1},{gift:25001},{gift:Infinity},{buyer:.9,free:.2},{bayHealth:.1,sfHealth:.2},{clinicalKnown:0},{baseline:1000,lostDays:100,netDay:1000}])assert.throws(()=>calculate(o));
});
