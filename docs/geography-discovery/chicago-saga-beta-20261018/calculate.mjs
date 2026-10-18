// Saga Education (Chicago, in-depth) calculator, 2026-10-18.
//   node docs/geography-discovery/chicago-saga-beta-20261018/calculate.mjs
// Adult earnings gains are inferred from randomized math-score gains using the
// test-score/earnings association the trial authors themselves apply. Health = 0.
import {incomeHealthyYearEquivalent} from '../../../lib/income-health-equivalence.mjs';

export const inputs={
 cohort:100,
 totalExpenseFY2023:27184992, // Saga Innovations (EIN 47-2168942), FY ending June 2023
 directStudentsFY2025:3083,    // Direct Services students, 2024-25 annual report
 researchCostPerStudent2015:3800, // authors' best estimate, 2013-15 study period
 cpi2015to2025:1.37,           // judgment: approximate CPI-U change
 persistentEffectSD:0.22,      // pooled TOT math effect in 11th grade, 1-2 years after tutoring
 percentilesPerSD:6/0.16,      // study 1: 0.16 SD = 6 percentile points
 earningsPerPercentile2010:150,// Chetty et al. (2011): $ annual earnings at age 27 per 8th-grade percentile
 cpi2010to2025:1.47,           // judgment: approximate CPI-U change
 causalScoreToEarnings:0.5,    // judgment: share of the cross-sectional score-earnings link that is causal for tutoring gains
 transferToCurrentProgram:0.8, // judgment: current Direct model vs 2013-15 trial; later trials found 0.19-0.23 SD
 nonDisplacement:0.9,          // judgment: skill gains are mostly not zero-sum
 editionShare:0.8,             // judgment: share of adult years lived in the Chicago metro
 netWelfareShare:0.6,          // judgment: share of gross earnings left after taxes and lost benefits
 adultBaseIncome:35000,        // judgment: adult personal income reference for these students
 years:35, delayYears:10,      // ages 25-59, counted from age 15
 discountRate:0.03,
};
export const derived={
 wholeCostPerDirectStudent:inputs.totalExpenseFY2023/inputs.directStudentsFY2025,
 researchCost2025:inputs.researchCostPerStudent2015*inputs.cpi2015to2025,
 grossEarningsGain:inputs.persistentEffectSD*inputs.percentilesPerSD*inputs.earningsPerPercentile2010*inputs.cpi2010to2025,
};
function pathway(o={}){
 const p={...inputs,...o};
 const causalFactors={causalScoreToEarnings:p.causalScoreToEarnings,transferToCurrentProgram:p.transferToCurrentProgram,nonDisplacement:p.nonDisplacement};
 const causalShare=p.causalScoreToEarnings*p.transferToCurrentProgram*p.nonDisplacement;
 return {people:p.cohort,annualIncomeBeforeUSD:p.adultBaseIncome,annualIncomeGainUSD:(o.grossEarningsGain??derived.grossEarningsGain)*p.netWelfareShare,years:p.years,delayYears:p.delayYears,discountRate:p.discountRate,editionShare:p.editionShare,independentShare:1,causalFactors,causalShare,
  sourceIds:['saga-wp','chetty-2011'],
  rationale:'Persistent randomized math gain (0.22 SD in 11th grade) mapped to adult earnings with the Chetty et al. percentile association the trial authors use, then discounted for causality, transfer and displacement; net of taxes and lost benefits.',
  counterfactual:'The randomized control group received the regular CPS schedule (often double-dose Algebra); the effect is net of that alternative.'};
}
const defs=[
 ['central','Whole-organization cost per Direct student, causal half of the score-earnings link',{},()=>derived.wholeCostPerDirectStudent,'FY2023 total expense over 2024-25 Direct students (all Widespread and technology work charged to Direct students); persistent 0.22 SD gain; half the Chetty association treated as causal; 0.8 transfer; 0.9 non-displacement; 0.8 Chicago residence; 60% net welfare.'],
 ['research-cost','Program cost as measured in the trials',{},()=>derived.researchCost2025,'Central benefits at the authors’ $3,800 per-student cost, inflated to 2025.'],
 ['full-association','Full score-earnings association is causal',{causalScoreToEarnings:1},()=>derived.wholeCostPerDirectStudent,'As the trial authors assume.'],
 ['quarter-association','Only a quarter of the association is causal',{causalScoreToEarnings:0.25},()=>derived.wholeCostPerDirectStudent,'Stronger fade-out or weaker causal link from test scores to earnings.'],
 ['study1-only','Smaller study-1 immediate effect only',{grossEarningsGain:0.16*inputs.percentilesPerSD*inputs.earningsPerPercentile2010*inputs.cpi2010to2025},()=>derived.wholeCostPerDirectStudent,'Uses 0.16 SD instead of the pooled persistent 0.22 SD.'],
 ['low-transfer','Current program half as effective as the trials',{transferToCurrentProgram:0.4},()=>derived.wholeCostPerDirectStudent,'Scale-up or implementation drift halves the transferred effect.'],
 ['all-local','All adult years in the Chicago metro',{editionShare:1},()=>derived.wholeCostPerDirectStudent,'No out-migration discount.'],
 ['discount-5pct','5% discount rate',{discountRate:0.05},()=>derived.wholeCostPerDirectStudent,'As in the authors’ benefit-cost calculation.'],
 ['no-earnings-effect','Test-score gains do not change adult earnings',{causalScoreToEarnings:0},()=>derived.wholeCostPerDirectStudent,'Full fade-out of any earnings effect.'],
];
export function scenarios(){return defs.map(([id,label,o,cost,assumptions])=>{const p=pathway(o);return {id,label,costUSD:cost()*inputs.cohort,allPopulationQalys:0,editionQalys:0,assumptions,incomePathways:p.causalShare>0?[p]:[]};});}
export const hye=ps=>ps.reduce((s,p)=>s+incomeHealthyYearEquivalent(p),0);
export function price(s){const i=hye(s.incomePathways);return i>0?10*s.costUSD/i:null;}
if(import.meta.url===`file://${process.argv[1]}`){console.log(JSON.stringify(derived));for(const s of scenarios()){const p=price(s);console.log(s.id.padEnd(22),hye(s.incomePathways).toFixed(3),p?Math.round(p):'none',p?'per DALY '+Math.round(p/10):'');}}
