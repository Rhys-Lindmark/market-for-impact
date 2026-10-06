import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {calculate as calculateOa} from '../lib/oa-portfolio-model.mjs';
import {BOUNDS as oaBounds} from '../lib/oa-portfolio-foundation.mjs';
import {validateEditionReports,reportPrice,researchListPrice,formatEditionReportPrice,incomeAdjustedReportPrice,formatEditionMoney,expenseAverage,editionResearchEffort,reportsForEdition,editionReportPath} from '../lib/geography-reports.mjs';
const read=path=>JSON.parse(readFileSync(new URL('../'+path,import.meta.url)));

// Synthetic fixtures live only in tests; never published or counted as research.
function fixture(){
 const session={id:'synthetic-session',organizationId:'org:test',workerId:'test-worker',stage:'alpha',phase:'research',startedAt:'2026-09-13T10:00:00Z',endedAt:'2026-09-13T10:15:00Z',evidence:'scripts/geography-reports.test.mjs',model:{id:'gpt-6-astra',name:'GPT-6 Astra Light',reasoningEffort:'low',evidence:'Synthetic test assignment'}};
 const r={edition:'california',boundaryVersion:'US-CA-state-v1',organizationId:'org:test',slug:'synthetic-only',organization:'Synthetic test organization',program:'Testing only',published:'2026-09-13',updated:'2026-09-13',stage:'alpha',donationUrl:null,acceptance:{status:'accepted',evidence:'Synthetic test, not real acceptance'},summary:{what:['A.','B.','C.'],strengths:['A','B','C'],reservations:['A','B','C']},sections:{what:'Text',monitoring:'Text',qualitative:'Text',cost:'Text',funding:'Text'},sources:[{id:'s1',title:'Synthetic',publisher:'Test',url:'https://example.com/',published:null,retrieved:'2026-09-13'}],model:{version:'test',costScope:'Test',geographicAttribution:'10 of20 test QALYs in CA',formula:'10 * cost / edition QALYs',counterfactual:'Test',attribution:'Test',uncertainty:'Test',nativeOutcomes:'Test care',inputs:[{name:'Synthetic cost',value:100000,unit:'USD',basis:'judgment',rationale:'Test only',sourceIds:[]}],scenarios:[{id:'central',label:'Synthetic central',costUSD:100000,allPopulationQalys:20,editionQalys:10,assumptions:'Test only'}],sensitivity:['Synthetic sensitivity'],missingInputs:[]},annualExpenses:[],timeCoverage:'complete',sessionIds:['synthetic-session']};
 const progress={editions:[{id:'california',boundaryVersion:r.boundaryVersion,selectedAlphaIds:['org:test'],alphaCohortIds:['org:test'],betaIds:[],alphaPublished:1,betaAcceptedPublished:0}]};
 return {data:{schemaVersion:1,sessions:[session],reports:[r]},progress,r};
}
test('published registry matches accepted progress without mock records',()=>validateEditionReports(read('data/geography-reports.json'),read('docs/geography-progress.json')));
test('Operation Access historical scenarios reproduce from the frozen input ledger',()=>{
 const report={model:read('data/california/oa-ca-pre-recalibration-model.json')};
 assert.ok(report);
 const central_inputs={bay_share:0,sf_share:0};
 for(const input of report.model.inputs)if(Object.hasOwn(oaBounds,input.name))central_inputs[input.name]=input.value;
 const paths=report.model.inputs.filter(input=>input.name.startsWith('Pathway ')).map(input=>{
  const match=input.name.match(/^Pathway (\S+) \((\S+)\)$/);assert.ok(match);
  return {id:match[1],name:match[1],category:match[2],...JSON.parse(input.value)};
 });
 assert.equal(paths.length,21);
 for(const scenario of report.model.scenarios){
  const match=scenario.assumptions.match(/Overrides on beta central vector: (\{.*\})\. California share/);
  assert.ok(match,'Every scenario must carry its exact overrides');
  const result=calculateOa({foundation:{central_inputs},paths},match?JSON.parse(match[1]):{});
  assert.ok(Math.abs(result.total_q-scenario.allPopulationQalys)<1e-10,scenario.id);
  assert.equal(scenario.editionQalys,scenario.allPopulationQalys);
  assert.equal(result.whole_gift_usd,scenario.costUSD);
  assert.ok(result.gross_resource_usd>=scenario.costUSD);
 }
 assert.equal(report.model.scenarios.find(s=>s.id==='zero_activity').editionQalys,0);
 assert.ok(report.model.scenarios.find(s=>s.id==='adverse_new_pathways').editionQalys<0);
});
test('price uses edition denominator, not global benefit; format and routes match contract',()=>{
 const {data,progress,r}=fixture();validateEditionReports(data,progress);
 assert.equal(reportPrice(r),100000);assert.equal(formatEditionMoney(56000),'$56K');assert.equal(formatEditionMoney(1400000),'$1.4M');
 assert.equal(editionReportPath(r),'/california/charities/synthetic-only');
 r.model.scenarios[0].editionQalys=0;assert.equal(reportPrice(r),null);
 r.model.scenarios[0].editionQalys=-1;assert.equal(reportPrice(r),null);
 r.model.scenarios[0].editionQalys=null;assert.equal(reportPrice(r),null);
});
test('income bridge contributes to headline welfare price and remains source-gated',()=>{
 const {data,progress,r}=fixture();
 r.model.incomeBridge={people:200,annualIncomeBeforeUSD:50000,annualIncomeGainUSD:500,years:1,causalShare:1,editionShare:1,independentShare:1,sourceIds:['s1'],rationale:'Synthetic only',counterfactual:'Synthetic baseline'};
 validateEditionReports(data,progress);
 const comparison=incomeAdjustedReportPrice(r);
 assert.ok(comparison.incomeEquivalentYears>0.99&&comparison.incomeEquivalentYears<1);
 assert.equal(comparison.price,reportPrice(r));
 assert.ok(reportPrice(r)<100000);
 r.model.incomeBridge.sourceIds=[];
 assert.throws(()=>validateEditionReports(data,progress),/Income bridge needs/);
});
test('scenario income can price nonclinical benefits; losses cannot manufacture a positive price',()=>{
 const {data,progress,r}=fixture();
 const s=r.model.scenarios[0];s.editionQalys=0;s.allPopulationQalys=0;
 const b={people:200,annualIncomeBeforeUSD:50000,annualIncomeGainUSD:500,years:1,causalShare:1,editionShare:1,independentShare:1,sourceIds:['s1'],rationale:'Synthetic only',counterfactual:'Synthetic baseline'};
 s.incomePathways=[b];validateEditionReports(data,progress);
 assert.ok(reportPrice(r)>0);
 r.model.incomeBridge=b;assert.equal(reportPrice(r),incomeAdjustedReportPrice(r).price,'Legacy and scenario bridges must not both be counted');
 s.incomePathways=[{...b,annualIncomeGainUSD:-500}];assert.equal(reportPrice(r),null);
 s.incomePathways=[{...b,sourceIds:[]}];assert.throws(()=>validateEditionReports(data,progress),/Income pathway needs/);
});
test('End Overdose retains separately dated California arithmetic and deduplicates research time',()=>{
 const data=read('data/geography-reports.json');
 const us=data.reports.find(r=>r.slug==='end-overdose'&&r.edition==='usa');
 const ca=data.reports.find(r=>r.slug==='end-overdose'&&r.edition==='california');
 assert.ok(us&&ca);
 for(const scenario of ca.model.scenarios.filter(s=>['central','favorable','pessimistic','donatedstock','no-additionality'].includes(s.id))){
  const counterpart=scenario;
  if(scenario.id==='no-additionality'){assert.equal(counterpart.editionQalys,0);continue;}
  const p=JSON.parse(scenario.assumptions.match(/^\{[^}]+\}/)[0]);
  let life=0;for(let k=1;k<=p.T;k++)life+=p.u*((1-p.m)/1.03)**k;
  const q=scenario.costUSD*p.a/p.c*p.e*p.d*p.r*p.f*p.b*life/1.03;
  assert.ok(Math.abs(q-scenario.allPopulationQalys)<1e-10);
  const geo=JSON.parse(counterpart.assumptions.match(/^\{[^}]+\}/)[0]);
  assert.ok(Math.abs(counterpart.editionQalys-q*geo.g_CA)<1e-10);
 }
 const ids=new Set([...us.sessionIds,...ca.sessionIds]);
 const seconds=[...ids].reduce((sum,id)=>{const s=data.sessions.find(s=>s.id===id);return sum+(Date.parse(s.endedAt)-Date.parse(s.startedAt))/1000;},0);
 assert.equal(seconds,1210+2372+297);
 const central=ca.model.scenarios.find(s=>s.id==='central');
 assert.ok(Math.abs(central.editionQalys/central.allPopulationQalys-(.15*.75/(.85+.15*.75)))<1e-12);
 assert.equal(ca.model.scenarios.find(s=>s.id==='ca-zero').editionQalys,0);
});
test('unestimated needs blockers; observed inputs need sources; stage and cohort are checked',()=>{
 const zero=fixture();Object.assign(zero.r.model.scenarios[0],{costUSD:0,allPopulationQalys:0,editionQalys:0});validateEditionReports(zero.data,zero.progress);assert.equal(reportPrice(zero.r),null);
 const negative=fixture();negative.r.model.scenarios[0].costUSD=-1;assert.throws(()=>validateEditionReports(negative.data,negative.progress),/nonnegative/);
 const nullCase=fixture();nullCase.r.model.scenarios[0].editionQalys=null;assert.throws(()=>validateEditionReports(nullCase.data,nullCase.progress),/blocking inputs/);
 let {data,progress,r}=fixture();r.model.scenarios=[];assert.throws(()=>validateEditionReports(data,progress),/blocking inputs/);r.model.missingInputs=['Unknown additional care'];validateEditionReports(data,progress);
 r.model.inputs[0].basis='observed';assert.throws(()=>validateEditionReports(data,progress),/source/);r.model.inputs[0].sourceIds=['s1'];validateEditionReports(data,progress);
 data.sessions[0].model.reasoningEffort='medium';assert.throws(()=>validateEditionReports(data,progress),/Wrong author model/);data.sessions[0].model.reasoningEffort='low';
 progress.editions[0].selectedAlphaIds=[];assert.throws(()=>validateEditionReports(data,progress),/cohort/);
});
test('unknown runtime stays unknown; lists retain initial estimates without changing current models',()=>{
 const {data,progress,r}=fixture();
 data.sessions[0].model=null;
 validateEditionReports(data,progress);
 assert.match(editionResearchEffort(data,r).label,/unrecorded AI model/);
 const published=read('data/geography-reports.json');
 for(const report of published.reports.filter(r=>/withdrawn|withdrawal/i.test((r.priceScope??'')+' '+r.acceptance.evidence))){
  const slug=report.slug;
  assert.equal(reportPrice(report),null,slug);
  assert.ok(researchListPrice(report)>0,slug);
  assert.match(formatEditionReportPrice(report),/^\$/,slug);
 }
 const school=published.reports.find(r=>r.slug==='california-school-based-health-alliance');
 assert.equal(formatEditionReportPrice(school),'$111.7M');
 const historical=school.model.scenarios.find(s=>s.id==='historical-alpha-central');
 assert.ok(Math.abs(10*historical.costUSD/historical.editionQalys-26853571.42857143)<.01);
});
test('retained initial price includes its own signed income exactly once',()=>{
 const {r}=fixture();
 const original={...r.model.scenarios[0],id:'historical-alpha-central'};
 const pathway={people:200,annualIncomeBeforeUSD:50000,annualIncomeGainUSD:500,years:1,sourceIds:['s1'],rationale:'Synthetic',counterfactual:'Synthetic'};
 original.incomePathways=[pathway];
 r.model.scenarios=[{...r.model.scenarios[0],editionQalys:-1,incomePathways:[]},original];
 const income=.5*200*Math.log1p(.01);
 assert.equal(reportPrice(r),null);
 assert.equal(researchListPrice(r),1000000/(10+income));
 r.model.incomeBridge={...pathway,annualIncomeGainUSD:5000};
 assert.equal(researchListPrice(r),1000000/(10+income),'Current bridge must not alter history');
 original.incomePathways=[{...pathway,annualIncomeGainUSD:-500}];
 assert.equal(researchListPrice(r),1000000/(10+.5*200*Math.log1p(-.01)));
 original.incomeUnknown=true;assert.equal(researchListPrice(r),null);
 original.incomeUnknown=false;original.editionQalys=null;original.incomePathways=[pathway];
 assert.equal(researchListPrice(r),null,'Unknown health is not observed zero');
});
test('header time uses whole focused intervals, and duplicate/overlapping sessions fail',()=>{
 const {data,progress,r}=fixture();assert.equal(editionResearchEffort(data,r).label,'Research time: 15 min on GPT-6 Astra Light');
 data.sessions.push({...data.sessions[0],id:'overlap'});assert.throws(()=>validateEditionReports(data,progress),/overlapping/);
 data.sessions.pop();r.sessionIds.push('synthetic-session');assert.throws(()=>validateEditionReports(data,progress),/duplicate report research intervals/);
});
test('three-year expense mean excludes gaps, short periods and incomparable accounts',()=>{
 const {r}=fixture();r.annualExpenses=[2023,2024,2025].map(year=>({year,amount:100000,currency:'USD',periodMonths:12,comparable:true,entity:r.organization,accountingBasis:'accrual total expense',sourceId:'s1'}));assert.equal(expenseAverage(r),100000);
 r.annualExpenses[0].year=2022;assert.equal(expenseAverage(r),null);r.annualExpenses[0].year=2023;
 r.annualExpenses[0].periodMonths=6;assert.equal(expenseAverage(r),null);r.annualExpenses[0].periodMonths=12;
 r.annualExpenses[0].comparable=false;assert.equal(expenseAverage(r),null);r.annualExpenses[0].comparable=true;
 r.annualExpenses[0].entity='Different subsidiary';assert.equal(expenseAverage(r),null);r.annualExpenses[0].entity=r.organization;
 r.annualExpenses[0].accountingBasis='cash expenses';assert.equal(expenseAverage(r),null);
});
test('unestimated reports sort last and no edition inherits another edition report',()=>{
 const {data,r}=fixture();data.reports.push({...r,organization:'Unestimated',slug:'unestimated',model:{...r.model,scenarios:[]}});
 assert.deepEqual(reportsForEdition(data,'california').map(r=>r.organization),['Synthetic test organization','Unestimated']);assert.deepEqual(reportsForEdition(data,'usa'),[]);
});
