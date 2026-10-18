// Year Up United USA in-depth review calculator (2026-10-18).
// Reproduces every scenario in report.json from the inputs below. Run:
//   node docs/geography-discovery/usa-year-up-beta-20261018/calculate.mjs
// Income is converted with the site's shared log-income comparison; health is
// zero because the trial found no effect on self-assessed health or coverage.
import {incomeHealthyYearEquivalent} from '../../../lib/income-health-equivalence.mjs';

export const inputs={
 cohort:100, // illustrative cohort of additional participants; costs scale with it
 // Whole-organization cost: CY2023 Form 990 total expenses / judged annual participants.
 totalExpense2023:194225512,
 participantsPerYear:4000,
 // PACE-evaluated program cost (2013-14 dollars) and the philanthropic share of its net cost.
 paceCostPerParticipant2014:28280,
 pacePhilanthropyNetCost2014:9960,
 cpi2014to2025:1.36, // judgment: approximate CPI-U change mid-2014 to 2025
 // Treatment-control annual earnings impacts, NDNH wage records (Abt 2022, Exhibit 2-1).
 earningsImpactYears2to7:[5222,7011,7581,7789,8076,8251],
 controlEarningsYears2to7:[13978,17320,20277,23243,26363,27338],
 // Share of the gross earnings gain that is net household welfare: after income/payroll/sales
 // taxes (27.7%), lost means-tested benefits (13.0%), work costs (1.3%) and foregone
 // nonmarket time (13.8%), all as shares of the seven-year earnings benefit in Exhibit 5-4.
 // Fringe benefits (+41.5% of earnings) are excluded centrally.
 netWelfareShare:0.5,
 baseIncome:25000, // personal-income reference between control earnings ($21.4K) and survey personal income ($30.3K)
 laterBaseIncome:28000,
 laterYears:5, // years 8-12, unobserved
 laterPersistence:0.5, // share of the year-7 gain assumed to remain after the trial window
 transferToCurrentProgram:0.6, // judgment: current mix includes the college-based PTC model, whose early RCT found no earnings effect
 nonDisplacement:0.85, // judgment: share of participant gains not taken from other job seekers
 discountRate:0.03,
};

const mean=xs=>xs.reduce((a,b)=>a+b,0)/xs.length;
export const derived={
 wholeCostPerParticipant:inputs.totalExpense2023/inputs.participantsPerYear,
 paceCost2025:inputs.paceCostPerParticipant2014*inputs.cpi2014to2025,
 philanthropyShare2025:inputs.pacePhilanthropyNetCost2014*inputs.cpi2014to2025,
 grossGainYears2to7:mean(inputs.earningsImpactYears2to7),
 controlMeanYears2to7:mean(inputs.controlEarningsYears2to7),
};

function pathways(o={}){
 const p={...inputs,...o};
 const causalFactors={transferToCurrentProgram:p.transferToCurrentProgram,nonDisplacement:p.nonDisplacement};
 const causalShare=p.transferToCurrentProgram*p.nonDisplacement;
 const common={people:p.cohort,editionShare:1,independentShare:1,discountRate:p.discountRate,causalFactors,causalShare,sourceIds:['abt-2022','abt-2022-cba']};
 const out=[{...common,id:'observed-years-2-7',annualIncomeBeforeUSD:p.baseIncome,annualIncomeGainUSD:derived.grossGainYears2to7*p.netWelfareShare,years:6,delayYears:1,
  rationale:'Mean randomized earnings impact in follow-up years 2-7 ($7,322), converted to net household welfare by the netWelfareShare, for the additional cohort. Year 1 lost earnings are roughly offset by Year Up stipends and are omitted.',
  counterfactual:'The control group could use any other training, college or job; the trial impact is already net of those alternatives.'}];
 if(p.laterYears>0&&p.laterPersistence>0)out.push({...common,id:'unobserved-years-8-plus',annualIncomeBeforeUSD:p.laterBaseIncome,annualIncomeGainUSD:inputs.earningsImpactYears2to7.at(-1)*p.netWelfareShare*p.laterPersistence,years:p.laterYears,delayYears:7,
  rationale:'Judgment that part of the year-7 gain persists after the trial window; no earnings data exist beyond year 7.',
  counterfactual:'Same as the observed pathway; persistence is a hypothesis, not an observed effect.'});
 return out;
}
const hye=ps=>ps.reduce((s,p)=>s+incomeHealthyYearEquivalent(p),0);

