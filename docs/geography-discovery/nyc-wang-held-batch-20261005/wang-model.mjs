import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {incomeHealthyYearEquivalent} from '../../../lib/income-health-equivalence.mjs';
export const central={C:97126149,f:1,N:70000,a:.2,u:.02,t:.5,b:.3,g:.95,delay:0,discount:0,residualUtility:0,harmUtility:0,deathRate:0,survivalUtility:.8,survivalYears:5,householdsPerPatient:.5,Y:25000,incomeYears:.5,medicalSavings:0,netDisposablePayGain:0,medicalCost:0,transportCost:0,lostDisposablePay:0,positiveIndependentShare:.5,incomeKnown:true};
central.resourceShare=.2;
const years=(t,delay,r)=>{let v=0;for(let i=0;i<Math.ceil(t);i++)v+=Math.min(1,t-i)/(1+r)**(delay+i);return v;};
export function calculate(overrides={}){
 const p={...central,...overrides};
 for(const [k,v] of Object.entries(p))if(k!=='incomeKnown')assert.ok(Number.isFinite(v),k);
 for(const k of ['a','b','g','positiveIndependentShare','deathRate','survivalUtility','householdsPerPatient','resourceShare'])assert.ok(p[k]>=0&&p[k]<=1,k);
 assert.ok(p.C>0&&p.N>0&&p.f>0&&p.Y>0&&p.t>0&&p.incomeYears>0&&p.delay>=0&&p.discount>=0);
 for(const k of ['medicalSavings','netDisposablePayGain','medicalCost','transportCost','lostDisposablePay','harmUtility'])assert.ok(p[k]>=0,k);
 const population=p.N*p.a*p.b;
 const healthYears=years(p.t,p.delay,p.discount);
 const commonAlive=population*(1-p.deathRate);
 const households=p.N*p.resourceShare*p.b*(1-p.deathRate)*p.householdsPerPatient;
 const clinical=commonAlive*p.u*healthYears;
 const residual=commonAlive*p.residualUtility*healthYears;
 const harm=population*p.harmUtility*healthYears;
 const survival=population*p.deathRate*p.survivalUtility*years(p.survivalYears,p.delay,p.discount);
 const healthAll=clinical+residual+survival-harm;
 const costs=p.medicalCost+p.transportCost+p.lostDisposablePay;
 const gains=p.medicalSavings+p.netDisposablePayGain;
 assert.ok(costs<p.Y,'Household consumption must remain positive');
 // All burdens count at full weight; overlap discount applies only to gains.
 // Sequential log changes jointly equal log((Y-costs+gains)/Y) at share=1.
 // Applying positive share to the positive log preserves the full negative term.
 const incomeTerm=(before,gain,independentShare)=>households===0?0:incomeHealthyYearEquivalent({people:households,annualIncomeBeforeUSD:before,annualIncomeGainUSD:gain,years:p.incomeYears,causalShare:1,editionShare:1,independentShare,delayYears:p.delay,discountRate:p.discount});
 const negativeIncome=incomeTerm(p.Y,-costs,1);
 const positiveIncome=incomeTerm(p.Y-costs,gains,p.positiveIndependentShare);
 const incomeAll=p.incomeKnown?negativeIncome+positiveIncome:null;
 const totalAll=incomeAll===null?null:healthAll+incomeAll;
 const totalMSA=totalAll===null?null:totalAll*p.g;
 const cost=p.C*p.f;
 return {inputs:p,costUSD:cost,additionalEffectivePatientEquivalents:population,commonAlivePatientEquivalents:commonAlive,householdEquivalents:households,clinicalQalys:clinical*p.g,residualHealthyYears:residual*p.g,survivalQalys:survival*p.g,harmQalys:-harm*p.g,editionHealthQalys:healthAll*p.g,negativeIncomeHealthyYears:negativeIncome*p.g,positiveIncomeHealthyYears:positiveIncome*p.g,editionIncomeHealthyYears:incomeAll===null?null:incomeAll*p.g,allPopulationHealthyYearEquivalents:totalAll,editionHealthyYearEquivalents:totalMSA,price10USD:totalMSA!==null&&totalMSA>0?10*cost/totalMSA:null,priceStatus:totalMSA===null?'unknown':totalMSA>0?'positive':totalMSA===0?'no modeled net gain':'net harm',healthOnlyPrice10USD:healthAll>0?10*cost/(healthAll*p.g):null};
}
export const definitions=[
 ['central','Conditional reference; financial balance unresolved at neutral placeholder',{}],
 ['favorable','More effective care and persistence',{a:.4,u:.04,t:1,b:.6,g:1}],
 ['poor','Mostly substitute care',{f:1.25,a:.05,u:.005,t:.25,b:.1,g:.8}],
 ['zero-capacity','All gifts substitute funding',{b:0}],
 ['zero-clinical','No incremental clinical utility',{u:0}],
 ['weak-clinical','One quarter clinical utility',{u:.005}],
 ['short-duration','Quarter year gain',{t:.25}],
 ['low-additionality','Ten percent marginal financing',{b:.1}],
 ['outside-MSA','Twenty percent outside MSA',{g:.8}],
 ['delay','One year delay; three percent discount',{delay:1,discount:.03}],
 ['three-year-cost','Original annual-summary mean; not audited three-year mean',{C:(97126149+96968903+86144763)/3}],
 ['financial-upside','Hypothetical net saving and common-alive disposable pay',{medicalSavings:300,netDisposablePayGain:100,medicalCost:50,transportCost:50}],
 ['financial-downside','Added treatment/travel/lost disposable pay',{medicalCost:200,transportCost:100,lostDisposablePay:200}],
 ['low-income-cost','Same costs with lower baseline consumption and no household deduplication',{Y:12500,householdsPerPatient:1,medicalCost:200,transportCost:100,lostDisposablePay:200}],
 ['break-even-harm','Clinical harm exactly offsets clinical gain',{harmUtility:.02}],
 ['adverse','Clinical harm exceeds gain plus household burdens',{harmUtility:.03,medicalCost:200,transportCost:100,lostDisposablePay:200}],
 ['residual','Hypothetical separate common-alive wellbeing',{residualUtility:.005}],
 ['finite-survival','Hypothetical 0.01% deaths avoided among additional care; finite five years',{deathRate:.0001,discount:.03}],
 ['unknown-financial','Household balance cannot be estimated',{incomeKnown:false}],
 ['financial-only','Hypothetical resource relief without additional clinical benefit',{a:0,medicalSavings:300}]
];
export const scenarios=definitions.map(([id,label,p])=>({id,label,...calculate(p)}));
export function buildReport(){
 const initial=JSON.parse(fs.readFileSync(new URL('./wang-initial-diagnostic.json',import.meta.url),'utf8'));
 const out=structuredClone(initial);delete out.acceptance;
 out.stage='beta';out.updated='2026-10-05';
 out.summary.what=['CBWCHC provides multilingual medical, dental and mental-health care in Manhattan and Queens.','2025 reporting distinguishes70,000+patients from296,000+visits; neither establishes gift-caused health.','A conditional whole-recipient reference remains$24.34million per10NYC-MSA healthy-year equivalents; financial impact is unresolved.'];
 out.summary.reservations=['Clinical utility, persistence, patient residence and gift additionality remain unmeasured.','Public/insurance reimbursements and other providers make substitution material; an annual deficit does not establish marginal capacity.','Household medical/travel costs and disposable-pay gains could move combined welfare in either direction.'];
 out.sections.cost='Latest original recipient annual expense$97,126,149 is retained. The conditional clinical reference is70,000patients ×.20effective care beyond alternatives ×.02mean utility ×.5years ×.30gift additionality ×.95MSA residence=39.9MSA QALYs. Signed consumption is included at0as an unresolved neutral placeholder, not a finding of no effect; combined reference price is$24,342,393 per10healthy-year equivalents. Utility includes any mental, dental, chronic-care and symptom gains; these pathways are not separately stacked. Residual common-alive wellbeing, mortality and clinical harms are provisionally0and tested separately. No benefit continues beyond its finite duration. The full cost and scaled historical outputs are a recipient portfolio allocation, not an observed marginal gift production function. A$1,000gift corresponds to.721historical patient equivalents before adjustments or.043additional effective-care equivalents under the conditional allocation, not promised extra appointments.';
 out.sections.funding+='\n\nDeep review retains the latest original full expense. Original2024/2023annual summaries give$96,968,903/$86,144,763; their three-year mean$93,413,271.67is tested, not called an audited mean. The2023audit includes Healthview and eliminates internal rent: consolidated functional expense$86,144,763 versus operating-center standalone$86,810,288.2024/2025audit downloads returned403; current consolidation/audit detail is still missing. [Original2023audit](https://projects.propublica.org/nonprofits/download-audit?download=true&filename=2023-12-GSAFAC-0000036363)';
 out.sections.monitoring+='\n\nThe IMPACT depression trial supports a clinical pathway in depressed older adults, but its0–10quality-of-life scale is not a QALY and its protocol/population is not this recipient. Hepatitis-B antiviral trial evidence demonstrates disease-specific benefit but cannot identify incremental CBWCHC treatment starts or deaths avoided. Survival remains0centrally. [IMPACT original trial](https://jamanetwork.com/journals/jama/fullarticle/195599) [Original antiviral trial](https://pubmed.ncbi.nlm.nih.gov/15470215/)';
 out.sections.qualitative+='\n\n2025reported8%uninsured does not imply that8%alone receive additional benefit:70%+best served in non-English languages may face barriers despite insurance. Nor does it justify20%as measured. The old.20/.02/.5/.30clinical anchor survives only as an explicit conditional judgment; new evidence does not identify a better numerical point. Effective-care and financing substitution are different: the first asks what care adds versus another provider; the second asks what a gift adds versus public reimbursement/reserves/other donors. Both can be0. Screening quality and awards identify delivery rather than causal outcomes. A claim of cost effectiveness for a marginal unrestricted gift requires a specific capacity plan.';
 out.sections.income='Household welfare uses the audited signed logarithmic crosswalk in lib/income-health-equivalence.mjs:0.5×people×discounted years×log(after/before). Baseline$25,000annual consumption and half-year exposure are judgments used only for scenarios, not measured patient income. Costs comprise incremental medical spending, transport and lost disposable pay; positive resources comprise actual medical savings and common-alive net disposable-pay gains after taxes, benefits withdrawn and work costs. All negative costs count fully; only positive log gains receive.5independent share to limit overlap with clinical utility. The positive log uses baseline consumption after costs, preventing costs being erased by overlap adjustment. No gross wages, ordinary earnings of additional survivors, public-budget savings, fee discounts versus posted charges, or duplicate value for already-counted free/purchased medical treatment is added. Financial-upside and financial-downside cases are hypothetical balances; unknown-financial has no combined price. [Current payment/sliding-fee route](https://www.cbwchc.org/health-insurance)';
 out.model={version:'nyc-cbwchc-beta-health-income-v1',costScope:initial.model.costScope,geographicAttribution:initial.model.geographicAttribution,counterfactual:initial.model.counterfactual,attribution:'Whole-recipient annual resource allocation. Additional clinical utility beyond alternatives and marginal gift financing are separate conditional factors. No measured donor slots.',formula:'P=N*a*b; Qhealth=P*discountedYears(t)*(u+residualUtility-harmUtility)+P*deathRate*survivalUtility*discountedYears(survivalYears); Ineg=HYE(Y,-costs,share1); Ipos=HYE(Y-costs,gains,positiveShare); totalMSA=g*(Qhealth+Ineg+Ipos); price10=10*C*f/totalMSA only if positive; unknown or nonpositive has no positive price.',uncertainty:'Very weak conditional reference, not measured causal impact. All benefit/additionality/income/geographic coefficients are judgments; unknown consumption remains visibly unresolved, not proven zero. Scenario endpoints are inspectable judgments rather than statistical intervals.',nativeOutcomes:'Additional effective-care equivalents among annual patients; finite clinical and separate residual/common-alive welfare; finite survival only in a hypothetical stress test.',inputs:Object.entries(central).map(([name,value])=>({name,value,unit:name==='incomeKnown'?'conditional evaluability flag':'See executable parameter documentation in evidence/model artifact',basis:['C','N'].includes(name)?'observed':'judgment',rationale:['C','N'].includes(name)?'Original2025annual summary; patient count lower threshold.':'Explicit scenario assumption; not observed recipient-specific causal evidence.',sourceIds:['C','N'].includes(name)?['annual25']:[]})),scenarios:scenarios.map(s=>({...s,allPopulationQalys:s.allPopulationHealthyYearEquivalents,editionQalys:s.editionHealthyYearEquivalents,assumptions:JSON.stringify(s.inputs)})),sensitivity:['Zero capacity or zero clinical gain can remove all central benefit.','Full household burden can reduce net welfare; positive resources are overlap-limited.','Clinical harm.02for half a year offsets the clinical reference; larger harm yields net harm.','Unknown-financial case has no combined price; the central financial0is a placeholder.'],missingInputs:[...initial.model.missingInputs,'Signed household balance after insurance, taxes, benefits, transport, extra medications and lost pay; overlap with health utility.','Controlled diagnosis-specific clinical utility, completion and finite duration; adverse effects and survival baseline.']};
 out.annualExpenses=[{...initial.annualExpenses[0]},{year:2024,amount:96968903,currency:'USD',periodMonths:null,comparable:false,entity:'Annual summary, consolidation unverified',accountingBasis:'Original annual-report financial summary, not verified audit',sourceId:'annual24'},{year:2023,amount:86144763,currency:'USD',periodMonths:12,comparable:false,entity:'CBWCHC and controlled Healthview consolidated',accountingBasis:'Original consolidated audit functional expense includes depreciation and eliminates internal rent',sourceId:'audit23'}];
 out.sources.push(...[['annual24','Original2024annual report','https://cdn.prod.website-files.com/65525600ad11f5d8bc8c3450/68530f99f9823da8cf46618a_2024%20CBWCHC%20Annual%20Report_Web.pdf'],['audit23','Original2023consolidated audit','https://projects.propublica.org/nonprofits/download-audit?download=true&filename=2023-12-GSAFAC-0000036363'],['impact','IMPACT randomized depression trial','https://jamanetwork.com/journals/jama/fullarticle/195599'],['hbv','Original antiviral progression trial','https://pubmed.ncbi.nlm.nih.gov/15470215/'],['payment','Current insurance and sliding-fee services','https://www.cbwchc.org/health-insurance']].map(([id,title,url])=>({id,title,url,publisher:id.startsWith('annual')?'Charles B. Wang Community Health Center':'Original primary source',published:null,retrieved:'2026-10-05'})));
 out.sections.income+=' Income uses household equivalents, not visits or every patient as a separate household. The .5 households-per-patient deduplication factor is a judgment; scenarios must supply actual unique affected households before claiming measured consumption impact. Clinical and residual utility exclude the hypothetical additional survivors; ordinary additional-survivor income receives no credit. The survival scenario begins at the shared benefit delay and ends after five years.';
 out.model.formula='P=N*a*b; commonAlive=P*(1-deathRate); households=commonAlive*householdsPerPatient; clinical=(commonAlive*u)*discountedYears(t); residual=(commonAlive*residualUtility)*discountedYears(t); harm=(P*harmUtility)*discountedYears(t); survival=P*deathRate*survivalUtility*discountedYears(survivalYears); health=clinical+residual+survival-harm; Ineg=HYE(households,Y,-costs,independentShare1); Ipos=HYE(households,Y-costs,gains,positiveIndependentShare); totalMSA=g*(health+Ineg+Ipos); price10=10*C*f/totalMSA only if positive. Unknown income has no combined price. Each finite stream uses the same delay and annual discount.';
 out.historical={historicalAlphaModel:structuredClone(initial.model),historicalAlphaScenarioOutputs:structuredClone(initial.model.scenarios),initialDiagnosticArtifact:'nyc-wang-beta-20261005-initial-diagnostic.json'};
 const units={C:'USD full-recipient annual expense',f:'forward cost multiplier',N:'annual distinct-patient lower-threshold proxy',a:'effective care beyond alternatives, share of patients',u:'clinical benefit utility per common-alive additional effective patient',t:'years of clinical/residual/harm exposure',b:'gift-financing marginal capacity share',g:'NYC-MSA resident benefit share',delay:'years before benefit starts',discount:'annual discount rate',residualUtility:'independent common-alive wellbeing utility',harmUtility:'adverse clinical utility per additional effective patient',deathRate:'hypothetical fraction whose death is avoided',survivalUtility:'healthy-year quality weight of additional survival',survivalYears:'finite years of additional survival',householdsPerPatient:'unique affected households per common-alive patient equivalent',Y:'USD annual household baseline consumption',incomeYears:'finite years of household resource-flow change',medicalSavings:'USD annual household cash medical savings',netDisposablePayGain:'USD annual common-alive household disposable-pay gain',medicalCost:'USD annual incremental household medical burden',transportCost:'USD annual incremental household transport burden',lostDisposablePay:'USD annual household lost disposable-pay burden',positiveIndependentShare:'independent share of positive log resource benefit',incomeKnown:'scenario treats household financial inputs as evaluable; does not assert measured evidence'};
 const rationales={a:'No alternative-provider comparison. Insured language barriers can matter, but 8% uninsured and 70%+ non-English language need do not identify 20% additional effective care.',u:'Finite conditional portfolio utility prior; trials support selected treatment mechanisms and nulls/harms, not this recipient mean. Includes clinical mental-health effects, not stacked with separate depression benefits.',t:'Half-year finite conditional window; annual patient count gives neither severity nor completed-treatment persistence. Chronic prevention may have delayed gains rather than immediate utility.',b:'No measured unrestricted-gift elasticity. Public reimbursement, reserves and alternative donors continue; deficit and gift appeal do not establish 30% marginal capacity.',g:'Clinic sites are local, but beneficiary residence is not reported at 22-county MSA granularity.',residualUtility:'No independent nonclinical wellbeing effect identified after clinical utility and financial overlap; zero placeholder with separate sensitivity.',harmUtility:'No recipient portfolio harm rate; zero placeholder does not establish no adverse effects. Utility is modeled as benefit before this separate harm term.',deathRate:'No marginal eligible starts, counterfactual mortality or sustained-care evidence; central zero avoids importing selected disease trial mortality across all patients.',householdsPerPatient:'Household deduplication judgment, not measured. Child/adult patients and multiple family members cannot each receive the same household savings independently.',Y:'Scenario baseline household disposable consumption, not gross wage or reported income; patient poverty distribution does not measure this value.',incomeKnown:'Central zero is an unresolved neutral reference. Unknown-financial explicitly leaves combined result null.',positiveIndependentShare:'Half of positive log material benefit retained to limit health/wellbeing overlap; full negative burdens retained.'};
 out.model.inputs=out.model.inputs.map(x=>({...x,unit:units[x.name],rationale:rationales[x.name]||x.rationale}));
 const spaced=s=>s.split(/(https?:\/\/[^\s)]+)/g).map(part=>part.startsWith('https://')||part.startsWith('http://')?part:part.replace(/([A-Za-z])(?=\d|\$|\.\d)/g,'$1 ').replace(/(\d)(?=[A-Za-z])/g,'$1 ').replace(/([%+])(?=[A-Za-z])/g,'$1 ').replace(/(^|[^\d])\.(\d+)/g,'$1'+'0.$2').replace(/\s*×\s*/g,' × ').replace(/\s*=\s*/g,' = ')).join('');
 out.summary.what=['CBWCHC delivers multilingual primary, dental and mental-health care in Manhattan and Queens.','Its clinical teams provide prevention, chronic disease management, therapy and coordinated specialty referrals.','Language access, insurance enrollment help and sliding fees support patients facing barriers to affordable care.'];
 for(const field of ['what','strengths','reservations'])out.summary[field]=out.summary[field].map(spaced);
 for(const [k,v] of Object.entries(out.sections))out.sections[k]=spaced(v);
 out.sections.income=out.sections.income.replace('audited signed logarithmic','shared signed logarithmic');
 for(const s of out.sources)s.title=spaced(s.title);
 out.sections.income+=' The resource-effect cohort is independent of additional clinical care: annual patients × resourceShare × gift-financing share × common-alive share × household deduplication. The .2 resource share is a conditional scenario judgment, not measured. Financial relief can occur even where another provider would deliver equivalent clinical care; the financial-only case checks this distinction.';
 out.model.formula=out.model.formula.replace('households=commonAlive*householdsPerPatient','households=N*resourceShare*b*(1-deathRate)*householdsPerPatient');
 out.model.inputs.find(x=>x.name==='resourceShare').unit='share of annual patients with incremental household resource effect';
 out.model.inputs.find(x=>x.name==='resourceShare').rationale='No measured affected-household distribution. Independent of clinical effective-care share so insurance/fee relief need not imply an additional clinical outcome.';
 for(const s of out.model.scenarios){
  s.editionQalys=s.editionHealthQalys;
  s.allPopulationQalys=s.editionHealthQalys/s.inputs.g;
  s.incomeUnknown=!s.inputs.incomeKnown;
  const p=s.inputs,households=s.householdEquivalents,costs=p.medicalCost+p.transportCost+p.lostDisposablePay,gains=p.medicalSavings+p.netDisposablePayGain;
  const common={people:households,years:p.incomeYears,causalShare:1,editionShare:p.g,delayYears:p.delay,discountRate:p.discount,basis:'judgment',sourceIds:['payment','oregon'],counterfactual:'Existing insurance, alternative clinical providers, public reimbursement and other donors continue; only incremental household resources count.'};
  s.incomePathways=households===0||s.incomeUnknown?[]:[
   {...common,annualIncomeBeforeUSD:p.Y,annualIncomeGainUSD:-costs,independentShare:1,rationale:'Full incremental household medical, travel and lost disposable-pay burdens. No overlap discount on negatives; values are scenario judgments, not measured household effects.'},
   {...common,annualIncomeBeforeUSD:p.Y-costs,annualIncomeGainUSD:gains,independentShare:p.positiveIndependentShare,rationale:'Actual cash medical savings plus common-alive net disposable-pay gains on the post-cost baseline. Positive log benefit is overlap-limited; no gross wages, ordinary extra-survivor earnings or duplicate free treatment value.'}
  ];
 }
 out.sections.income=spaced(out.sections.income);
 out.model.inputs=out.model.inputs.map(x=>({...x,rationale:spaced(x.rationale),unit:spaced(x.unit)}));
 out.sessionIds=['c0720d50-af1c-41ea-b088-7fb1e17735d0','80c790a3-a2d6-45db-9905-180a2c91dcdd'];out.timeCoverage='partial';return JSON.parse(JSON.stringify(out));
}
export function tests(){
 assert.equal(calculate().editionHealthyYearEquivalents,39.9);
 assert.equal(calculate().price10USD,24342393.233082708);
 assert.equal(calculate({b:0}).editionHealthyYearEquivalents,0);
 assert.equal(calculate({u:0}).editionHealthyYearEquivalents,0);
 assert.equal(calculate({harmUtility:.02}).editionHealthyYearEquivalents,0);
 assert.ok(calculate({harmUtility:.03}).editionHealthyYearEquivalents<0);
 assert.equal(calculate({incomeKnown:false}).price10USD,null);
 assert.ok(calculate({medicalCost:200}).editionIncomeHealthyYears<0);
 assert.ok(calculate({medicalSavings:200}).editionIncomeHealthyYears>0);
 const p={medicalSavings:400,medicalCost:100,positiveIndependentShare:1};
 const net=incomeHealthyYearEquivalent({people:2100,annualIncomeBeforeUSD:25000,annualIncomeGainUSD:300,years:.5,editionShare:.95});
 assert.ok(Math.abs(calculate(p).editionIncomeHealthyYears-net)<1e-12);
 assert.equal(calculate({...p,positiveIndependentShare:0}).editionIncomeHealthyYears,calculate({medicalCost:100}).editionIncomeHealthyYears);
 assert.ok(calculate({delay:1,discount:.03}).editionHealthQalys<39.9);
 const report=buildReport();assert.equal(report.model.scenarios.length,20);
 for(let i=0;i<scenarios.length;i++)assert.deepEqual(report.model.scenarios[i].editionHealthyYearEquivalents,calculate(definitions[i][2]).editionHealthyYearEquivalents);
 assert.throws(()=>calculate({medicalCost:25000}));
 assert.ok(calculate({a:0,medicalSavings:300}).editionIncomeHealthyYears>0);
 assert.deepEqual(report.historical.historicalAlphaModel,JSON.parse(fs.readFileSync(new URL('./wang-initial-diagnostic.json',import.meta.url),'utf8')).model);
 for(const s of report.model.scenarios){
  assert.equal(s.editionQalys,s.editionHealthQalys);
  const inc=s.incomeUnknown?null:s.incomePathways.reduce((sum,p)=>sum+incomeHealthyYearEquivalent(p),0);
  if(inc!==null)assert.ok(Math.abs(inc-s.editionIncomeHealthyYears)<1e-12);
  const price=inc!==null&&s.editionQalys+inc>0?10*s.costUSD/(s.editionQalys+inc):null;
  if(price===null)assert.equal(s.price10USD,null);else assert.ok(Math.abs(price-s.price10USD)<1e-6);
 }
 return {passed:20,scenarios:20,engineReportEquality:true,incomePathwayEquality:true,healthOnlyQalyFields:true};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 if(process.argv[2]==='report')console.log(JSON.stringify(buildReport(),null,2));
 else if(process.argv[2]==='test')console.log(JSON.stringify(tests()));
 else if(process.argv[2]==='compact')console.log(JSON.stringify(scenarios.map(s=>({id:s.id,health:s.editionHealthQalys,income:s.editionIncomeHealthyYears,total:s.editionHealthyYearEquivalents,price:s.price10USD})),null,2));
 else console.log(JSON.stringify(scenarios,null,2));
}
