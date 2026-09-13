import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateEditionReports,reportPrice,formatEditionMoney,expenseAverage,editionResearchEffort,reportsForEdition,editionReportPath} from '../lib/geography-reports.mjs';
const read=path=>JSON.parse(readFileSync(new URL('../'+path,import.meta.url)));

// Synthetic fixtures live only in tests; never published or counted as research.
function fixture(){
 const session={id:'synthetic-session',organizationId:'org:test',workerId:'test-worker',stage:'alpha',phase:'research',startedAt:'2026-09-13T10:00:00Z',endedAt:'2026-09-13T10:15:00Z',evidence:'scripts/geography-reports.test.mjs',model:{id:'gpt-6-astra',name:'GPT-6 Astra Light',reasoningEffort:'low',evidence:'Synthetic test assignment'}};
 const r={edition:'california',boundaryVersion:'US-CA-state-v1',organizationId:'org:test',slug:'synthetic-only',organization:'Synthetic test organization',program:'Testing only',published:'2026-09-13',updated:'2026-09-13',stage:'alpha',donationUrl:null,acceptance:{status:'accepted',evidence:'Synthetic test, not real acceptance'},summary:{what:['A.','B.','C.'],strengths:['A','B','C'],reservations:['A','B','C']},sections:{what:'Text',monitoring:'Text',qualitative:'Text',cost:'Text',funding:'Text'},sources:[{id:'s1',title:'Synthetic',publisher:'Test',url:'https://example.com/',published:null,retrieved:'2026-09-13'}],model:{version:'test',costScope:'Test',geographicAttribution:'10 of20 test QALYs in CA',formula:'10 * cost / edition QALYs',counterfactual:'Test',attribution:'Test',uncertainty:'Test',nativeOutcomes:'Test care',inputs:[{name:'Synthetic cost',value:100000,unit:'USD',basis:'judgment',rationale:'Test only',sourceIds:[]}],scenarios:[{id:'central',label:'Synthetic central',costUSD:100000,allPopulationQalys:20,editionQalys:10,assumptions:'Test only'}],sensitivity:['Synthetic sensitivity'],missingInputs:[]},annualExpenses:[],timeCoverage:'complete',sessionIds:['synthetic-session']};
 const progress={editions:[{id:'california',boundaryVersion:r.boundaryVersion,selectedAlphaIds:['org:test'],alphaCohortIds:['org:test'],betaIds:[],alphaPublished:1,betaAcceptedPublished:0}]};
 return {data:{schemaVersion:1,sessions:[session],reports:[r]},progress,r};
}
test('published registry matches accepted progress without mock records',()=>validateEditionReports(read('data/geography-reports.json'),read('docs/geography-progress.json')));
test('price uses edition denominator, not global benefit; format and routes match contract',()=>{
 const {data,progress,r}=fixture();validateEditionReports(data,progress);
 assert.equal(reportPrice(r),100000);assert.equal(formatEditionMoney(56000),'$56K');assert.equal(formatEditionMoney(1400000),'$1.4M');
 assert.equal(editionReportPath(r),'/california/charities/synthetic-only');
 r.model.scenarios[0].editionQalys=0;assert.equal(reportPrice(r),null);
 r.model.scenarios[0].editionQalys=-1;assert.equal(reportPrice(r),null);
 r.model.scenarios[0].editionQalys=null;assert.equal(reportPrice(r),null);
});
test('unestimated needs blockers; observed inputs need sources; stage and cohort are checked',()=>{
 const nullCase=fixture();nullCase.r.model.scenarios[0].editionQalys=null;assert.throws(()=>validateEditionReports(nullCase.data,nullCase.progress),/blocking inputs/);
 let {data,progress,r}=fixture();r.model.scenarios=[];assert.throws(()=>validateEditionReports(data,progress),/blocking inputs/);r.model.missingInputs=['Unknown additional care'];validateEditionReports(data,progress);
 r.model.inputs[0].basis='observed';assert.throws(()=>validateEditionReports(data,progress),/source/);r.model.inputs[0].sourceIds=['s1'];validateEditionReports(data,progress);
 data.sessions[0].model.reasoningEffort='medium';assert.throws(()=>validateEditionReports(data,progress),/Wrong author model/);data.sessions[0].model.reasoningEffort='low';
 progress.editions[0].selectedAlphaIds=[];assert.throws(()=>validateEditionReports(data,progress),/cohort/);
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
