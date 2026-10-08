import prior from '../data/san-francisco/clinic-portfolio-report.json' with {type:'json'};
import {calculate,central,groups,cases} from './clinic-calibrated-model.mjs';
const r=calculate();
const money=x=>x===null?'No finite positive price':'$'+(x/1e6).toFixed(2)+'M';
const reasons=[
 'Free primary care, dental treatment and counseling can relieve symptoms and improve functioning for uninsured adults.',
 'Volunteer clinical work and donated services may make additional care possible without buying every input at market prices.',
 'A range of services can address several practical barriers to care, including prescriptions, referrals and food access.'
];
const reservations=[
 'The additional care an unrestricted donation would enable is not measured; course costs, completion and patient alternatives are planning assumptions.',
 'Most clinical utilities and the transfer of older hypertension evidence to current patients are uncertain. The survival tail is particularly influential.',
 'Travel, medicines and lost paid time can offset household benefits. Patient residence, linked outcomes and outside resource costs need better evidence.'
];
export const clinicCalibratedReport={...prior,
 program:'Free primary care, dental treatment, counseling and prescription support',
 calibrationDate:'2026-10-03',modelVersion:'clinic-calibrated-health-resources-2026-10-03',
 summaryReasons:reasons,summaryReservations:reservations,
 nutshell:{headline:'Free care for adults who would otherwise struggle to obtain treatment.',
 body:'Our conditional estimate is '+money(r.donorBayPrice10)+' per better life for Bay Area recipients and '+money(r.donorSFPrice10)+' for SF recipients. A donation can support clinical courses and household access, not just abstract health units: in the illustrative $10,000 comparison, the model offers '+r.native.reduce((a,x)=>a+x.offeredPackages,0).toFixed(2)+' courses across seven predominant needs, with '+r.native.reduce((a,x)=>a+x.completedCare,0).toFixed(2)+' completed courses before distinguishing otherwise-purchased, equivalent-free and genuinely additional care. These are modeled courses, not verified purchasable slots. Signed household-resource effects are negative centrally, while clinical effects are positive.',
 whyItMayWork:reasons[0],whyWeAreCautious:reservations[0],recommendationBlocker:'Confirm what additional courses donations can fund, their fully loaded costs and unique patient outcomes. Current operations and financial statements establish an organization, not a verified marginal funding opportunity.'},
 programSection:{...prior.programSection,
 body:'Clinic by the Bay provides free medical and dental care to uninsured adults in San Francisco and San Mateo County. Its services include primary care, counseling, prescription assistance and referrals, alongside help accessing food. Dental care includes cleaning, fillings and simple extractions, rather than root canals, dentures or implants.',
 boundary:'This comparison keeps the complete illustrative gift in the denominator and allocates it once across seven predominant needs. It does not value every organizational activity or presume the clinic can accept a large gift at constant cost.'},
 summary:[{label:'BAY AREA',value:money(r.donorBayPrice10),detail:'Conditional cost per ten combined health and household-resource equivalents.'},{label:'SAN FRANCISCO',value:money(r.donorSFPrice10),detail:'Separate 70% SF attribution prior; not added to the Bay total.'},{label:'HEALTH ONLY — SF',value:money(r.healthSFPrice10),detail:'Household costs make the combined comparison less favorable.'}],
 model:{
 headline:'A donation supports offered care; completion, patient alternatives and lasting benefit determine its impact.',
 body:'GiveBetter sees a plausible benefit from care that relieves untreated symptoms and reduces clinical risks. We estimate '+money(r.donorBayPrice10)+' per better life in the Bay Area under the current conditional assumptions. The model first buys fully loaded offered courses, then allows for noncompletion, repeat people and care recipients would obtain elsewhere. Dental, mental-health, acute, chronic-medication, blood-pressure, referral and food courses have separate effects and costs. Short-lived symptom benefits fade as comparison patients obtain care or recover. For blood-pressure treatment, one paid active year changes survival hazards after a three-month latency; hazards then return to the same baseline, and the surviving difference is followed over a finite twenty-year comparison. This is not twenty years of funded treatment.',
 comparisonUnit:'health years and income-welfare-equivalent years',
 equation:{label:'Current conditional estimate',expression:'10 × donor dollars ÷ (local clinical health years + signed local household-resource equivalents)',result:'Per $10,000: Bay health 0.0067478 + resources −0.0010305 = 0.0057173; '+money(r.donorBayPrice10)+' per better life.'},
 inputColumnLabel:'Planning assumptions',
 inputs:[
 {key:'funding',label:'Gift-to-additional-course response',confidence:'Judgment',best:'35%',range:'15%–70% stresses',basis:'No published marginal funding ledger establishes additional courses per dollar. All gift costs remain in the numerator.'},
 {key:'courses',label:'Fully loaded offered-course costs',confidence:'Judgment',best:'$800–$2,500',range:'Half/double-cost tests',basis:Object.entries(groups).map(([k,g])=>k+': $'+g.cost).join('; ')+'. Costs precede completion and include support/failure rather than dividing annual expense by visits.'},
 {key:'alternatives',label:'Completed-care alternatives',confidence:'Judgment',best:'10% purchaser; 25% equivalent free; 65% unmet',range:'All purchaser/free tests',basis:'Only unmet care earns incremental clinical benefits; actual otherwise-paid expenditure can create purchaser savings.'},
 {key:'resources',label:'Household resources and access burden',confidence:'Judgment',best:'$25,000 baseline; $20 travel; 40% lose $20 net pay',range:'Higher burdens and ±$300 recovery-pay tests',basis:'Actual incremental spending and after-tax/benefit-adjusted pay, not leisure-time valuations or baseline wages of saved lives.'},
 {key:'geography',label:'Recipient residence',confidence:'Judgment',best:'Bay 100%; SF 70%',range:'SF 50% test',basis:'The service footprint does not identify residence; health and resource attribution can be varied independently.'},
 {key:'bp',label:'Blood-pressure survival transfer',confidence:'Judgment',best:'25% transfer; one active year; 20-year comparison',range:'Null/adverse effect, three active years, five-year tail',basis:'Older stepped-care evidence is not a directly measured modern free-clinic contrast; no separate saved-life wages or repeated mortality benefit.'}
 ],
 giftHeading:'Assumption tests, not confidence limits',
 sensitivity:['central','lowFunding','higherBurden','doubleSupportCost','positiveWork','negativeWork','shortBPtail','mortalityNull','mortalityAdverse','unknownUniqueZero'].map(id=>{const x=calculate(cases[id]);return{case:id,headline:money(x.donorBayPrice10)+' Bay',detail:id==='unknownUniqueZero'?'Unavailable reach does not become an observed zero; the combined value is unknown.':'Change only the explicitly named inputs; inspect the full calculator for signed components.'};}),
 uncertaintyBoundary:'The revised coefficients are independently reconsidered planning judgments, not a locally estimated posterior or a confirmed donation quote. Native courses, preferences, catchup, funding and survival assumptions can materially change the price.',
 fundingBoundary:'Annual accrual costs, volunteer complements and an illustrative 1.75× gross-resource envelope are distinct from marginal donor costs. Comprehensive external resources and unmodeled portfolio value remain unknown.',
 incomeLedger:{paragraphs:[
 'We include household resources using the Coefficient Giving health/income crosswalk: 0.5 times the log change in annual disposable resources, with the modeled people, timing and duration. These are welfare equivalents, not measured clinical QALYs. Buyer savings count actual payments avoided; unmet patients are not credited with bills they would never have paid.',
 'Travel and actual lost pay attach to offered households, including unsuccessful care. Medicines add net first-year costs after assistance. Food support counts incremental restricted consumption once, not donated retail value plus a second freed household budget. Positive monetary flows retain 50% to allow for possible overlap with clinical/financial-stress value; negative flows are fully debited.',
 'Recovery earnings are zero centrally as an explicit uncertain-sign planning judgment, with positive and negative tests. Positive restored pay is confined to common-alive functional responders and their clinical horizon/catchup. It does not count ordinary wages of additional survivors. Negative work burdens remain independently signed rather than being reduced by positive treatment response.',
 'Per $10,000 the Bay household-resource term is −0.0010305 equivalents, separate from 0.0067478 clinical years. Acquisition costs and medicine expenses can outweigh otherwise-paid savings and food support. Unknown assumptions propagate as unknown, while genuinely absent funding or exposure can establish a zero.'
 ],scenarios:[]}
 },
 comparisonBridge:{headline:'Historical estimate — retained for comparison, not the current ranking',
 body:'The previous report gave a subjective weighted clinical price of $2.00M Bay/$2.86M SF. Its unweighted clinical center was $7.98M Bay/$11.40M SF. These are different quantities: a favorable scenario with 15% weight supplied 82.6% of expected health. The new estimate does not reuse those weights or allocate income inside the old total. It independently changes course costs, need mix, completion, alternatives, finite clinical effects and signed household resources.',
 equation:prior.model.equation,inputs:prior.model.inputs,sensitivity:prior.model.sensitivity,
 boundary:'All 34 original scenarios and three weight stresses remain unchanged in the historical calculator and API. The old report and evidence are preserved; neither old publication nor numerical consistency proves current empirical impact.'},
 reservations,excludedBenefits:[...prior.excludedBenefits,'Ordinary earnings of additional survivors; unverified secondary activities and complete outside resource costs.'],
 sources:[...prior.sources,{publisher:'Coefficient Giving',title:'Cost-effectiveness and health/income comparison',url:'https://coefficientgiving.org/research/cost-effectiveness/',published:'Current framework',retrieved:'2026-10-02',sourceType:'Welfare crosswalk; not local outcome evidence'}]
};
