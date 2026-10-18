import fs from 'node:fs';
import assert from 'node:assert/strict';
import {incomeHealthyYearEquivalent} from '../../../lib/income-health-equivalence.mjs';
import {reportPrice,scenarioIncomeEquivalent} from '../../../lib/geography-reports.mjs';
export const C=33936024;
export const parameters={D:1,b:.5,g:.95,d:.03,clinicalN:2600,clinicalR:.05,clinicalU:.04,clinicalT:.5,clinicalLag:.25,clinicalMortality:.005,financialMortality:.005,workforceN:67.5,workforceConsumption:20000,workforceNetGain:1500,workforceCausal:.25,workforceYears:1,workforceDelay:1,legalN:200,legalConsumption:20000,legalNetGain:1000,legalCausal:.25,legalYears:1,legalDelay:.5,independentShare:.5};
export const specs=[
{id:'full-resource-cost',label:'Full donated-resource burden',o:{C:102625589},note:'Same annual outcomes, causal/resource assumptions and capacity b as reference; cost denominator includes donated legal labor and goods, plus event benefits. Total-resource burden sensitivity, not actual marginal cash requirement.'},
{id:'central',label:'Conditional judgment reference',o:{},note:'Unmeasured reference: half annual output expands; 5% additional clinical response, .04 utility for half a year; 67.5 workforce adults and 200 disjoint legal/benefits adults, net consumption changes +1500/+1000, one year, .25 causal share and .5 welfare-overlap residual. Not empirical expected value.'},
{id:'hypothetical-neutral-income',label:'Hypothetical neutral income, explicitly unmeasured',o:{neutralIncome:true},note:'Income is assumed net zero for illustration only; not evidence that financial effects are absent.'},
{id:'clinical-null-positive-income',label:'Clinical null with positive financial welfare',o:{clinicalR:0},note:'No additional clinical effect; signed financial components remain positive under reference assumptions.'},
{id:'clinical-null-negative-income',label:'Clinical null with financial burden',o:{clinicalR:0,workforceNetGain:-1500,legalNetGain:-1000},note:'Benefit withdrawal, costs or lost resources outweigh gains; financial burdens persist when clinical effect is zero.'},
{id:'positive-expansion',label:'Stronger positive conditional expansion',o:{b:1,clinicalR:.1,clinicalU:.08,clinicalT:1,workforceN:135,workforceNetGain:3000,workforceYears:2,legalN:400,legalNetGain:2000,legalYears:2},note:'All stronger parameters are judgments, not measured forecasts.'},
{id:'low-expansion',label:'Low expansion and short benefits',o:{b:.1,clinicalR:.02,clinicalU:.02,clinicalT:.25,workforceNetGain:500,legalNetGain:250},note:'Small effects and capacity with fixed whole-recipient cost.'},
{id:'zero-expansion',label:'No donor additionality',o:{b:0},note:'Gift entirely substitutes for other funding; no new services or financial effect.'},
{id:'adverse',label:'Adverse health and financial effects',o:{clinicalR:0,healthHarm:.001,workforceNetGain:-1500,legalNetGain:-1000},note:'Stress/retaliation/retraumatization modeled as .001 QALY per annual clinical client plus net financial burdens; magnitude entirely hypothetical.'},
{id:'unknown-total',label:'Health and income remain unknown',o:{unknown:true},note:'No calibrated recipient causal-health utility, net resources or marginal expansion data: combined price is not identified.'},
{id:'income-unknown',label:'Reference health, unknown signed income',o:{incomeUnknown:true},note:'Conditional health retained; unknown financial welfare blocks combined price.'},
{id:'geographic-half',label:'Half benefits within NYC MSA',o:{g:.5},note:'Residence allocation is not measured.'},
{id:'delay-two-years',label:'Two-year financial delay',o:{workforceDelay:2,legalDelay:2},note:'Reference effects arrive later.'},
{id:'income-overlap-zero',label:'All financial welfare overlaps health',o:{independentShare:0},note:'No independent income-equivalent credit; health remains.'},
{id:'net-income-negative-health-positive',label:'Positive health, negative net consumption',o:{workforceNetGain:-1500,legalNetGain:-1000},note:'Independent signed financial burdens reduce total despite positive clinical benefit.'}
];
function finiteHealth(T,lag,d,m){const k=Math.log1p(d)-Math.log1p(-m);return Math.exp(-k*lag)*(k===0?T:-Math.expm1(-k*T)/k);}
export function calculate(spec){
const p={C,...parameters,...spec.o};if(p.workforceNetGain<0)p.workforceN=450;const scale=p.D/p.C*p.b;
if(p.unknown)return {id:spec.id,label:spec.label,assumptions:spec.note,costUSD:p.D,allPopulationQalys:null,editionQalys:null,incomeUnknown:true,pricePer10Qalys:null};
const health=scale*p.clinicalN*(p.clinicalR*p.clinicalU*finiteHealth(p.clinicalT,p.clinicalLag,p.d,p.clinicalMortality)-(p.healthHarm??0));
const pathway=(id,N,before,gain,years,delay,causal,sourceIds)=>({id,people:Math.max(scale*N,Number.MIN_VALUE),annualIncomeBeforeUSD:before,annualIncomeGainUSD:gain,years,delayYears:delay,discountRate:(1+p.d)/(1-p.financialMortality)-1,causalShare:p.b===0?0:gain<0?1:causal,editionShare:p.g,independentShare:gain<0?1:p.independentShare,sourceIds,rationale:'Hypothetical annual disposable consumption per adult, including retained earnings/transfers less taxes, benefit withdrawal, childcare, commuting, training opportunity cost and lost partner-controlled resources. No gross-wage credit; population and amounts are judgments. The .5 positive independent share discounts welfare already reflected in mental health; negative financial burdens receive full independent and causal weight across the exposed cohort. Discount includes common-alive receipt attrition at .005, not mortality prevention.',counterfactual:'Other workforce providers, legal aid, public benefits, housing support and self-found employment continue; positive causalShare is additional retained resources beyond those alternatives, separate from donor capacity b. Negative costs apply to all exposed adults with no employment-success multiplier.'});
const incomePathways=p.neutralIncome?[]:[pathway('workforce',p.workforceN,p.workforceConsumption,p.workforceNetGain,p.workforceYears,p.workforceDelay,p.workforceCausal,['sff-eep','sff-impact']),pathway('legal-benefits-housing',p.legalN,p.legalConsumption,p.legalNetGain,p.legalYears,p.legalDelay,p.legalCausal,['sff-legal'])];
const s={id:spec.id,label:spec.label,assumptions:spec.note,costUSD:p.D,allPopulationQalys:health,editionQalys:health*p.g,incomePathways,incomeUnknown:!!p.incomeUnknown,additionalClinicalResponders:scale*p.clinicalN*p.clinicalR,parameters:p};s.incomeEquivalentYears=scenarioIncomeEquivalent(s);s.pricePer10Qalys=reportPrice({model:{scenarios:[{...s,id:'central'}]}});return s;
}
export function historical(s,model){
 const values=Object.fromEntries(model.inputs.map(i=>[i.name,i.value]));const o=s.overrides??{};Object.assign(values,o);
 let all=0,edition=0;
 for(const base of model.paths){const p={...base,...o.paths?.[base.id]};for(const [key,value] of Object.entries(o.pathScale??{}))p[key]*=value;
 const k=Math.log1p(values.d)-Math.log1p(-p.m),F=finiteHealth(p.T,p.lag,values.d,p.m)*(p.W?(k===0?1:-Math.expm1(-k*p.W)/(k*p.W)):1);
 const q=values.D/values.C*values.b*p.N*p.r*p.u*F*p.o;all+=q;edition+=q*p.g;}
 all-=values.h;edition-=values.h*values.gH;return {allPopulationQalys:all,editionQalys:edition,pricePer10Qalys:edition>0?10*values.D/edition:null};
}
export function selftest(report,initial){
 const near=(a,b)=>assert.ok(Math.abs(a-b)<=1e-10*Math.max(1e-12,Math.abs(a),Math.abs(b)),a+' != '+b);
 for(const spec of specs){const actual=calculate(spec),stored=report.model.scenarios.find(s=>s.id===spec.id);for(const k of ['allPopulationQalys','editionQalys','incomeEquivalentYears','pricePer10Qalys'])if(actual[k]==null)assert.equal(stored[k]??null,null);else near(actual[k],stored[k]);}
 for(const s of [...initial.report.model.scenarios,...initial.report.model.sensitivity.filter(s=>typeof s==='object')]){const r=historical(s,initial.report.model);for(const k of ['allPopulationQalys','editionQalys','pricePer10Qalys'])if(s[k]===null)assert.equal(r[k],null);else near(r[k],s[k]);}
 const central=calculate(specs.find(s=>s.id==='central'));near(reportPrice(report),central.pricePer10Qalys);assert.equal(report.model.scenarios.find(s=>s.id==='historical-alpha-central').pricePer10Qalys,34644592.51237719);
 const full=calculate(specs.find(s=>s.id==='full-resource-cost'));near(full.pricePer10Qalys,central.pricePer10Qalys*102625589/C);near(full.editionQalys*102625589,central.editionQalys*C);near(full.incomeEquivalentYears*102625589,central.incomeEquivalentYears*C);assert.deepEqual(report.model.historicalAlphaModel,initial.report.model);assert.deepEqual(report.historical.historicalAlphaScenarioOutputs,initial.report.model.scenarios);assert.deepEqual(report.historical.historicalAlphaSensitivities,initial.report.model.sensitivity);
 assert.ok(calculate(specs.find(s=>s.id==='clinical-null-positive-income')).incomeEquivalentYears>0);assert.ok(calculate(specs.find(s=>s.id==='clinical-null-negative-income')).incomeEquivalentYears<0);assert.equal(calculate(specs.find(s=>s.id==='zero-expansion')).incomeEquivalentYears,0);assert.ok(calculate(specs.find(s=>s.id==='adverse')).editionQalys<0);assert.equal(calculate(specs.find(s=>s.id==='income-unknown')).pricePer10Qalys,null);
 assert.ok(incomeHealthyYearEquivalent({people:1,annualIncomeBeforeUSD:20000,annualIncomeGainUSD:-1000,years:1})<0);
 for(const spec of specs){const actual=calculate(spec);for(const pathway of actual.incomePathways??[])if(pathway.annualIncomeGainUSD<0){assert.equal(pathway.causalShare,1);assert.equal(pathway.independentShare,1);}if(actual.parameters?.workforceNetGain<0)assert.equal(actual.parameters.workforceN,450);}
 const withoutAttrition=calculate({id:'test',label:'test',o:{financialMortality:0},note:'test'});assert.ok(central.incomeEquivalentYears<withoutAttrition.incomeEquivalentYears);
 return {newScenarios:specs.length,historicalScenarios:initial.report.model.scenarios.length,historicalSensitivities:initial.report.model.sensitivity.filter(s=>typeof s==='object').length,headlineEquality:true,alphaExactlyPreserved:true,signedIncomeAndClinicalNull:true};
}
if(process.argv[1]?.endsWith('model.mjs')){const initial=JSON.parse(fs.readFileSync(new URL('./initial-diagnostic.json',import.meta.url)));if(process.argv.includes('--selftest')){const report=JSON.parse(fs.readFileSync(new URL('./report.json',import.meta.url)));console.log(JSON.stringify(selftest(report,initial)));}else console.log(JSON.stringify(specs.map(calculate)));}
