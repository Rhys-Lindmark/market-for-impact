import assert from 'node:assert/strict';
import {calculate,cases,allocation} from '../../lib/ymca-current-calibrated-model.mjs';
import {results} from './ymca-legacy-independent-calculation-20261004.mjs';
let checks=0;
function close(a,b){checks++;if(a===null||b===null)assert.equal(a,b);else assert.ok(Math.abs(a-b)<=1e-11*Math.max(1,Math.abs(a),Math.abs(b)),`${a} != ${b}`);}
for(const [name,input] of Object.entries(cases)){
 const a=calculate(input),b=results[name];assert.ok(b);
 for(const k of Object.keys(allocation))for(const [current,prior] of Object.entries({fundedUnits:'funded',additionalUnits:'n',households:'hh',netHouseholdAnnualResourcesUSD:'net',clinicalHealthyYears:'health',incomeEquivalentYears:'money'}))close(a.routes[k][current],b.routes[k][prior]);
 for(const [current,prior]of Object.entries({sf:'sf',restBay:'restBay',bayIncludingSF:'bay'}))for(const [c,p]of Object.entries({clinicalHealthyYears:'health',incomeEquivalentYears:'money',combinedEquivalentYears:'total',donorUSDPer10CombinedEquivalentYears:'price'}))close(a.geography[current][c],b[prior][p]);
 close(a.inducedIncomeEquivalentYears,b.induced);close(a.grossResourceFloorUSD,b.floor);close(a.grossResourceUSD,b.gross);
 assert.equal(a.ordinaryGiftExpectedValue,null);assert.equal(a.weightedExpectedValue,null);
}
// Gross positive clinical credits cannot be hidden by canceling course harms.
assert.throws(()=>calculate({distinctClinicalRoutes:[],routes:{mental:{healthPerUnit:.02,clinicalHarm:.02}}}),/Overlapping positive clinical/);
assert.throws(()=>calculate({routes:{mental:{healthPerUnit:.02}}}),/every and only/);
for(const distinctClinicalRoutes of [['fitness','dpp','family'],['fitness','dpp','fitness'],['fitness','dpp','bogus']])assert.throws(()=>calculate({distinctClinicalRoutes}));
assert.throws(()=>calculate({gift:0}),/every and only/);
assert.deepEqual(calculate(cases.zeroGift).clinicalIncidence.activePositiveRoutes,[]);
const single=calculate({distinctClinicalRoutes:[],routes:{dpp:{healthPerUnit:0}}});assert.deepEqual(single.clinicalIncidence.activePositiveRoutes,['fitness']);
const adverse={distinctClinicalRoutes:[],independentClinicalHarmSF:.3,independentClinicalHarmRestBay:.7,routes:{fitness:{healthPerUnit:-.01,positiveHealthIndependentShare:0,clinicalHarm:.02},dpp:{healthPerUnit:-.01,positiveHealthIndependentShare:0,clinicalHarm:.02}}};
const loss=calculate(adverse);assert.ok(loss.geography.bayIncludingSF.clinicalHealthyYears < -1);assert.ok(loss.routes.fitness.clinicalHealthyYears<-.02*loss.routes.fitness.additionalUnits);
const baseline=calculate({...adverse,independentClinicalHarmSF:0,independentClinicalHarmRestBay:0});close(loss.geography.sf.clinicalHealthyYears-baseline.geography.sf.clinicalHealthyYears,-.3);close(loss.geography.restBay.clinicalHealthyYears-baseline.geography.restBay.clinicalHealthyYears,-.7);
const canceled={routes:{family:{accessSaving:1000,fees:1000}}};assert.equal(calculate(canceled).routes.family.incomeEquivalentYears,0);
assert.throws(()=>calculate({routes:{family:{accessSaving:1000,fees:1000},youth:{travel:1}}}),/Cross-route household/);
assert.throws(()=>calculate({routes:{family:{accessSaving:1000,positiveResourceIndependentShare:0},youth:{fees:1000}}}),/Cross-route household/);
assert.throws(()=>calculate({routes:{family:{travel:1}},inducedHouseholds:1,inducedNetResources:-1}),/Cross-route household/);
const central=calculate();assert.equal(Object.keys(central.routes).length,7);assert.equal(Object.values(central.routes).reduce((s,r)=>s+r.donorUSD,0),100000);
assert.equal(central.geography.bayIncludingSF.incomeEquivalentYears,0);assert.equal(central.routes.mental.clinicalHealthyYears,0);assert.equal(central.routes.family.clinicalHealthyYears,0);assert.equal(central.grossResourceUSD,null);
assert.match(central.clinicalIncidence.status,/unverified/);assert.match(central.classification,/not ordinary/);
console.log(JSON.stringify({outcome:'ACCEPT',cases:27,numericChecks:checks,centralBay:central.geography.bayIncludingSF.donorUSDPer10CombinedEquivalentYears,centralSF:central.geography.sf.donorUSDPer10CombinedEquivalentYears}));
