import CharityResearchReport,{type CharityReportContent} from '@/components/CharityResearchReport';
import data from '@/data/san-francisco/ymca-dpp-cea-v1.json';
import {diabetesPreventionModel} from '@/lib/large-bay-impact-model.mjs';
export const metadata={title:'YMCA SF: diabetes prevention | Market for Impact'};
const money=(n:number|null)=>n===null?'No positive price':new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
export default function Page(){
 const cases=data.scenarios.map(s=>({s,r:diabetesPreventionModel(s)})),central=cases[1];
 const content:CharityReportContent={
 organization:data.organization,program:data.program,eyebrow:'SAN FRANCISCO · ADULT HEALTH',published:'7 September 2026',modelVersion:data.version,
 nutshell:{headline:'A credible weight-loss program, but not a leading donation under our central health model.',
 body:<>Our best guess is <strong>{money(central.r.costPerTenQalys)} per better life—10 incremental QALYs</strong>. A favorable scenario reaches about $80,000, but requires both a low price and sustained health benefits. This is a conditional SF-resident cohort, not the impact of unrestricted YMCA giving. <a href="/api/sf-ymca-model">Inspect the model →</a></>,
 whyItMayWork:'An accessible coached group program can help eligible adults change diet and activity, producing modest additional weight loss.',
 whyWeAreCautious:'Weight loss is supported by an external randomized trial; the conversion into health utility is observational. A separate prospective study found no clear incremental QALY gain.',
 recommendationBlocker:'We need a genuinely additional SF cohort, a complete marginal budget and evidence that available payer-funded places cannot meet the same need.'},
 summary:[{label:'BEST GUESS',value:money(central.r.costPerTenQalys),detail:'USD per 10 incremental QALYs; very low confidence'},
 {label:'POSITIVE SCENARIOS',value:money(cases[0].r.costPerTenQalys)+'–'+money(cases[2].r.costPerTenQalys),detail:'Joint assumptions, not confidence bounds; null or harm possible'},
 {label:'UNIT',value:'One adult offered a place',detail:'Includes nonattendance and noncompletion; not a completer-only result'},
 {label:'FUNDING ROOM',value:'Unverified',detail:'No current additional-cohort donation offer established'}],
 programSection:{body:'YMCA describes a year-long, 25-session program for adults at risk of diabetes, in groups of 8–15 with a trained coach. Membership is not required. Local cohort listings establish delivery, not unused capacity or a funding gap. SFHSS describes a related 26-session funded partnership; we do not silently combine the two doses.',
 steps:[{title:'Identify additional eligible adults',detail:'Specify an SF-resident cohort and compare with existing covered programs, self-payment and other charitable support.'},
 {title:'Offer the complete year',detail:'Budget coaching, preparation, recruitment, access, materials and failed recruitment—not merely attended classes.'},
 {title:'Measure the difference',detail:'Track weight, preference-based health, attrition and harms against actual alternative care.'}],boundary:'This is an adult diabetes-prevention model, not an estimate for YMCA youth programs, membership, camps or the whole organization.'},
 model:{headline:money(central.r.costPerTenQalys)+' per 10 QALYs',body:'Central: $600 per offer, 2.3 kg additional loss, .0014 utility per kg, .75 causal/local transfer and .5 funding additionality. Annual-average retention [.5, 1, .75, .25] integrates onset and decay with 3% discounting, giving '+central.r.equivalentYears.toFixed(4)+' equivalent years. Persistence after the paid year assumes no additional booster treatment; any necessary booster must add cost.',
 equation:{label:'DOLLARS PER BETTER LIFE',expression:data.formula,result:money(central.r.costPerTenQalys)},
 inputs:Object.entries(central.s).filter(([key])=>key!=='name').map(([key,value])=>({key,label:key,confidence:['extraKg','utilityPerKg'].includes(key)?'External source anchor; causal transfer uncertain':'Analyst judgment',best:JSON.stringify(value),range:cases.map(c=>JSON.stringify(c.s[key as keyof typeof c.s])).join(' / '),basis:'Favorable / central / pessimistic. Retention is an annual-average curve, not another lifetime multiplier. Costs are constructed, not quotes.'})),
 giftHeading:'What would an additional program place require?',
 sensitivity:cases.map(c=>({case:c.s.name,headline:money(c.r.costPerTenQalys)+' per 10 QALYs',detail:c.r.netQalys.toPrecision(4)+' incremental QALY per offer; '+money(c.r.maximumCostFor100k)+' maximum cost to reach $100,000 per 10 QALYs under this health scenario.'})),
 uncertaintyBoundary:'No causal utility gain, no persistence or complete replacement of existing finance gives no positive impact price. Extra injury, burden or disordered-eating harm could make net health negative. No unmodeled lifetime diabetes-prevention credit is added.',
 fundingBoundary:'Constructed $600: 25 sessions × 2 paid staff-hours × $65 loaded/hour ÷ 10 offers = $325, plus $125 coordination/materials and $150 recruitment/access. All allocations are judgments and must cover failed uptake. An illustrative resource ledger adds $375 participant time and $100 screening/clinical support: $1,075 before travel, diet or exercise time. This is not a complete societal incremental cost. Existing SFHSS and possible insurance-funded access may substitute for donations; YMCA Medi-Cal participation is unverified.'},
 evidence:[{key:'trial',design:'Ackermann 2015 randomized YMCA offer trial',population:'509 low-income Indianapolis adults with elevated glucose',result:'2.3 kg additional weight loss at 12 months; 95% CI 1.1–3.4 kg.',transfer:'The offer effect already includes uptake. Do not substitute the larger completer estimate or apply attendance again.'},
 {key:'utility',design:'Ackermann 2009 adjusted observational association',population:'Adults in the Diabetes Prevention Program',result:'5 kg loss associated with .007 SF-6D improvement.',transfer:'The .0014 utility/kg bridge requires causality and persistence assumptions; it is not a randomized health effect.'},
 {key:'null',design:'Kuo prospective nonrandomized NDPP comparison',population:'575 enrollees and 5,373 nonenrollees in an insured workforce',result:'Adjusted two-year QALY difference −.001, 95% CI −.022 to .019.',transfer:'Pooled delivery channels and confounding limit transfer. This substantive null challenges the positive utility bridge.'}],
 reservations:['The favorable sub-$100K result requires both cheap delivery and sustained effects; neither alone is enough.','Program-directed giving does not establish an accepted incremental SF-DPP restriction.','Better evidence is needed on utility and actual extra participation, not just organizational scale.'],
 excludedBenefits:['Lifetime diabetes or mortality gains','Child health and YMCA youth-program effects','Healthcare savings treated as donor cash','Unpriced recurring booster treatment'],sources:data.sources};
 return <CharityResearchReport content={content}/>;
}