const scenarioDefs=[
 ['central','Whole-organization cost, transferred trial earnings',{},derived.wholeCostPerParticipant,
  'Cost is CY2023 total expense divided by about 4,000 participants a year. Benefits are the randomized years 2-7 earnings gains, half retained as net welfare, scaled by 0.6 for transfer to the current program mix and 0.85 for displacement, plus half of the year-7 gain for five unobserved years.'],
 ['philanthropy-share-cost','Donor pays only the philanthropic share of an added slot',{},derived.philanthropyShare2025,
  'Assumes employer internship fees scale with each added participant, so a donor funds only the philanthropic net cost observed in PACE ($9,960 in 2013-14 dollars). Employer demand for more interns is unverified.'],
 ['pace-program-as-evaluated','Evaluated 2013-14 program at its own cost',{transferToCurrentProgram:1},derived.paceCost2025,
  'The core program exactly as randomized, at its inflation-adjusted per-participant cost; no transfer discount.'],
 ['no-gain-after-year-7','Gains stop after the trial window',{laterPersistence:0},derived.wholeCostPerParticipant,'Central, but no earnings gain is credited after year 7.'],
 ['full-persistence-to-year-12','Year-7 gain fully persists to year 12',{laterPersistence:1},derived.wholeCostPerParticipant,'Central, with the full year-7 gain lasting five more years.'],
 ['fringe-benefits-half-valued','Count half of the employer fringe-benefit gain',{netWelfareShare:0.7},derived.wholeCostPerParticipant,'Central, adding half of the fringe-benefit gain (about 0.2 of earnings) to net welfare.'],
 ['after-tax-only','Count earnings after taxes and lost benefits, ignore nonmarket time',{netWelfareShare:0.58},derived.wholeCostPerParticipant,'Central, without subtracting the value of foregone nonmarket time.'],
 ['low-transfer','Current program delivers half the transferred effect',{transferToCurrentProgram:0.3},derived.wholeCostPerParticipant,'Central, with a stronger discount for the current program mix and labor market.'],
 ['high-displacement','Larger displacement of other workers',{nonDisplacement:0.6},derived.wholeCostPerParticipant,'Central, assuming 40% of gains come at other job seekers’ expense.'],
 ['discount-5pct','5% discount rate',{discountRate:0.05},derived.wholeCostPerParticipant,'Central, discounted at 5% as in the Abt cost-benefit analysis.'],
 ['ptc-null','No earnings effect (as in the early college-based PTC trial)',{transferToCurrentProgram:0},derived.wholeCostPerParticipant,'If an added slot buys the college-based model and its early null earnings result holds, there is no credited benefit.'],
];

export function scenarios(){
 return scenarioDefs.map(([id,label,o,costPer,assumptions])=>{
  const ps=pathways(o).filter(p=>p.causalShare>0);
  const s={id,label,costUSD:costPer*inputs.cohort,allPopulationQalys:0,editionQalys:0,assumptions};
  if(ps.length)s.incomePathways=ps.map(({id:_,...p})=>p);else s.incomePathways=[];
  return s;
 });
}
export function price(s){const income=hye(s.incomePathways);return income>0?10*s.costUSD/income:null;}

if(import.meta.url===`file://${process.argv[1]}`){
 console.log(JSON.stringify(derived));
 for(const s of scenarios()){const p=price(s);console.log(s.id.padEnd(30),'income-eq years',hye(s.incomePathways).toFixed(3),'per better life',p?Math.round(p):'none','per DALY',p?Math.round(p/10):'none');}
}
