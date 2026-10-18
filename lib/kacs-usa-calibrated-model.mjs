export const modelVersion='kacs-usa-advanced-detection-health-resources-judgment-20261002';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
export const defaults={gift:10000,cost:256454,pWith:.255,pWithout:.25,capacity:1,deaths:31,effectiveness:.6,coverageCap:.8,annualCoverage:.05,early:5,late:6,discount:.03,lifeYears:60,lifeUtility:.95,nonfatalPerDeath:1,nonfatalUtility:.2,nonfatalYears:1,rescueHarm:.05,households:100000000,baseline:50000,deviceCash:25,nonfatalCash:1000,rescueCash:-2500,overlap:0,policyHealthHarm:0,independentHealthHarm:0,independentCashHarm:0,healthKnown:true,incomeKnown:true};
export function calculate(o={}){
 if(!o||typeof o!=='object'||Array.isArray(o)||Object.getPrototypeOf(o)!==Object.prototype)throw Error('plain overrides required');
 for(const k of Object.keys(o))if(!Object.hasOwn(defaults,k))throw Error('unknown '+k);
 const p={...defaults,...o};
 for(const [k,v]of Object.entries(p))if(k.endsWith('Known')){if(typeof v!=='boolean')throw Error(k);}else if(!Number.isFinite(v))throw Error(k);
 const bound=(k,l,h)=>{if(p[k]<l||p[k]>h)throw Error(k);};
 for(const k of ['pWith','pWithout','coverageCap','effectiveness','lifeUtility','overlap'])bound(k,0,1);
 bound('capacity',0,1);
 for(const k of ['gift','deaths','nonfatalPerDeath','nonfatalUtility','nonfatalYears','rescueHarm','households','policyHealthHarm','independentHealthHarm','independentCashHarm'])bound(k,0,1e10);
 bound('cost',1,1e10);bound('baseline',1,1e9);bound('discount',0,.2);bound('annualCoverage',.001,1);bound('lifeYears',1,100);bound('early',1,30);bound('late',1,30);bound('nonfatalUtility',0,1);bound('nonfatalYears',0,100);bound('rescueHarm',0,100);bound('deviceCash',0,p.baseline*.99);bound('rescueCash',-p.baseline*.99,p.baseline*10);bound('nonfatalCash',-p.baseline*.99,p.baseline*10);bound('independentCashHarm',0,p.baseline*.99);for(const k of ['early','late','lifeYears'])if(!Number.isInteger(p[k]))throw Error(k+' integer');
 const scale=Math.min(p.gift/p.cost,p.capacity),delta=(p.pWith-p.pWithout)*scale;
 const effectivePolicyProbability=p.pWithout+delta;
 if(!Number.isFinite(effectivePolicyProbability)||effectivePolicyProbability<0||effectivePolicyProbability>1)throw Error('effective policy probability');
 const coverage=(t,L)=>Math.min(p.coverageCap,Math.max(0,p.annualCoverage*(t-L+1)));
 const end=Math.max(p.early,p.late)+Math.ceil(p.coverageCap/p.annualCoverage);
 let exposure=0,purchaseTiming=0;const ledger=[];
 for(let t=1;t<=end;t++){const early=coverage(t,p.early),late=coverage(t,p.late),e=(early-late)/(1+p.discount)**t,b=((early-coverage(t-1,p.early))-(late-coverage(t-1,p.late)))/(1+p.discount)**t;exposure+=e;purchaseTiming+=b;ledger.push({year:t,earlyRiskCoverage:early,lateRiskCoverage:late,discountedExposureDifference:e,discountedPurchaseDifference:b});}
 let qLife=0;for(let t=1;t<=p.lifeYears;t++)qLife+=p.lifeUtility/(1+p.discount)**t;
 const fatalities=delta*p.deaths*p.effectiveness*exposure,nonfatal=fatalities*p.nonfatalPerDeath;
 const grossHealth=fatalities*qLife+nonfatal*p.nonfatalUtility*p.nonfatalYears;
 // Only positive nonfatal symptom health could share a priced welfare domain
 // with positive episode resources. No fatal health/device-cost overlap.
 const overlapRemoved=p.nonfatalCash>0?Math.max(nonfatal*p.nonfatalUtility*p.nonfatalYears,0)*p.overlap:0,rescueHealthHarm=fatalities*p.rescueHarm,policyHealthHarm=delta*p.policyHealthHarm*exposure,independentHealthHarm=p.independentHealthHarm*p.gift/10000;
 const health=p.healthKnown?grossHealth-overlapRemoved-rescueHealthHarm-policyHealthHarm-independentHealthHarm:null;
 const cg=(cash)=>.5*Math.log1p(cash/p.baseline);
 const technologyIncome=delta*p.households*cg(-p.deviceCash)*purchaseTiming,episodeIncome=nonfatal*cg(p.nonfatalCash)+fatalities*cg(p.rescueCash),independentIncome=p.gift/10000*cg(-p.independentCashHarm);
 const income=p.incomeKnown?technologyIncome+episodeIncome+independentIncome:null,combined=health===null||income===null?null:health+income;
 const price=v=>v!==null&&v>0&&p.gift>0?p.gift*10/v:null;
 const result={parameters:p,workYears:scale,directProbabilityDifference:delta,horizon:end,exposure,purchaseTiming,qLife,fatalities,nonfatal,grossHealth,overlapRemoved,rescueHealthHarm,policyHealthHarm,independentHealthHarm,technologyIncome,episodeIncome,independentIncome,healthYears:health,incomeYears:income,combinedYears:combined,price10:price(combined),healthOnlyPrice10:price(health),ledger};
 for(const [k,v]of Object.entries(result))if(typeof v==='number'&&!Number.isFinite(v))throw Error('nonfinite '+k);return result;
}
export function historical(){let A=0;for(let t=1;t<=20;t++){const F=L=>Math.min(.8,Math.max(0,.05*(t-L+1)));A+=(F(3)-F(6))/1.03**t;}const H=30*.8*.7*.9*27*A,Q=10000/(256454*5)*.5*(.2*.2*H)*.99;return{A,H,healthYearsPer10000:Q,price10:100000/Q};}
export function scenarios(){return Object.fromEntries(Object.entries({central:{},lowIncrementalPrice:{deviceCash:15},zeroDevicePrice:{deviceCash:0},higherDevicePrice:{deviceCash:50},noPolicyDifference:{pWith:.25},replacement:{pWith:.2505},strongInfluence:{pWith:.26},capacity:{capacity:.01},clinicalLower:{effectiveness:.3},clinicalZero:{lifeUtility:0,nonfatalUtility:0},clinicalUpper:{effectiveness:.8},life30:{lifeYears:30},life80:{lifeYears:80},oneMoreYearLead:{early:4},policyDelay:{early:7},noAcceleration:{early:6},morbidityUnpriced:{nonfatalPerDeath:0},households50m:{households:50000000},healthUnknown:{healthKnown:false},incomeUnknown:{incomeKnown:false},allUnknown:{healthKnown:false,incomeKnown:false},fullOverlap:{overlap:1},policyHarm:{policyHealthHarm:10},independentHarmZeroBranch:{pWith:.25,independentHealthHarm:.01,independentCashHarm:100},negativeEpisodeCash:{nonfatalCash:-1000},threeYearGrossMean:{cost:(265887+262881+256454)/3},threeYearFunctionalMean:{cost:(265887+258364+256454)/3}}).map(([k,v])=>[k,calculate(v)]));}
export function test(){assert(Math.abs(historical().price10-919739.6998087636)<1e-6);assert(calculate().combinedYears<0);assert(calculate({deviceCash:15}).combinedYears>0);assert.equal(calculate({pWith:.25}).combinedYears,0);assert(calculate({pWith:.25,independentHealthHarm:.01}).healthYears<0);assert(calculate({pWith:.25,independentCashHarm:100}).incomeYears<0);assert(calculate({overlap:1}).healthYears>0);assert.equal(calculate({overlap:1,nonfatalCash:-100}).overlapRemoved,0);assert.equal(calculate({overlap:1}).rescueHealthHarm,calculate().rescueHealthHarm);assert.equal(calculate({incomeKnown:false}).combinedYears,null);assert.equal(calculate({early:6}).combinedYears,0);assert(calculate({early:7}).healthYears<0);for(const o of [null,[],{constructor:1},{toString:1},{cost:0},{deviceCash:50000},{gift:NaN},{pWith:2},{independentCashHarm:50000},{nonfatalUtility:2},{lifeYears:60.5}])assert.throws(()=>calculate(o));assert.throws(()=>calculate({capacity:1.000001}));for(const r of Object.values(scenarios()))if(r.combinedYears!==null)assert.equal(r.healthYears+r.incomeYears,r.combinedYears);return 'assertions passed';}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)console.log(JSON.stringify({validation:test(),historical:historical(),scenarios:scenarios()},null,2));
